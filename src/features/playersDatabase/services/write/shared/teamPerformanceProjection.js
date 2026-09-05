// Canonical League Table -> Team Performance projection.
//
// Team performance facts belong to the league table.  Roster and player-stats
// imports may add team metadata, players, balance and scouting, but must not
// recalculate or replace these facts from their own payloads.

import {
  isSameSeason,
  normalizeSeasonIdentity,
} from '../../../model/season.model.js'
import {
  normalizeTeamIdentity,
  resolveTeamLookupKey,
} from '../../../model/teamIdentity.model.js'
import { normalizeTeamStats } from '../../../model/teamStats.model.js'
import {
  cleanValue as clean,
  pickDefinedValue,
  toNumberOrZero,
} from '../../../model/value.model.js'

const isDefined = value => value !== undefined && value !== null && value !== ''

export const roundTeamPerformanceRate = value => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.round(number * 10) / 10 : 0
}

export const getLeagueTableRowRank = row => toNumberOrZero(
  pickDefinedValue(row?.position, row?.rank, row?.leaguePosition)
)

export const getLeagueTableRowStats = row => normalizeTeamStats(row || {}, {
  gamesCandidates: [row?.games, row?.teamGamePlayed, row?.teamStats?.teamGamePlayed],
  goalsForCandidates: [row?.goalsFor, row?.teamStats?.goalsFor],
  goalsAgainstCandidates: [row?.goalsAgainst, row?.teamStats?.goalsAgainst],
  pointsCandidates: [row?.points, row?.teamStats?.points],
})

const getTeamIdentity = team => {
  const identity = normalizeTeamIdentity({ team: team || {} })

  return {
    lookupKey: clean(resolveTeamLookupKey(team || {})),
    teamKeys: new Set([
    identity.birthTeamDocumentId,
    identity.teamDocumentId,
    identity.birthTeamId,
    identity.teamId,
    ].map(clean).filter(Boolean)),
    clubId: clean(identity.clubId),
  }
}

const findTeamTableRow = ({ rows = [], team = {} } = {}) => {
  const identity = getTeamIdentity(team)
  const safeRows = Array.isArray(rows) ? rows : []

  if (identity.lookupKey) {
    const exactMatch = safeRows.find(row => (
      clean(resolveTeamLookupKey(row) || row?.clubId) === identity.lookupKey
    ))
    if (exactMatch) return exactMatch
  }

  if (identity.teamKeys.size) {
    const teamMatch = safeRows.find(row => {
      const rowIdentity = getTeamIdentity(row)
      return [...rowIdentity.teamKeys].some(key => identity.teamKeys.has(key))
    })
    if (teamMatch) return teamMatch
  }

  return identity.clubId
    ? safeRows.find(row => getTeamIdentity(row).clubId === identity.clubId) || null
    : null
}

const buildRankMap = ({ rows = [], valueGetter, direction = 'desc' } = {}) => (
  [...(Array.isArray(rows) ? rows : [])]
    .sort((left, right) => {
      const leftValue = valueGetter(left)
      const rightValue = valueGetter(right)
      if (leftValue !== rightValue) {
        return direction === 'asc' ? leftValue - rightValue : rightValue - leftValue
      }

      return getLeagueTableRowRank(left) - getLeagueTableRowRank(right)
    })
    .reduce((ranks, row, index) => {
      const key = clean(resolveTeamLookupKey(row) || row?.clubId)
      if (key) ranks[key] = index + 1
      return ranks
    }, {})
)

const getRankForTeam = ({ ranks = {}, row = {} } = {}) => (
  toNumberOrZero(ranks[clean(resolveTeamLookupKey(row) || row?.clubId)])
)

export const buildTeamPerformanceProjectionFromTableRows = ({
  rows = [],
  team = {},
  tableAttackRank,
  tableDefenseRank,
} = {}) => {
  const row = findTeamTableRow({ rows, team })
  if (!row) return null

  const stats = getLeagueTableRowStats(row)
  const games = stats.gamesPlayed
  const goalsFor = stats.goalsFor
  const goalsAgainst = stats.goalsAgainst
  const attackRanks = buildRankMap({
    rows,
    valueGetter: candidate => getLeagueTableRowStats(candidate).goalsFor,
    direction: 'desc',
  })
  const defenseRanks = buildRankMap({
    rows,
    valueGetter: candidate => getLeagueTableRowStats(candidate).goalsAgainst,
    direction: 'asc',
  })
  const resolvedAttackRank = isDefined(tableAttackRank)
    ? toNumberOrZero(tableAttackRank)
    : getRankForTeam({ ranks: attackRanks, row })
  const resolvedDefenseRank = isDefined(tableDefenseRank)
    ? toNumberOrZero(tableDefenseRank)
    : getRankForTeam({ ranks: defenseRanks, row })
  const goalsForPerGame = roundTeamPerformanceRate(games ? goalsFor / games : 0)
  const goalsAgainstPerGame = roundTeamPerformanceRate(games ? goalsAgainst / games : 0)

  return {
    tableRank: getLeagueTableRowRank(row),
    tableAttackRank: resolvedAttackRank,
    tableDefenseRank: resolvedDefenseRank,
    teamGamePlayed: games,
    goalsFor,
    goalsAgainst,
    goalsForPerGame,
    goalsAgainstPerGame,
  }
}

