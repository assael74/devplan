// src/features/playersDatabase/services/write/flows/league/clearLeagueSeasonTeams.flow.js

import {
  clearLeagueSeasonTeams,
  getLeagueSeasonTeams,
  syncLeaguesMasterDocument,
} from '../../leagues/index.js'
import { removePlayerSeasonDocsMany } from '../../players/index.js'
import {
  deleteSearchIndexesForLeagueSeason,
  getSearchIndexMetaForLeagueSeason,
} from '../../searchIndex/index.js'
import { removeTeamSeason } from '../../teams/index.js'
import {
  removeClubProjectionsForLeagueSeason,
  removeLeagueClubSeasonIdentityIndex,
} from '../../clubs/index.js'
import { getTeamSeason } from '../../../read/entities/teamSeason.js'
import { attachWriteFlowReport } from '../writeFlowReport.js'

const FLOW = 'clearLeagueSeasonTeams'

const resolveTeamIdentity = team => {
  const birthTeamDocumentId = String(
    team?.birthTeamId ||
    team?.teamId ||
    team?.birthTeamDocumentId ||
    team?.teamDocumentId ||
    team?.id ||
    ''
  ).trim()

  return birthTeamDocumentId
}

const hasCanonicalPlayers = teamSeason =>
  Array.isArray(teamSeason?.teamPlayers) && teamSeason.teamPlayers.length > 0

const runStage = async ({ stage, results, action }) => {
  try {
    const result = await action()
    results[stage] = result
    return result
  } catch (error) {
    throw attachWriteFlowReport({
      error,
      stage,
      results,
      flow: FLOW,
    })
  }
}

const runPostCanonicalProjectionStage = async ({ stage, results, action }) => {
  try {
    const result = await action()
    results[stage] = result
    return result
  } catch (error) {
    error.leagueCanonicalCommitted = true
    error.projectionsCompleted = false
    error.recoveryRequired = true
    error.completed = false
    throw attachWriteFlowReport({
      error,
      stage,
      results,
      flow: FLOW,
    })
  }
}

