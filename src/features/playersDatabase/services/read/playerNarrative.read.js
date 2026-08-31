// src/features/playersDatabase/services/read/playerNarrative.read.js

import {
  adaptBirthTeamDocumentSeason,
} from '../../domain/index.js'
import { buildNarrativePlan } from '../../domain/narrative/index.js'
import { isSameSeason } from '../../model/season.model.js'
import { getTeamSeason } from './teamSeason.js'

const clean = value => String(value || '').trim()

const getTeamDocumentId = season => clean(
  season?.team?.teamDocumentId || season?.team?.teamId
)

const adaptTeamSeason = ({ teamSeasonDocument, playerSeason }) => {
  if (!teamSeasonDocument || !isSameSeason(teamSeasonDocument, playerSeason?.season || {})) return null

  const result = adaptBirthTeamDocumentSeason({
    teamDocument: {},
    seasonDocument: teamSeasonDocument,
  })

  return {
    ...result,
    ranking: {
      ...result.ranking,
      tableRank: teamSeasonDocument.tableRank === undefined ? null : Number(teamSeasonDocument.tableRank),
      attackRank: teamSeasonDocument.tableAttackRank === undefined ? null : Number(teamSeasonDocument.tableAttackRank),
      defenseRank: teamSeasonDocument.tableDefenseRank === undefined ? null : Number(teamSeasonDocument.tableDefenseRank),
    },
    performance: teamSeasonDocument.teamScout || teamSeasonDocument.performance || result.performance,
    completeness: {
      ...result.completeness,
      hasRanking: teamSeasonDocument.tableRank !== undefined && teamSeasonDocument.tableRank !== null,
      hasPerformance: Boolean(teamSeasonDocument.teamScout || teamSeasonDocument.performance),
    },
  }
}

const readNarrativeTeams = async seasons => {
  const rows = Array.isArray(seasons) ? seasons : []
  const teams = await Promise.all(rows.map(async playerSeason => {
    const teamSeasonDocument = await getTeamSeason({
      birthTeamDocumentId: getTeamDocumentId(playerSeason),
      seasonKey: playerSeason?.season?.seasonKey || playerSeason?.season?.seasonId,
    })

    return adaptTeamSeason({ teamSeasonDocument, playerSeason })
  }))

  return teams.filter(Boolean)
}

export const readPlayerNarrativePlan = async ({ playerDomain = {} } = {}) => {
  const seasons = Array.isArray(playerDomain.seasons) ? playerDomain.seasons : []
  const teams = await readNarrativeTeams(seasons)

  return buildNarrativePlan({
    player: playerDomain.identity || {},
    seasons,
    teams,
    events: playerDomain.events || [],
    narrative: playerDomain.narrative || null,
  })
}