const resolveLeagueSeason = ({ league = {}, season = {}, target = 'current' } = {}) => {
  const current = league?.current
  const history = Array.isArray(league?.history) ? league.history : []
  const seasonIdentity = normalizeSeasonIdentity({ season })
  const matchedHistory = history.find(candidate => isSameSeason(candidate, seasonIdentity))

  if (clean(target) === 'history') return matchedHistory || null
  if (current && isSameSeason(current, seasonIdentity)) return current

  return matchedHistory || null
}

// League season placement is the canonical lifecycle source for Team Season
// writes. `target` remains a caller-facing projection label and must not
// decide persisted Team Season state.
export const resolveLeagueSeasonStatus = ({ league = {}, season = {} } = {}) => {
  const seasonIdentity = normalizeSeasonIdentity({ season })
  const history = Array.isArray(league?.history) ? league.history : []

  if (history.some(candidate => isSameSeason(candidate, seasonIdentity))) {
    return 'completed'
  }

  if (league?.current && isSameSeason(league.current, seasonIdentity)) {
    return 'active'
  }

  return ''
}

export const buildLeagueTeamPerformanceProjection = ({
  league = {},
  season = {},
  target = 'current',
  team = {},
} = {}) => {
  const leagueSeason = resolveLeagueSeason({ league, season, target })
  const rows = Array.isArray(leagueSeason?.tableRank) ? leagueSeason.tableRank : []

  return buildTeamPerformanceProjectionFromTableRows({ rows, team })
}

// Points are an official League fact but are intentionally kept outside the
// compact 8-field Team Performance projection contract. Stats writers can use
// this resolver without accepting points from an import payload.
export const resolveLeagueTeamPoints = ({
  league = {},
  season = {},
  target = 'current',
  team = {},
} = {}) => {
  const leagueSeason = resolveLeagueSeason({ league, season, target })
  const rows = Array.isArray(leagueSeason?.tableRank) ? leagueSeason.tableRank : []
  const row = findTeamTableRow({ rows, team })
  if (!row) return null

  return getLeagueTableRowStats(row).points
}

// Used only when the caller did not receive the league document.  This keeps
// an existing persisted projection intact, but never promotes an import payload
// to an authority over official performance.
export const buildPersistedTeamPerformanceFallback = (seasonDoc = {}) => {
  const stats = seasonDoc?.teamStats || {}
  const games = toNumberOrZero(pickDefinedValue(
    stats.teamGamePlayed,
    stats.gamesPlayed,
    seasonDoc?.teamGamePlayed,
    seasonDoc?.gamesPlayed,
  ))
  const goalsFor = toNumberOrZero(pickDefinedValue(stats.goalsFor, seasonDoc?.goalsFor))
  const goalsAgainst = toNumberOrZero(pickDefinedValue(stats.goalsAgainst, seasonDoc?.goalsAgainst))

  return {
    tableRank: pickDefinedValue(seasonDoc?.tableRank, stats.tableRank, null),
    tableAttackRank: pickDefinedValue(seasonDoc?.tableAttackRank, stats.tableAttackRank, null),
    tableDefenseRank: pickDefinedValue(seasonDoc?.tableDefenseRank, stats.tableDefenseRank, null),
    teamGamePlayed: games,
    goalsFor,
    goalsAgainst,
    goalsForPerGame: roundTeamPerformanceRate(pickDefinedValue(
      seasonDoc?.goalsForPerGame,
      stats.goalsForPerGame,
      games ? goalsFor / games : 0,
    )),
    goalsAgainstPerGame: roundTeamPerformanceRate(pickDefinedValue(
      seasonDoc?.goalsAgainstPerGame,
      stats.goalsAgainstPerGame,
      games ? goalsAgainst / games : 0,
    )),
  }
}

export const applyTeamPerformanceProjection = ({ team = {}, performance = null } = {}) => {
  if (!performance) return team

  return {
    ...team,
    tableRank: performance.tableRank,
    tableAttackRank: performance.tableAttackRank,
    tableDefenseRank: performance.tableDefenseRank,
    goalsForPerGame: performance.goalsForPerGame,
    goalsAgainstPerGame: performance.goalsAgainstPerGame,
    teamStats: {
      ...(team.teamStats || {}),
      teamGamePlayed: performance.teamGamePlayed,
      goalsFor: performance.goalsFor,
      goalsAgainst: performance.goalsAgainst,
    },
  }
}

// SearchIndex persists the same canonical Actual/Pace values with a flat
// projection shape. No calculation is repeated at the patch writer.
export const buildTeamSearchIndexPerformanceProjection = (performance = null) => {
  if (!performance) return {}

  return {
    tableRank: performance.tableRank,
    tableAttackRank: performance.tableAttackRank,
    tableDefenseRank: performance.tableDefenseRank,
    teamGamePlayed: performance.teamGamePlayed,
    goalsFor: performance.goalsFor,
    goalsAgainst: performance.goalsAgainst,
    goalsForPerGame: performance.goalsForPerGame,
    goalsAgainstPerGame: performance.goalsAgainstPerGame,
  }
}
