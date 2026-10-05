// src/features/playersDatabase/domain/league/leaguePerformance.builder.js

import {
  TEAM_SCOUT_PERFORMANCE_VERSION,
} from '../../../../shared/scouting/scouting.version.js'
import {
  buildTeamScoutLeagueModel,
  TEAM_SCOUT_NORMALIZATION_MODE,
  TEAM_SCOUT_SORT_MODE,
} from '../../../../shared/scouting/teams/index.js'
import { adaptTeamScoutEngineRow } from '../adapters/teamScoutEngine.adapter.js'
import { createEmptyTeamScout } from '../contracts/teamScout.contract.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const toNullableNumber = value => {
  if (value === null || value === undefined || value === '') return null

  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

const resolveEngineRow = ({ row, clubProfilesById }) => {
  const clubId = clean(row && row.clubId)
  const profile = clubProfilesById && typeof clubProfilesById === 'object'
    ? clubProfilesById[clubId] || {}
    : {}
  const officialTable = row && row.officialTable && typeof row.officialTable === 'object'
    ? row.officialTable
    : {}

  return {
    teamId: clean(row && row.teamId),
    clubId,
    clubLevel: toNullableNumber(profile.clubLevel),
    clubStrengthLevel: toNullableNumber(profile.clubStrengthLevel),
    rank: toNullableNumber(officialTable.rank),
    games: toNullableNumber(officialTable.teamGamePlayed),
    teamGamePlayed: toNullableNumber(officialTable.teamGamePlayed),
    points: toNullableNumber(officialTable.points),
    goalsFor: toNullableNumber(officialTable.goalsFor),
    goalsAgainst: toNullableNumber(officialTable.goalsAgainst),
  }
}

const resolveTeamKey = row => clean(row && row.teamId)

export const buildLeaguePerformanceProjection = ({
  context = {},
  clubProfilesById = {},
  calculatedAt = null,
} = {}) => {
  const canonicalRows = Array.isArray(context.canonicalRows) ? context.canonicalRows : []
  const leagueLevel = context.resolvedLeagueLevel
  const leagueTotalRound = context.resolvedLeagueTotalRound
  const engineRows = canonicalRows.map(row => (
    resolveEngineRow({ row, clubProfilesById })
  ))
  const performanceByTeamId = {}

  engineRows.forEach(row => {
    const empty = createEmptyTeamScout()
    performanceByTeamId[row.teamId] = {
      offense: empty.offense,
      defense: empty.defense,
    }
  })

  if (!leagueTotalRound) {
    return {
      performanceByTeamId,
      performanceCalculation: {
        engineVersion: TEAM_SCOUT_PERFORMANCE_VERSION,
        normalizationMode: TEAM_SCOUT_NORMALIZATION_MODE.AUTO,
        appliedFactor: null,
        calculatedAt,
      },
    }
  }

  const engineResult = buildTeamScoutLeagueModel({
    leagueLevel,
    leagueNumGames: leagueTotalRound,
    rows: engineRows,
    normalizationMode: TEAM_SCOUT_NORMALIZATION_MODE.AUTO,
    sortMode: TEAM_SCOUT_SORT_MODE.TABLE,
  })
  const normalization = engineResult && engineResult.normalization
    ? engineResult.normalization
    : {}

  ;(Array.isArray(engineResult && engineResult.rows) ? engineResult.rows : []).forEach(row => {
    const teamId = resolveTeamKey(row)
    if (!teamId) return

    const adapted = adaptTeamScoutEngineRow({
      row,
      source: {
        normalization: {
          mode: normalization.mode,
          factor: normalization.appliedFactor,
          applied: Boolean(normalization.applied),
        },
        leagueLevel,
        leagueGames: leagueTotalRound,
        engineVersion: TEAM_SCOUT_PERFORMANCE_VERSION,
        calculatedAt,
      },
    })

    performanceByTeamId[teamId] = {
      offense: adapted.offense,
      defense: adapted.defense,
    }
  })

  return {
    performanceByTeamId,
    performanceCalculation: {
      engineVersion: TEAM_SCOUT_PERFORMANCE_VERSION,
      normalizationMode: clean(normalization.mode) || TEAM_SCOUT_NORMALIZATION_MODE.AUTO,
      appliedFactor: toNullableNumber(normalization.appliedFactor),
      calculatedAt,
    },
  }
}