export async function clearLeagueSeasonTeamsFlow(payload = {}) {
  const results = {}
  const metaResult = await runStage({
    stage: 'getSearchIndexMetaForLeagueSeason',
    results,
    action: () => getSearchIndexMetaForLeagueSeason(payload),
  })

  const leagueSeasonSnapshot = await runStage({
    stage: 'getLeagueSeasonTeams',
    results,
    action: () => getLeagueSeasonTeams(payload),
  })

  const indexedTeams = Array.isArray(metaResult.teams)
    ? metaResult.teams
    : []
  const indexedTeamMap = new Map(indexedTeams.map(team => [
    `${team.birthTeamId}__${team.birthTeamSlot || 1}`,
    team,
  ]))
  const leagueTeams = Array.isArray(leagueSeasonSnapshot.teams)
    ? leagueSeasonSnapshot.teams
    : []

  // League table flags are projections and may be stale after an interrupted
  // roster clear. Deletion safety must be decided by Team Season itself.
  const canonicalTeamSeasons = await runStage({
    stage: 'getCanonicalTeamSeasonsForDeleteValidation',
    results,
    action: async () => Promise.all(leagueTeams.map(async team => {
      const birthTeamDocumentId = resolveTeamIdentity(team)
      if (!birthTeamDocumentId) return null

      return getTeamSeason({
        birthTeamDocumentId,
        seasonKey: payload.season?.seasonKey || payload.season?.seasonId,
        bypassCache: true,
      })
    })),
  })

  if (canonicalTeamSeasons.some(hasCanonicalPlayers)) {
    const error = new Error('League teams cannot be deleted while player rosters exist')
    error.code = 'league-season-has-players'

    throw attachWriteFlowReport({
      error,
      stage: 'validateLeagueSeasonTeamsDelete',
      results,
      flow: FLOW,
    })
  }

  const teamMap = new Map(indexedTeamMap)

  leagueTeams.forEach(team => {
    const birthTeamId = String(
      team.birthTeamId ||
      team.teamId ||
      team.birthTeamDocumentId ||
      team.teamDocumentId ||
      team.id ||
      ''
    ).trim()
    const birthTeamSlot = Number(team.birthTeamSlot || team.teamSlot || 1) || 1
    if (!birthTeamId) return

    const key = `${birthTeamId}__${birthTeamSlot}`
    teamMap.set(key, {
      ...(teamMap.get(key) || {}),
      ...team,
      birthTeamId,
      teamId: birthTeamId,
      birthTeamSlot,
      teamSlot: birthTeamSlot,
      leagueId: payload.league?.id || payload.season?.leagueId || team.leagueId,
      playerDocumentIds: teamMap.get(key)?.playerDocumentIds || [],
    })
  })

  const teams = Array.from(teamMap.values())
  const teamSeasonResults = []
  const playerSeasonDocsResults = []

  for (const team of teams) {
    const teamResult = await runStage({
      stage: `removeTeamSeason:${team.birthTeamId}:${team.birthTeamSlot}`,
      results,
      action: () => removeTeamSeason({
        ...payload,
        team,
      }),
    })
    teamSeasonResults.push(teamResult)

    const playerDocumentIds = Array.isArray(teamResult.playerDocumentIds)
      ? teamResult.playerDocumentIds
      : []

    const playerDocsResult = await runStage({
      stage: `removePlayerSeasonDocsMany:${team.birthTeamId}:${team.birthTeamSlot}`,
      results,
      action: () => removePlayerSeasonDocsMany({
        ...payload,
        team,
        playerDocumentIds,
      }),
    })
    playerSeasonDocsResults.push(playerDocsResult)
  }

  const searchIndexesResult = await runStage({
    stage: 'deleteSearchIndexesForLeagueSeason',
    results,
    action: () => deleteSearchIndexesForLeagueSeason(payload),
  })

  const leagueSeasonResult = await runStage({
    stage: 'clearLeagueSeasonTeams',
    results,
    action: () => clearLeagueSeasonTeams(payload),
  })

  const clubSeasonIdentityIndexResult = await runPostCanonicalProjectionStage({
    stage: 'removeClubSeasonIdentityIndex',
    results,
    action: () => removeLeagueClubSeasonIdentityIndex({
      league: payload.league || {},
      season: payload.season || {},
      lastWriteAction: 'CLEAR_LEAGUE_SEASON_TEAMS',
    }),
  })

  const clubProjectionTeams = leagueTeams.map(team => {
    const teamId = String(team?.teamId || team?.birthTeamId || '').trim()
    const teamSlot = Number(team?.birthTeamSlot || team?.teamSlot || 1) || 1
    return teamMap.get(`${teamId}__${teamSlot}`) || team
  })
  const clubProjectionsResult = await runPostCanonicalProjectionStage({
    stage: 'removeClubProjectionsForLeagueSeason',
    results,
    action: () => removeClubProjectionsForLeagueSeason({
      league: payload.league || {},
      season: payload.season || {},
      teams: clubProjectionTeams,
      canonicalCommitted: true,
      lastWriteAction: 'CLEAR_LEAGUE_SEASON_TEAMS',
    }),
  })

  const masterResult = await runPostCanonicalProjectionStage({
    stage: 'syncLeaguesMasterDocument',
    results,
    action: () => syncLeaguesMasterDocument({
      leagues: [payload.league],
    }),
  })

  return {
    status: 'complete',
    syncStatus: 'complete',
    leagueCanonicalCommitted: true,
    projectionsCompleted: Boolean(clubProjectionsResult.projectionsCompleted),
    recoveryRequired: !clubProjectionsResult.projectionsCompleted,
    completed: Boolean(clubProjectionsResult.projectionsCompleted),
    removedTeamsCount:
      leagueSeasonResult.removedTeamsCount ||
      teams.length,
    removedSearchIndexesCount: searchIndexesResult.rowsCount || 0,
    metaResult,
    teamSeasonResults,
    playerSeasonDocsResults,
    searchIndexesResult,
    leagueSeasonResult,
    clubSeasonIdentityIndexResult,
    clubProjectionsResult,
    masterResult,
  }
}
