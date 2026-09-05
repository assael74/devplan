// src/features/playersDatabase/services/write/teams/teamSeasonStats.js



import { db } from '../../../../../services/firebase/firebase.js'
import {
  buildSeasonKey,
  clean,
} from '../leagues/leagueDoc.js'
import { resolveTeamLookupKey } from '../../../model/teamIdentity.model.js'
import { buildTeamRootWithSeasonIndex, teamDocRef } from './teamDoc.js'
import {
  buildTeamSeasonDoc,
  mergeTeamPlayerStats,
} from './teamSeason.model.js'
import {
  buildTeamSeasonDocumentData,
  teamSeasonDocRef,
} from './teamSeasonDoc.js'

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { withTeamBalanceSnapshot } from './teamBalanceSnapshot.js'
import { buildScoutProfilesSummary } from '../../../model/scoutProfilesSummary.model.js'
import {
  applyTeamPerformanceProjection,
  buildPersistedTeamPerformanceFallback,
} from '../shared/teamPerformanceProjection.js'

const hasNumberValue = value => (
  value !== undefined &&
  value !== null &&
  value !== '' &&
  Number.isFinite(Number(value))
)

const isPlainObject = value => (
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype
)


const normalizeComparableValue = value => {
  if (Array.isArray(value)) {
    return value.map(normalizeComparableValue)
  }

  if (!isPlainObject(value)) return value

  return Object.keys(value)
    .sort()
    .reduce((result, key) => {
      result[key] = normalizeComparableValue(value[key])
      return result
    }, {})
}

const stripTeamTechnicalTimestamps = value => {
  const source = isPlainObject(value) ? value : {}
  const next = {
    ...source,
  }

  delete next.updatedAt

  if (Array.isArray(next.teamPlayers)) {
    next.teamPlayers = next.teamPlayers.map(player => {
      if (!isPlainObject(player)) return player
      const nextPlayer = { ...player }
      delete nextPlayer.updatedAt
      return nextPlayer
    })
  }

  if (isPlainObject(next.teamBalance?.source)) {
    next.teamBalance = {
      ...next.teamBalance,
      source: { ...next.teamBalance.source },
    }
    delete next.teamBalance.source.updatedAt
  }

  return next
}

const isSamePersistedTeamState = (current, next) => (
  JSON.stringify(normalizeComparableValue(stripTeamTechnicalTimestamps(current))) ===
  JSON.stringify(normalizeComparableValue(stripTeamTechnicalTimestamps(next)))
)

const stripUndefined = value => {
  if (Array.isArray(value)) {
    return value
      .filter(item => item !== undefined)
      .map(stripUndefined)
  }

  if (!isPlainObject(value)) return value

  return Object.entries(value).reduce((result, [key, item]) => {
    if (item === undefined) return result

    result[key] = stripUndefined(item)
    return result
  }, {})
}

const firstDefined = (...values) => values.find(value => (
  value !== undefined && value !== null && value !== ''
))

const resolvePersistedSeasonStatus = ({ existingStatus, incomingStatus } = {}) => (
  clean(existingStatus) === 'completed' || clean(incomingStatus) === 'completed'
    ? 'completed'
    : 'active'
)

const requireLeagueSeasonLifecycle = seasonStatus => {
  const normalizedStatus = clean(seasonStatus)

  if (['active', 'completed'].includes(normalizedStatus)) {
    return normalizedStatus
  }

  const error = new Error('League season lifecycle could not be resolved')
  error.code = 'LEAGUE_SEASON_LIFECYCLE_UNRESOLVED'
  throw error
}

const toNumber = value => Number.isFinite(Number(value)) ? Number(value) : 0

// Performance is retained only as canonical calculation/history context. Its
// rank is the same league-table fact exposed by the compact top-level fields;
// keep the snapshot internally consistent without making the nested value a
// separate source of truth.
const withCanonicalPerformanceRank = ({ performance, tableRank } = {}) => {
  if (!isPlainObject(performance)) return performance || null

  const rank = firstDefined(tableRank, performance.rank)
  if (rank === undefined) return performance

  return {
    ...performance,
    rank: toNumber(rank),
  }
}

