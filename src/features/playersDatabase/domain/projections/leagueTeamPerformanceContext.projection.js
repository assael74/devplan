import {
  TEAM_SCOUT_PERFORMANCE_VERSION,
} from '../../../../shared/scouting/scouting.version.js'
import {
  buildTeamScoutLeagueModel,
  TEAM_SCOUT_NORMALIZATION_MODE,
  TEAM_SCOUT_SORT_MODE,
} from '../../../../shared/scouting/teams/index.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../catalog/clubs.catalog.js'
import {
  cleanValue,
  pickDefinedValue,
  toNumberOrZero,
} from '../../model/shared/value.model.js'

const resolveClubLevel = ({ clubId = '', clubLevel = null } = {}) => {
  const directClubLevel = Number(clubLevel)

  if (Number.isFinite(directClubLevel) && directClubLevel > 0) {
    return directClubLevel
  }

  const club = PLAYERS_DATABASE_CLUBS_CATALOG.find(item => (
    item.id === cleanValue(clubId)
  ))

  return toNumberOrZero(club?.clubLevel)
}

const resolveClubStrengthLevel = ({
  clubId = '',
  clubLevel = null,
  clubStrengthLevel = null,
} = {}) => {
  const directStrengthLevel = Number(clubStrengthLevel)

  if (Number.isFinite(directStrengthLevel) && directStrengthLevel > 0) {
    return directStrengthLevel
  }

  const club = PLAYERS_DATABASE_CLUBS_CATALOG.find(item => (
    item.id === cleanValue(clubId)
  ))
  const catalogStrengthLevel = Number(club?.clubStrengthLevel)

  if (Number.isFinite(catalogStrengthLevel) && catalogStrengthLevel > 0) {
    return catalogStrengthLevel
  }

  return resolveClubLevel({
    clubId,
    clubLevel,
  })
}

const buildScoutRows = rows => (
  (Array.isArray(rows) ? rows : []).map(row => {
    const clubLevel = resolveClubLevel({
      clubId: row.clubId,
      clubLevel: row.clubLevel,
    })
    const clubStrengthLevel = resolveClubStrengthLevel({
      clubId: row.clubId,
      clubLevel,
      clubStrengthLevel: row.clubStrengthLevel,
    })

    return {
      ...row,
      clubLevel,
      clubStrengthLevel,
    }
  })
)

export const buildLeagueTeamPerformanceContext = ({
  league = {},
  season = {},
  rows = [],
} = {}) => {
  const scoutRows = buildScoutRows(rows)
  const engineResult = buildTeamScoutLeagueModel({
    leagueLevel: league.level,
    leagueNumGames: season.leagueTotalRound || 30,
    rows: scoutRows,
    normalizationMode: TEAM_SCOUT_NORMALIZATION_MODE.AUTO,
    sortMode: TEAM_SCOUT_SORT_MODE.TABLE,
  })
  const normalization = engineResult?.normalization || {}

  return {
    version: TEAM_SCOUT_PERFORMANCE_VERSION,
    normalizationMode: (
      cleanValue(normalization.mode) ||
      TEAM_SCOUT_NORMALIZATION_MODE.AUTO
    ),
    appliedFactor: Number(normalization.appliedFactor) || 1,
    benchmarkGoalsPerTeamGame: pickDefinedValue(
      normalization.benchmarkGoalsPerTeamGame,
      null
    ),
    leagueGoalsPerTeamGame: pickDefinedValue(
      normalization.leagueGoalsPerTeamGame,
      null
    ),
    calculatedAt: season.updatedAt || new Date().toISOString(),
  }
}
