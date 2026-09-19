// src/features/playersDatabase/services/write/flows/team/updateTeamUrl.flow.js

import { buildWriteFlowSyncError } from '../writeFlowSyncError.js'
import { updateLeagueSeasonTableRankTeamUrl } from '../../leagues/index.js'
import {
  updatePlayerSeasonSearchIndexTeamUrl,
  updateTeamSeasonSearchIndexTeamUrl,
} from '../../searchIndex/index.js'
import { updateTeamSeasonTeamUrl } from '../../teams/index.js'

const clean = value => String(value || '').trim()


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

const assertTeamSeasonUpdated = result => {
  if (result?.updated) return

  const error = new Error('עונת הקבוצה לא נמצאה')
  error.code = result?.reason || 'team-season-url-not-updated'
  throw error
}

const assertTeamSeasonIndexUpdated = result => {
  if (result?.updated) return

  const error = new Error('אינדקס עונת הקבוצה לא נמצא')
  error.code = result?.reason || 'team-season-index-url-not-updated'
  throw error
}

const buildPreCanonicalSyncError = ({ stage, cause, results }) => {
  const error = buildWriteFlowSyncError({
    name: 'TeamUrlSyncError',
    fallbackMessage: 'Team URL sync failed',
    stage,
    cause,
    results,
  })

  error.completed = false
  return error
}

const buildPostCanonicalSyncError = ({ stage, cause, results }) => {
  const error = buildWriteFlowSyncError({
    name: 'TeamUrlSyncError',
    fallbackMessage: 'Team URL sync failed',
    stage,
    cause,
    results,
  })

  error.teamCanonicalCommitted = true
  error.completed = false
  error.projectionsCompleted = false
  error.recoveryRequired = true
  return error
}

export async function updateTeamUrlFlow(payload = {}) {
  const results = {}
  const leagueId = clean(
    payload.league?.id ||
    payload.season?.leagueId ||
    payload.team?.leagueId
  )
  const seasonId = clean(payload.season?.seasonId || payload.season?.seasonKey)
  const birthTeamId = clean(
    payload.team?.birthTeamId ||
    payload.team?.teamId ||
    payload.team?.birthTeamDocumentId ||
    payload.team?.teamDocumentId ||
    payload.team?.id
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
    results.teamSeasonResult = await updateTeamSeasonTeamUrl(nextPayload)
    assertTeamSeasonUpdated(results.teamSeasonResult)
  } catch (error) {
    throw buildPreCanonicalSyncError({
      stage: 'updateTeamSeasonTeamUrl',
      cause: error,
      results,
    })
  }

  try {
    results.leagueTableRankResult = await updateLeagueSeasonTableRankTeamUrl(nextPayload)
    assertLeagueRowUpdated(results.leagueTableRankResult)
  } catch (error) {
    throw buildPostCanonicalSyncError({
      stage: 'updateLeagueSeasonTableRankTeamUrl',
      cause: error,
      results,
    })
  }

  try {
    results.teamSeasonIndexResult = await updateTeamSeasonSearchIndexTeamUrl({
      ...nextPayload,
      teamSeasonDocumentId: results.teamSeasonResult?.updated
        ? results.teamSeasonResult.teamSeasonDocumentId
        : '',
    })
    assertTeamSeasonIndexUpdated(results.teamSeasonIndexResult)
  } catch (error) {
    throw buildPostCanonicalSyncError({
      stage: 'updateTeamSeasonSearchIndexTeamUrl',
      cause: error,
      results,
    })
  }

  try {
    results.playerSeasonIndexesResult = await updatePlayerSeasonSearchIndexTeamUrl(nextPayload)
  } catch (error) {
    throw buildPostCanonicalSyncError({
      stage: 'updatePlayerSeasonSearchIndexTeamUrl',
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
    teamCanonicalCommitted: true,
    projectionsCompleted: true,
    completed: true,
    recoveryRequired: false,
    syncStatus: 'complete',
    optionalSync: {
      teamDocumentUpdated: Boolean(results.teamSeasonResult?.updated),
      teamIndexUpdated: Boolean(results.teamSeasonIndexResult?.updated),
    },
  }
}