// Player Stats Load owns player statistics, balance and scouting only. Official
// team performance is supplied by the league-table projection (or, defensively,
// retained from the stored season when no league document reached this writer).
export const buildCanonicalTeamSeasonContext = ({
  team = {},
  season = {},
  baseSeasonDoc = {},
  teamDocumentId = '',
  teamPerformance = null,
  teamPoints = null,
} = {}) => {
  const storedStats = baseSeasonDoc.teamStats || {}
  const performance = teamPerformance || buildPersistedTeamPerformanceFallback(baseSeasonDoc)
  const performanceTeam = applyTeamPerformanceProjection({ team, performance })
  const teamGamePlayed = toNumber(performance.teamGamePlayed)
  const goalsFor = toNumber(performance.goalsFor)
  const goalsAgainst = toNumber(performance.goalsAgainst)
  const goalsForPerGame = toNumber(performanceTeam.goalsForPerGame)
  const goalsAgainstPerGame = toNumber(performanceTeam.goalsAgainstPerGame)
  const tableAttackRank = firstDefined(
    performanceTeam.tableAttackRank,
    baseSeasonDoc.tableAttackRank,
    storedStats.tableAttackRank,
  )
  const tableDefenseRank = firstDefined(
    performanceTeam.tableDefenseRank,
    baseSeasonDoc.tableDefenseRank,
    storedStats.tableDefenseRank,
  )
  const teamAttackPerformance = withCanonicalPerformanceRank({
    performance: firstDefined(
      team.teamAttackPerformance,
      team.offense,
      baseSeasonDoc.teamAttackPerformance,
      storedStats.teamAttackPerformance,
    ),
    tableRank: tableAttackRank,
  })
  const teamDefensePerformance = withCanonicalPerformanceRank({
    performance: firstDefined(
      team.teamDefensePerformance,
      team.defense,
      baseSeasonDoc.teamDefensePerformance,
      storedStats.teamDefensePerformance,
    ),
    tableRank: tableDefenseRank,
  })

  return {
    ...performanceTeam,
    birthTeamDocumentId: teamDocumentId,
    teamDocumentId,
    seasonId: season.seasonId,
    seasonKey: season.seasonKey,
    tableRank: firstDefined(performanceTeam.tableRank, baseSeasonDoc.tableRank, storedStats.tableRank),
    tableAttackRank,
    tableDefenseRank,
    goalsFor,
    goalsAgainst,
    goalsForPerGame,
    goalsAgainstPerGame,
    teamGamePlayed,
    gamesPlayed: teamGamePlayed,
    teamAttackPerformance,
    teamDefensePerformance,
    offense: teamAttackPerformance || {},
    defense: teamDefensePerformance || {},
    teamStats: {
      points: toNumber(firstDefined(
        teamPoints,
        storedStats.points,
      )),
      teamGamePlayed,
      goalsFor,
      goalsAgainst,
    },
  }
}

