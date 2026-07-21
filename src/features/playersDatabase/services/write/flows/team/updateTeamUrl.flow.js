// features/playersDatabase/services/write/flows/team/updateTeamUrl.flow.js

import {
  updateLeagueSeasonTableRankTeamUrl,
} from '../../leagues/index.js'
import {
  updateTeamSeasonSearchIndexTeamUrl,
} from '../../searchIndex/index.js'
import {
  updateTeamSeasonTeamUrl,
} from '../../teams/index.js'

const clean = value => String(value || '').trim()

const buildSyncError = ({ stage, cause, results = {} }) => {
  const error = new Error(cause?.message || `Team URL sync failed at ${stage}`)

  error.name = 'TeamUrlSyncError'
  error.stage = stage
  error.cause = cause
  error.results = results

  return error
}

const assertLeagueRowUpdated = result => {
  if (result?.updated) return

  const error = new Error(
    result?.reason === 'leagueSeasonMissing'
      ? 'עונה לא נמצאה במסמך הליגה'
      : result?.reason === 'leagueTeamRowMissing'
        ? 'הקבוצה לא נמצאה בטבלת הליגה'
        : result?.reason === 'leagueDocMissing'
          ? 'מסמך הליגה לא נמצא'
          : 'עדכון קישור הקבוצה במסמך הליגה נכשל'
  )
  error.code = result?.reason || 'league-team-url-not-updated'
  throw error
}

export async function updateTeamUrlFlow(payload = {}) {
  const results = {}
  const leagueId = clean(
    payload.league?.id ||
    payload.season?.leagueId ||
    payload.team?.leagueId
  )
  const seasonId = clean(payload.season?.seasonId)
  const birthTeamId = clean(
    payload.team?.birthTeamId ||
    payload.team?.teamId
  )
  const teamUrl = clean(payload.team?.teamUrl)
  const team = {
    ...(payload.team || {}),
    leagueId,
    birthTeamId,
    teamId: birthTeamId,
    teamUrl,
  }
  const season = {
    ...(payload.season || {}),
    leagueId,
    seasonId,
  }
  const nextPayload = {
    ...payload,
    league: {
      ...(payload.league || {}),
      id: leagueId,
    },
    season,
    team,
  }

  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId) throw new Error('Missing season id')
  if (!birthTeamId) throw new Error('Missing birth team id')

  try {
    results.leagueTableRankResult = await updateLeagueSeasonTableRankTeamUrl(nextPayload)
    assertLeagueRowUpdated(results.leagueTableRankResult)
  } catch (error) {
    throw buildSyncError({
      stage: 'updateLeagueSeasonTableRankTeamUrl',
      cause: error,
      results,
    })
  }

  try {
    results.teamSeasonResult = await updateTeamSeasonTeamUrl(nextPayload)
  } catch (error) {
    throw buildSyncError({
      stage: 'updateTeamSeasonTeamUrl',
      cause: error,
      results,
    })
  }

  try {
    results.teamSeasonIndexResult = await updateTeamSeasonSearchIndexTeamUrl(nextPayload)
  } catch (error) {
    throw buildSyncError({
      stage: 'updateTeamSeasonSearchIndexTeamUrl',
      cause: error,
      results,
    })
  }

  return {
    ...results,
    leagueId,
    seasonId,
    birthTeamId,
    teamUrl,
    syncStatus: 'complete',
    optionalSync: {
      teamDocumentUpdated: Boolean(results.teamSeasonResult?.updated),
      teamIndexUpdated: Boolean(results.teamSeasonIndexResult?.updated),
    },
  }
}
