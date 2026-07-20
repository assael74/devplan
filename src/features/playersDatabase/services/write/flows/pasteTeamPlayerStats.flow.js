// features/playersDatabase/services/write/flows/pasteTeamPlayerStats.flow.js

import {
  updateLeagueSeasonTableRankScoutProfilesSummary,
} from '../leagues/index.js'
import {
  syncPlayerScoutProfileDocsMany,
} from '../players/index.js'
import {
  updatePlayerSeasonSearchIndexStatsMany,
  updateTeamSeasonSearchIndexScoutProfilesSummary,
} from '../searchIndex/index.js'
import {
  ensureTeamDoc,
  updateTeamSeasonPlayerStats,
} from '../teams/index.js'
import {
  buildScoutProfilesSummary,
} from './shared.js'

export async function pasteTeamPlayerStatsFlow(payload = {}) {
  const teamDocResult = await ensureTeamDoc(payload.team || {})
  const team = {
    ...(payload.team || {}),
    birthTeamDocumentId: teamDocResult.birthTeamDocumentId,
    teamDocumentId: teamDocResult.teamDocumentId,
  }
  const teamSeasonResult = await updateTeamSeasonPlayerStats({
    ...payload,
    team,
  })
  const playerSeasonIndexResult = await updatePlayerSeasonSearchIndexStatsMany({
    ...payload,
    team,
  })
  const playerScoutProfileDocsResult = await syncPlayerScoutProfileDocsMany({
    ...payload,
    team,
  })
  const scoutProfilesSummary = buildScoutProfilesSummary(payload.players)
  const leagueTableRankScoutProfilesResult = await updateLeagueSeasonTableRankScoutProfilesSummary({
    ...payload,
    team,
    scoutProfilesSummary,
  })
  const teamSeasonIndexScoutProfilesResult = await updateTeamSeasonSearchIndexScoutProfilesSummary({
    ...payload,
    team,
    scoutProfilesSummary,
  })

  return {
    teamDocResult,
    teamSeasonResult,
    playerSeasonIndexResult,
    playerScoutProfileDocsResult,
    leagueTableRankScoutProfilesResult,
    teamSeasonIndexScoutProfilesResult,
    rowsCount: playerSeasonIndexResult.rowsCount,
  }
}