export async function updateTeamSeasonPlayerStats({
  season = {},
  team = {},
  players = [],
  teamPerformance = null,
  teamPoints = null,
} = {}) {
  const teamId = resolveTeamLookupKey(team)
  const seasonId = clean(season.seasonId)
  if (!teamId) throw new Error('Missing birth team id')
  if (!seasonId) throw new Error('Missing season id')

  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const seasonStatus = requireLeagueSeasonLifecycle(season.seasonStatus)
  const inputSeason = {
    ...season,
    seasonId,
    seasonKey,
    seasonStatus,
  }
  const ref = teamSeasonDocRef({
    birthTeamDocumentId: teamId,
    seasonKey,
  })
  const rootRef = teamDocRef(teamId)

  return trackedRunTransaction(db, async transaction => {
    const [rootSnapshot, snapshot] = await Promise.all([
      transaction.get(rootRef),
      transaction.get(ref),
    ])
    const existingSeason = snapshot.exists() ? snapshot.data() || {} : null
    const effectiveSeason = {
      ...inputSeason,
      seasonStatus: resolvePersistedSeasonStatus({
        existingStatus: existingSeason?.seasonStatus,
        incomingStatus: inputSeason.seasonStatus,
      }),
    }
    const baseSeasonDoc = existingSeason || buildTeamSeasonDoc({
      season: effectiveSeason,
      team: {
        ...team,
        birthTeamDocumentId: teamId,
        teamDocumentId: teamId,
      },
      players: [],
    })
    const canonicalTeamContext = buildCanonicalTeamSeasonContext({
      team,
      season: effectiveSeason,
      baseSeasonDoc,
      teamDocumentId: teamId,
      teamPerformance,
      teamPoints,
    })
    const nextPlayers = mergeTeamPlayerStats({
      existingPlayers: baseSeasonDoc.teamPlayers,
      players,
      team: canonicalTeamContext,
      season: effectiveSeason,
    })
    const seasonDocWithoutBalance = stripUndefined({
      ...baseSeasonDoc,
      seasonStatus: effectiveSeason.seasonStatus,
      tableRank: canonicalTeamContext.tableRank,
      tableAttackRank: canonicalTeamContext.tableAttackRank,
      tableDefenseRank: canonicalTeamContext.tableDefenseRank,
      goalsForPerGame: canonicalTeamContext.goalsForPerGame,
      goalsAgainstPerGame: canonicalTeamContext.goalsAgainstPerGame,
      teamStats: canonicalTeamContext.teamStats,
      teamAttackPerformance: canonicalTeamContext.teamAttackPerformance,
      teamDefensePerformance: canonicalTeamContext.teamDefensePerformance,
      leagueTotalRound: hasNumberValue(season.leagueTotalRound)
        ? Number(season.leagueTotalRound)
        : Number(baseSeasonDoc.leagueTotalRound) || 0,
      teamPlayers: nextPlayers,
      playersCount: nextPlayers.length,
      scoutProfilesSummary: buildScoutProfilesSummary(nextPlayers),
      updatedAt: new Date().toISOString(),
    })
    const seasonDoc = withTeamBalanceSnapshot({
      seasonDoc: seasonDocWithoutBalance,
      teamRoot: {
        ...team,
        id: teamId,
        birthTeamDocumentId: teamId,
      },
    })
    const nextData = buildTeamSeasonDocumentData({
      team: {
        ...team,
        birthTeamDocumentId: teamId,
      },
      season: effectiveSeason,
      seasonDoc: stripUndefined(seasonDoc),
      existingData: existingSeason || {},
    })

    const writeSkipped = snapshot.exists() && isSamePersistedTeamState(
      existingSeason,
      nextData
    )

    if (!writeSkipped) {
      transaction.set(ref, nextData, { merge: true })
    }

    const persistedSeason = writeSkipped
      ? existingSeason || nextData
      : nextData

    const createdTeam = !rootSnapshot.exists()
    transaction.set(rootRef, buildTeamRootWithSeasonIndex({
      team: {
        ...team,
        birthTeamDocumentId: teamId,
      },
      currentData: rootSnapshot.exists() ? rootSnapshot.data() || {} : {},
      season: persistedSeason,
    }))

    return {
      birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
      teamSeasonDocumentId: ref.id,
      seasonId,
      seasonKey,
      target: effectiveSeason.seasonStatus === 'completed' ? 'history' : 'current',
      createdTeam,
      rowsCount: (Array.isArray(players) ? players : []).length,
      playersCount: Array.isArray(persistedSeason.teamPlayers)
        ? persistedSeason.teamPlayers.length
        : 0,
      players: Array.isArray(persistedSeason.teamPlayers)
        ? persistedSeason.teamPlayers
        : [],
      teamBalance: persistedSeason.teamBalance || null,
      canonicalTeamContext,
      seasonDocument: persistedSeason,
      updated: true,
      changed: !writeSkipped,
      writeSkipped,
    }
  })
}
