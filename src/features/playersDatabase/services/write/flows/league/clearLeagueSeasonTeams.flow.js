// features/playersDatabase/services/write/flows/league/clearLeagueSeasonTeams.flow.js

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
import { attachWriteFlowReport } from '../writeFlowReport.js'

const FLOW = 'clearLeagueSeasonTeams'

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

    const playerDocumentIds = Array.from(new Set([
      ...(Array.isArray(team.playerDocumentIds)
        ? team.playerDocumentIds
        : []),
      ...(Array.isArray(teamResult.playerDocumentIds)
        ? teamResult.playerDocumentIds
        : []),
    ].filter(Boolean)))

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

  const masterResult = await runStage({
    stage: 'syncLeaguesMasterDocument',
    results,
    action: () => syncLeaguesMasterDocument({
      leagues: [payload.league],
    }),
  })

  return {
    status: 'complete',
    syncStatus: 'complete',
    completed: true,
    removedTeamsCount:
      leagueSeasonResult.removedTeamsCount ||
      teams.length,
    removedSearchIndexesCount: searchIndexesResult.rowsCount || 0,
    metaResult,
    teamSeasonResults,
    playerSeasonDocsResults,
    searchIndexesResult,
    leagueSeasonResult,
    masterResult,
  }
}
