// src/features/playersDatabase/domain/orchestration/buildLeagueTeamSeasons.js

import { SCOUTING_MODEL_VERSION } from '../../../../shared/scouting/scouting.version.js'
import {
  buildTeamScoutLeagueModel,
  TEAM_SCOUT_NORMALIZATION_MODE,
  TEAM_SCOUT_SORT_MODE,
} from '../../../../shared/scouting/teams/index.js'
import { adaptLeagueTableTeam } from '../adapters/leagueTableTeam.adapter.js'
import { adaptTeamScoutEngineRow } from '../adapters/teamScoutEngine.adapter.js'
import { enrichTeamScoutInputRows } from '../adapters/teamScoutInput.adapter.js'
import { cleanDomainValue } from '../contracts/domainValue.contract.js'

const resolveTeamKey = value => cleanDomainValue(
  value?.birthTeamId ||
  value?.teamId ||
  value?.teamDocumentId ||
  value?.birthTeamDocumentId ||
  value?.clubId ||
  value?.id ||
  value?.rank
)

function pickRank(value, fallback) {
  return value === null || value === undefined
    ? fallback
    : value
}

export const buildLeagueTeamSeasons = ({
  leagueDocument = {},
  seasonDocument = {},
  target = 'current',
} = {}) => {
  const leagueSource = leagueDocument && typeof leagueDocument === 'object'
    ? leagueDocument
    : {}
  const seasonSource = seasonDocument && typeof seasonDocument === 'object'
    ? seasonDocument
    : {}

  const tableRows = Array.isArray(seasonSource.tableRank)
    ? seasonSource.tableRank
    : []
  const leagueLevel = leagueSource.level || leagueSource.leagueLevel || null
  const leagueNumGames = seasonSource.leagueTotalRound || 30
  const persistedPerformanceContext = seasonSource.teamPerformanceContext || {}
  const persistedFactor = Number(persistedPerformanceContext.appliedFactor)
  const hasPersistedFactor = Number.isFinite(persistedFactor) && persistedFactor > 0

  const engineResult = buildTeamScoutLeagueModel({
    leagueLevel,
    leagueNumGames,
    rows: enrichTeamScoutInputRows(tableRows),
    normalizationMode: hasPersistedFactor
      ? TEAM_SCOUT_NORMALIZATION_MODE.MANUAL
      : TEAM_SCOUT_NORMALIZATION_MODE.AUTO,
    normalizationFactor: hasPersistedFactor ? persistedFactor : undefined,
    sortMode: TEAM_SCOUT_SORT_MODE.TABLE,
  })

  const performanceByTeam = new Map(
    (Array.isArray(engineResult?.rows) ? engineResult.rows : []).map(row => [
      resolveTeamKey(row),
      adaptTeamScoutEngineRow({
        row,
        source: {
          normalization: {
            mode: persistedPerformanceContext.normalizationMode || engineResult?.normalization?.mode,
            factor: hasPersistedFactor
              ? persistedFactor
              : engineResult?.normalization?.appliedFactor,
            applied: hasPersistedFactor
              ? persistedFactor !== 1
              : Boolean(engineResult?.normalization?.applied),
          },
          leagueLevel: engineResult?.leagueLevel || leagueLevel,
          leagueGames: engineResult?.leagueNumGames || leagueNumGames,
          engineVersion: SCOUTING_MODEL_VERSION,
          calculatedAt: seasonSource.updatedAt || null,
        },
      }),
    ])
  )

  return tableRows.map(tableRow => {
    const teamSeason = adaptLeagueTableTeam({
      leagueDocument: leagueSource,
      seasonDocument: seasonSource,
      tableRow,
      target,
    })
    const performance = performanceByTeam.get(resolveTeamKey(tableRow))

    return {
      ...teamSeason,
      performance: performance || teamSeason.performance,
      ranking: {
        ...teamSeason.ranking,
        attackRank: pickRank(performance?.offense?.rank, teamSeason.ranking.attackRank),
        defenseRank: pickRank(performance?.defense?.rank, teamSeason.ranking.defenseRank),
      },
      completeness: {
        ...teamSeason.completeness,
        hasPerformance: Boolean(performance),
      },
    }
  })
}
