// src/features/playersDatabase/services/write/teams/teamSeasonStats.js



import { normalizeComparableValue } from '../../shared/valueComparison.js'
import { db } from '../../../../../services/firebase/firebase.js'
import {
  buildSeasonKey,
  clean,
} from '../leagues/leagueDoc.js'
import { resolveTeamLookupKey } from '../../../model/team/teamIdentity.model.js'
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
import { buildScoutProfilesSummary } from '../../../model/scout/scoutProfilesSummary.model.js'
import {
  applyTeamPerformanceProjection,
  buildPersistedTeamPerformanceFallback,
} from '../../../domain/projections/teamPerformance.projection.js'
import { compareSeasonKeys } from '../../../domain/movement/index.js'
import { countCurrentRosterPlayers } from '../../../model/team/rosterStatus.model.js'

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

export const buildScoutIdentityContext = ({ team = {}, baseSeasonDoc = {} } = {}) => ({
  clubId: clean(firstDefined(team.clubId, baseSeasonDoc?.scoutIdentityContext?.clubId)),
  birthTeamSlot: toNumber(firstDefined(
    team.birthTeamSlot,
    team.teamSlot,
    baseSeasonDoc?.scoutIdentityContext?.birthTeamSlot,
    1,
  )) || 1,
})

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

const resolvePreviousSeasonEntry = ({ seasons = [], seasonKey = '' } = {}) => (
  (Array.isArray(seasons) ? seasons : [])
    .filter(entry => compareSeasonKeys(entry?.seasonKey, seasonKey) < 0)
    .sort((left, right) => compareSeasonKeys(right?.seasonKey, left?.seasonKey))[0] || null
)

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

const resolveStatsCommitIdentity = ({ season = {}, team = {} } = {}) => {
  const teamId = resolveTeamLookupKey(team)
  const seasonId = clean(season.seasonId)
  if (!teamId) throw new Error('Missing birth team id')
  if (!seasonId) throw new Error('Missing season id')
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const seasonStatus = requireLeagueSeasonLifecycle(season.seasonStatus)
  return { teamId, seasonId, seasonKey, inputSeason: { ...season, seasonId, seasonKey, seasonStatus } }
}

// Pure preparation for the future atomic canonical commit. The caller provides
// already-read snapshots; this builder emits only Team Season and Team Root data.
export const buildTeamStatsCanonicalCommit = ({
  season = {}, team = {}, players = [], teamPerformance = null, teamPoints = null,
  reconcileMovement = null, statsProjectionRevision = '', existingSeason = null,
  existingRoot = null, previousSeason = null,
} = {}) => {
  const { teamId, seasonId, seasonKey, inputSeason } = resolveStatsCommitIdentity({ season, team })
  const effectiveSeason = {
    ...inputSeason,
    seasonStatus: resolvePersistedSeasonStatus({
      existingStatus: existingSeason?.seasonStatus,
      incomingStatus: inputSeason.seasonStatus,
    }),
  }
  const movementState = typeof reconcileMovement === 'function'
    ? reconcileMovement({ currentSeason: existingSeason, previousSeason })
    : null
  const baseSeasonDoc = existingSeason || buildTeamSeasonDoc({
    season: effectiveSeason,
    team: { ...team, birthTeamDocumentId: teamId, teamDocumentId: teamId },
    players: [],
  })
  const canonicalTeamContext = buildCanonicalTeamSeasonContext({
    team, season: effectiveSeason, baseSeasonDoc, teamDocumentId: teamId, teamPerformance, teamPoints,
  })
  const nextPlayers = mergeTeamPlayerStats({
    existingPlayers: baseSeasonDoc.teamPlayers, players, team: canonicalTeamContext, season: effectiveSeason,
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
    scoutIdentityContext: buildScoutIdentityContext({ team, baseSeasonDoc }),
    playersCount: countCurrentRosterPlayers(nextPlayers),
    ...(movementState ? {
      transfersIn: movementState.transfersIn || [],
      transfersOut: movementState.transfersOut || [],
      pendingPlayers: movementState.pendingPlayers || [],
    } : {}),
    scoutProfilesSummary: buildScoutProfilesSummary(nextPlayers),
    statsProjectionRevision: clean(statsProjectionRevision) || clean(baseSeasonDoc.statsProjectionRevision),
    updatedAt: new Date().toISOString(),
  })
  const seasonDoc = withTeamBalanceSnapshot({
    seasonDoc: seasonDocWithoutBalance,
    teamRoot: { ...team, id: teamId, birthTeamDocumentId: teamId },
  })
  const seasonData = buildTeamSeasonDocumentData({
    team: { ...team, birthTeamDocumentId: teamId },
    season: effectiveSeason,
    seasonDoc: stripUndefined(seasonDoc),
    existingData: existingSeason || {},
  })
  const writeSkipped = Boolean(existingSeason) && isSamePersistedTeamState(existingSeason, seasonData)
  const persistedSeason = writeSkipped ? existingSeason : seasonData
  const rootData = buildTeamRootWithSeasonIndex({
    team: { ...team, birthTeamDocumentId: teamId },
    currentData: existingRoot || {},
    season: persistedSeason,
  })
  return {
    birthTeamDocumentId: teamId,
    teamDocumentId: teamId,
    teamSeasonDocumentId: seasonData.id,
    seasonId,
    seasonKey,
    target: effectiveSeason.seasonStatus === 'completed' ? 'history' : 'current',
    createdTeam: !existingRoot,
    rowsCount: (Array.isArray(players) ? players : []).length,
    playersCount: countCurrentRosterPlayers(persistedSeason.teamPlayers),
    players: Array.isArray(persistedSeason.teamPlayers) ? persistedSeason.teamPlayers : [],
    teamBalance: persistedSeason.teamBalance || null,
    canonicalTeamContext,
    seasonDocument: persistedSeason,
    seasonData,
    rootData,
    movementState,
    updated: true,
    changed: !writeSkipped,
    writeSkipped,
  }
}
export async function updateTeamSeasonPlayerStats({
  season = {},
  team = {},
  players = [],
  teamPerformance = null,
  teamPoints = null,
  reconcileMovement = null,
  statsProjectionRevision = '',
} = {}) {
  const { teamId, seasonKey } = resolveStatsCommitIdentity({ season, team })
  const ref = teamSeasonDocRef({ birthTeamDocumentId: teamId, seasonKey })
  const rootRef = teamDocRef(teamId)

  return trackedRunTransaction(db, async transaction => {
    const [rootSnapshot, snapshot] = await Promise.all([
      transaction.get(rootRef),
      transaction.get(ref),
    ])
    const existingSeason = snapshot.exists() ? snapshot.data() || {} : null
    const existingRoot = rootSnapshot.exists() ? rootSnapshot.data() || {} : null
    const previousEntry = resolvePreviousSeasonEntry({ seasons: existingRoot?.seasons || [], seasonKey })
    const previousRef = previousEntry?.seasonKey
      ? teamSeasonDocRef({ birthTeamDocumentId: teamId, seasonKey: previousEntry.seasonKey })
      : null
    const previousSnapshot = previousRef ? await transaction.get(previousRef) : null
    const previousSeason = previousSnapshot?.exists() ? previousSnapshot.data() || {} : null
    const commit = buildTeamStatsCanonicalCommit({
      season, team, players, teamPerformance, teamPoints, reconcileMovement,
      statsProjectionRevision, existingSeason, existingRoot, previousSeason,
    })
    if (!commit.writeSkipped) transaction.set(ref, commit.seasonData, { merge: true })
    transaction.set(rootRef, commit.rootData)
    return commit
  })
}
