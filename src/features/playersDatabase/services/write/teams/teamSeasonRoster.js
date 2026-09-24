// features/playersDatabase/services/write/teams/teamSeasonRoster.js

import { doc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { clean } from '../leagues/leagueDoc.js'
import {
  normalizeSeasonIdentity,
  normalizeSeasonStatus,
} from '../../../model/shared/season.model.js'
import { resolveTeamLookupKey } from '../../../model/team/teamIdentity.model.js'
import { buildTeamRootWithSeasonIndex, teamDocRef } from './teamDoc.js'
import {
  buildPlayerLookup,
  buildTeamSeasonDoc,
  findExistingPlayerIndex,
  normalizeTeamPlayer,
  normalizeTeamSeasonRosterState,
} from './teamSeason.model.js'
import {
  buildTeamSeasonDocumentData,
  teamSeasonDocRef,
} from './teamSeasonDoc.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { withTeamBalanceSnapshot } from './teamBalanceSnapshot.js'
import {
  applyTeamPerformanceProjection,
  buildPersistedTeamPerformanceFallback,
} from '../../../domain/projections/teamPerformance.projection.js'
import {
  createEmptyMovementState,
  normalizeRosterImport,
  ROSTER_IMPORT_MODE,
  compareSeasonKeys,
} from '../../../domain/movement/index.js'
import { countCurrentRosterPlayers } from '../../../model/team/rosterStatus.model.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { buildRosterSourceFingerprint } from './rosterSourceFingerprint.js'
import { validatePlayerIdentityQueryManifest } from '../players/playerIdentity.resolve.js'

const withRosterPerformanceContext = ({
  seasonDoc = {},
  existingSeason = null,
  teamPerformance = null,
} = {}) => applyTeamPerformanceProjection({
  team: seasonDoc,
  performance: teamPerformance || buildPersistedTeamPerformanceFallback(existingSeason || seasonDoc),
})

const buildEffectiveSeason = ({ season = {} } = {}) => {
  const { seasonId, seasonKey } = normalizeSeasonIdentity({ season })
  if (!seasonId && !seasonKey) throw new Error('Missing season id')
  const seasonStatus = normalizeSeasonStatus(season.seasonStatus, '')

  if (!seasonStatus) {
    const error = new Error('League season lifecycle could not be resolved')
    error.code = 'LEAGUE_SEASON_LIFECYCLE_UNRESOLVED'
    throw error
  }

  return {
    ...season,
    seasonId,
    seasonKey,
    seasonStatus,
  }
}

const resolvePersistedSeasonStatus = ({ existingStatus, incomingStatus } = {}) => (
  clean(existingStatus) === 'completed' || clean(incomingStatus) === 'completed'
    ? 'completed'
    : normalizeSeasonStatus(incomingStatus)
)

const syncRootSeasonIndexInTransaction = ({
  transaction,
  rootRef,
  team,
  rootSnapshot,
  season,
}) => {
  transaction.set(rootRef, buildTeamRootWithSeasonIndex({
    team: {
      ...team,
      birthTeamDocumentId: rootRef.id,
    },
    currentData: rootSnapshot.exists() ? rootSnapshot.data() || {} : {},
    season,
  }))

  return !rootSnapshot.exists()
}

const buildBalanceRootContext = ({ team, teamId }) => ({
  ...team,
  id: teamId,
  birthTeamDocumentId: teamId,
})

const mergeRosterPlayer = ({ existingPlayer = {}, incomingPlayer = {} } = {}) => ({
  ...existingPlayer,
  ...incomingPlayer,
  playerDocumentId: clean(incomingPlayer.playerDocumentId || existingPlayer.playerDocumentId),
  aliases: Array.isArray(existingPlayer.aliases) && existingPlayer.aliases.length
    ? existingPlayer.aliases
    : incomingPlayer.aliases,
  notes: clean(existingPlayer.notes || incomingPlayer.notes),
  primaryPosition: clean(incomingPlayer.primaryPosition || existingPlayer.primaryPosition),
  positionLayer: clean(incomingPlayer.positionLayer || existingPlayer.positionLayer),
  lineClassification: existingPlayer.lineClassification || incomingPlayer.lineClassification,
  statsStatus: existingPlayer.statsStatus || incomingPlayer.statsStatus,
  playerStats: existingPlayer.playerStats || incomingPlayer.playerStats,
  primaryScoutProfileId: existingPlayer.primaryScoutProfileId || incomingPlayer.primaryScoutProfileId,
  primaryScoutProfileStrengthDepthPct: existingPlayer.primaryScoutProfileStrengthDepthPct !== undefined && existingPlayer.primaryScoutProfileStrengthDepthPct !== null
    ? existingPlayer.primaryScoutProfileStrengthDepthPct
    : incomingPlayer.primaryScoutProfileStrengthDepthPct,
  professionalScoutProfileIds: existingPlayer.professionalScoutProfileIds || incomingPlayer.professionalScoutProfileIds,
  preliminaryScoutProfileIds: existingPlayer.preliminaryScoutProfileIds || incomingPlayer.preliminaryScoutProfileIds,
  scoutEffectiveImmediacyStatus: existingPlayer.scoutEffectiveImmediacyStatus || incomingPlayer.scoutEffectiveImmediacyStatus,
  scoutPlayerInterestLevel: existingPlayer.scoutPlayerInterestLevel || incomingPlayer.scoutPlayerInterestLevel,
  scoutEngineVersion: existingPlayer.scoutEngineVersion || incomingPlayer.scoutEngineVersion,
})

const normalizeIncomingRoster = ({ players = [], season = {} } = {}) => {
  const nextPlayers = []
  const lookup = new Map()

  ;(Array.isArray(players) ? players : []).forEach(player => {
    const normalizedPlayer = normalizeTeamPlayer(player, season)
    const existingIndex = findExistingPlayerIndex({ lookup, player: normalizedPlayer })

    if (existingIndex === -1) {
      nextPlayers.push(normalizedPlayer)
      lookup.clear()
      buildPlayerLookup(nextPlayers).forEach((value, key) => lookup.set(key, value))
      return
    }

    nextPlayers[existingIndex] = mergeRosterPlayer({
      existingPlayer: nextPlayers[existingIndex],
      incomingPlayer: normalizedPlayer,
    })
  })

  return nextPlayers
}

export const mergeRosterImportPlayers = ({
  existingPlayers = [],
  players = [],
  season = {},
  mode = ROSTER_IMPORT_MODE.AUTHORITATIVE_SNAPSHOT,
} = {}) => {
  const incomingPlayers = normalizeIncomingRoster({ players, season })
  const existingLookup = buildPlayerLookup(existingPlayers)

  const mergedIncoming = incomingPlayers.map(incomingPlayer => {
    const existingIndex = findExistingPlayerIndex({
      lookup: existingLookup,
      player: incomingPlayer,
    })

    return existingIndex === -1
      ? incomingPlayer
      : mergeRosterPlayer({
        existingPlayer: existingPlayers[existingIndex],
        incomingPlayer,
      })
  })

  if (mode === ROSTER_IMPORT_MODE.AUTHORITATIVE_SNAPSHOT) return mergedIncoming

  const nextPlayers = [...existingPlayers]
  const nextLookup = buildPlayerLookup(nextPlayers)
  mergedIncoming.forEach(player => {
    const existingIndex = findExistingPlayerIndex({ lookup: nextLookup, player })
    if (existingIndex === -1) {
      nextPlayers.push(player)
      nextLookup.clear()
      buildPlayerLookup(nextPlayers).forEach((value, key) => nextLookup.set(key, value))
      return
    }
    nextPlayers[existingIndex] = player
  })

  return nextPlayers
}

const resolvePreviousSeasonEntry = ({ seasons = [], seasonKey = '' } = {}) => (
  (Array.isArray(seasons) ? seasons : [])
    .filter(entry => compareSeasonKeys(entry?.seasonKey, seasonKey) < 0)
    .sort((left, right) => compareSeasonKeys(right?.seasonKey, left?.seasonKey))[0] || null
)

export const resolvePersistedRosterImport = ({
  rosterImport = {},
  existingSeason = null,
  sourceSnapshotKeyExplicit = false,
} = {}) => {
  const incoming = normalizeRosterImport(rosterImport)
  const existing = normalizeRosterImport(existingSeason?.rosterImport)
  const sameGeneratedSnapshot = !sourceSnapshotKeyExplicit &&
    Boolean(existing.sourceSnapshotKey) &&
    Boolean(incoming.contentHash) &&
    existing.contentHash === incoming.contentHash &&
    existing.effectiveAt === incoming.effectiveAt

  return sameGeneratedSnapshot
    ? { ...incoming, sourceSnapshotKey: existing.sourceSnapshotKey }
    : incoming
}


export const buildPreparedTeamSeasonRoster = ({
  season = {},
  team = {},
  players = [],
  teamPerformance = null,
  rosterImport = {},
  movementState = null,
  sourceSnapshotKeyExplicit = false,
  rosterProjectionRevision = '',
  existingSeason = null,
} = {}) => {
  const teamId = resolveTeamLookupKey(team)
  if (!teamId) throw new Error('Missing birth team id')

  const effectiveSeason = buildEffectiveSeason({ season })
  const persistedSeasonScope = {
    ...effectiveSeason,
    seasonStatus: resolvePersistedSeasonStatus({
      existingStatus: existingSeason?.seasonStatus,
      incomingStatus: effectiveSeason.seasonStatus,
    }),
  }
  const persistedRosterImport = resolvePersistedRosterImport({
    rosterImport,
    existingSeason,
    sourceSnapshotKeyExplicit,
  })
  const normalizedMovementState = movementState && typeof movementState === 'object'
    ? movementState
    : createEmptyMovementState()
  const existingPlayers = Array.isArray(existingSeason?.teamPlayers)
    ? existingSeason.teamPlayers
    : []
  const nextPlayers = mergeRosterImportPlayers({
    existingPlayers,
    players,
    season: persistedSeasonScope,
    mode: persistedRosterImport.mode,
  })
  const baseSeasonDoc = existingSeason
    ? normalizeTeamSeasonRosterState({
      seasonDoc: existingSeason,
      season: persistedSeasonScope,
      team: { ...team, birthTeamDocumentId: teamId },
      players: nextPlayers,
    })
    : buildTeamSeasonDoc({
      season: persistedSeasonScope,
      team: { ...team, birthTeamDocumentId: teamId, teamDocumentId: teamId },
      players: nextPlayers,
    })
  const seasonDocWithoutBalance = withRosterPerformanceContext({
    seasonDoc: {
      ...baseSeasonDoc,
      rosterImport: persistedRosterImport,
      ...(rosterProjectionRevision ? { rosterProjectionRevision } : {}),
      transfersIn: normalizedMovementState.transfersIn || [],
      transfersOut: normalizedMovementState.transfersOut || [],
      pendingPlayers: normalizedMovementState.pendingPlayers || [],
      movementProjectionRevision: clean(rosterProjectionRevision),
      resolvedRosterAbsences: normalizedMovementState.resolvedRosterAbsences || [],
    },
    existingSeason,
    teamPerformance,
  })
  const seasonDoc = withTeamBalanceSnapshot({
    seasonDoc: seasonDocWithoutBalance,
    teamRoot: buildBalanceRootContext({ team, teamId }),
  })
  const persistedSeason = buildTeamSeasonDocumentData({
    team: { ...team, birthTeamDocumentId: teamId },
    season: persistedSeasonScope,
    seasonDoc,
    existingData: existingSeason || {},
  })

  return {
    teamId,
    persistedSeasonScope,
    persistedRosterImport,
    movementState: normalizedMovementState,
    persistedSeason,
  }
}


export async function upsertTeamSeasonPlayers({
  season = {},
  team = {},
  players = [],
  teamPerformance = null,
  rosterImport = {},
  movementState = null,
  sourceSnapshotKeyExplicit = false,
  rosterProjectionRevision = '',
  reconcileMovement = null,
} = {}) {
  const teamId = resolveTeamLookupKey(team)
  if (!teamId) throw new Error('Missing birth team id')

  const effectiveSeason = buildEffectiveSeason({ season })
  const rootRef = teamDocRef(teamId)
  const seasonRef = teamSeasonDocRef({
    birthTeamDocumentId: teamId,
    seasonKey: effectiveSeason.seasonKey,
  })

  return trackedRunTransaction(db, async transaction => {
    const [rootSnapshot, seasonSnapshot] = await Promise.all([
      transaction.get(rootRef),
      transaction.get(seasonRef),
    ])
    const existingSeason = seasonSnapshot.exists() ? seasonSnapshot.data() || {} : null
    const previousEntry = resolvePreviousSeasonEntry({
      seasons: rootSnapshot.exists() ? rootSnapshot.data()?.seasons : [],
      seasonKey: effectiveSeason.seasonKey,
    })
    const previousRef = previousEntry?.seasonKey
      ? teamSeasonDocRef({ birthTeamDocumentId: teamId, seasonKey: previousEntry.seasonKey })
      : null
    const previousSnapshot = previousRef ? await transaction.get(previousRef) : null
    const previousSeason = previousSnapshot?.exists() ? previousSnapshot.data() || {} : null
    const persistedRosterImport = resolvePersistedRosterImport({
      rosterImport,
      existingSeason,
      sourceSnapshotKeyExplicit,
    })
    const resolvedMovementState = typeof reconcileMovement === 'function'
      ? reconcileMovement({
        currentSeason: existingSeason,
        previousSeason,
        rosterImport: persistedRosterImport,
      })
      : movementState
    const prepared = buildPreparedTeamSeasonRoster({
      season,
      team,
      players,
      teamPerformance,
      rosterImport: persistedRosterImport,
      movementState: resolvedMovementState,
      sourceSnapshotKeyExplicit: true,
      rosterProjectionRevision,
      existingSeason,
    })

    const createdTeam = syncRootSeasonIndexInTransaction({
      transaction,
      rootRef,
      team,
      rootSnapshot,
      season: prepared.persistedSeason,
    })
    transaction.set(seasonRef, prepared.persistedSeason)

    return {
      birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
      teamSeasonDocumentId: seasonRef.id,
      seasonId: prepared.persistedSeasonScope.seasonId,
      seasonKey: prepared.persistedSeasonScope.seasonKey,
      target: prepared.persistedSeasonScope.seasonStatus === 'completed' ? 'history' : 'current',
      playersCount: countCurrentRosterPlayers(prepared.persistedSeason.teamPlayers),
      createdTeam,
      players: prepared.persistedSeason.teamPlayers,
      teamBalance: prepared.persistedSeason.teamBalance || null,
      seasonDocument: prepared.persistedSeason,
      movementState: prepared.movementState,
      rosterImport: prepared.persistedRosterImport,
      rosterProjectionRevision: prepared.persistedSeason.rosterProjectionRevision || '',
    }
  })
}


export async function commitApprovedTeamSeasonRoster({
  plan = {},
  team = {},
} = {}) {
  const teamId = clean(plan.birthTeamDocumentId || resolveTeamLookupKey(team))
  const seasonKey = clean(plan.seasonKey)
  const persistedSeason = plan.persistedSeason && typeof plan.persistedSeason === 'object'
    ? plan.persistedSeason
    : null

  if (!teamId || !seasonKey || !persistedSeason) {
    throw new Error('Missing approved roster import plan')
  }

  const identityManifestCurrent = await validatePlayerIdentityQueryManifest(
    plan.identityQueryManifest || []
  )
  if (!identityManifestCurrent) {
    const error = new Error('נתוני זיהוי השחקנים השתנו מאז בדיקת הסגל. יש להציג את הנתונים מחדש.')
    error.code = 'ROSTER_IMPORT_PLAN_STALE'
    error.staleSources = ['playerIdentity']
    throw error
  }

  const rootRef = teamDocRef(teamId)
  const seasonRef = teamSeasonDocRef({
    birthTeamDocumentId: teamId,
    seasonKey,
  })

  return trackedRunTransaction(db, async transaction => {
    const leagueId = clean(plan.leagueId)
    const leagueRef = leagueId
      ? doc(db, PLAYERS_DATABASE_COLLECTIONS.leagues, leagueId)
      : null
    const [rootSnapshot, seasonSnapshot, leagueSnapshot] = await Promise.all([
      transaction.get(rootRef),
      transaction.get(seasonRef),
      leagueRef ? transaction.get(leagueRef) : Promise.resolve(null),
    ])
    const currentRoot = rootSnapshot.exists() ? rootSnapshot.data() || {} : null
    const currentLeague = leagueSnapshot?.exists() ? leagueSnapshot.data() || {} : null
    const currentSeason = seasonSnapshot.exists() ? seasonSnapshot.data() || {} : null
    const previousSeasonKey = clean(plan.previousSeasonKey)
    const previousRef = previousSeasonKey
      ? teamSeasonDocRef({ birthTeamDocumentId: teamId, seasonKey: previousSeasonKey })
      : null
    const previousSnapshot = previousRef ? await transaction.get(previousRef) : null
    const previousSeason = previousSnapshot?.exists() ? previousSnapshot.data() || {} : null
    const identitySourceDocuments = Array.isArray(plan.identitySourceDocuments)
      ? plan.identitySourceDocuments
      : []
    const identitySnapshots = await Promise.all(identitySourceDocuments.map(async source => {
      const sourceId = clean(source.id)
      const sourceRef = sourceId
        ? doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, sourceId)
        : null
      const snapshot = sourceRef ? await transaction.get(sourceRef) : null

      return {
        expected: source,
        data: snapshot?.exists() ? snapshot.data() || {} : null,
      }
    }))
    const counterpartStates = Array.isArray(plan.counterpartStates)
      ? plan.counterpartStates
      : []
    const counterpartSnapshots = await Promise.all(counterpartStates.map(async counterpart => {
      const counterpartTeamId = clean(counterpart.birthTeamDocumentId)
      const counterpartRootRef = counterpartTeamId ? teamDocRef(counterpartTeamId) : null
      const counterpartRootSnapshot = counterpartRootRef
        ? await transaction.get(counterpartRootRef)
        : null
      const checkedSeasons = Array.isArray(counterpart.checkedSeasons)
        ? counterpart.checkedSeasons
        : []
      const seasonSnapshots = await Promise.all(checkedSeasons.map(async checked => {
        const checkedSeasonKey = clean(checked.seasonKey)
        const ref = counterpartTeamId && checkedSeasonKey
          ? teamSeasonDocRef({
            birthTeamDocumentId: counterpartTeamId,
            seasonKey: checkedSeasonKey,
          })
          : null
        const snapshot = ref ? await transaction.get(ref) : null
        return {
          expected: checked,
          data: snapshot?.exists() ? snapshot.data() || {} : null,
        }
      }))

      return {
        expected: counterpart,
        teamRoot: counterpartRootSnapshot?.exists() ? counterpartRootSnapshot.data() || {} : null,
        seasonSnapshots,
      }
    }))
    const fingerprints = plan.sourceFingerprints || {}
    const staleSources = []
    if (buildRosterSourceFingerprint(currentRoot) !== clean(fingerprints.teamRoot)) staleSources.push('teamRoot')
    if (buildRosterSourceFingerprint(currentSeason) !== clean(fingerprints.currentSeason)) staleSources.push('currentSeason')
    if (buildRosterSourceFingerprint(previousSeason) !== clean(fingerprints.previousSeason)) staleSources.push('previousSeason')
    if (buildRosterSourceFingerprint(currentLeague) !== clean(fingerprints.league)) staleSources.push('league')
    identitySnapshots.forEach(row => {
      if (buildRosterSourceFingerprint(row.data) !== clean(row.expected.fingerprint)) {
        staleSources.push('identity:' + clean(row.expected.id))
      }
    })
    counterpartSnapshots.forEach(row => {
      const counterpartKey = clean(row.expected.birthTeamDocumentId) + ':' + clean(row.expected.seasonKey)
      if (buildRosterSourceFingerprint(row.teamRoot) !== clean(row.expected.teamRootFingerprint)) {
        staleSources.push('counterpartRoot:' + counterpartKey)
      }
      row.seasonSnapshots.forEach(seasonRow => {
        if (buildRosterSourceFingerprint(seasonRow.data) !== clean(seasonRow.expected.fingerprint)) {
          staleSources.push('counterpartSeason:' + counterpartKey + ':' + clean(seasonRow.expected.seasonKey))
        }
      })
    })

    if (staleSources.length) {
      const error = new Error('נתוני הקבוצה השתנו מאז בדיקת הסגל. יש להציג את הנתונים מחדש.')
      error.code = 'ROSTER_IMPORT_PLAN_STALE'
      error.staleSources = staleSources
      throw error
    }

    const createdTeam = syncRootSeasonIndexInTransaction({
      transaction,
      rootRef,
      team,
      rootSnapshot,
      season: persistedSeason,
    })
    transaction.set(seasonRef, persistedSeason)

    return {
      birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
      teamSeasonDocumentId: seasonRef.id,
      seasonId: clean(persistedSeason.seasonId),
      seasonKey,
      target: clean(persistedSeason.seasonStatus) === 'completed' ? 'history' : 'current',
      playersCount: countCurrentRosterPlayers(persistedSeason.teamPlayers),
      createdTeam,
      players: persistedSeason.teamPlayers || [],
      teamBalance: persistedSeason.teamBalance || null,
      seasonDocument: persistedSeason,
      movementState: plan.movementState || createEmptyMovementState(),
      rosterImport: persistedSeason.rosterImport || {},
      rosterProjectionRevision: clean(persistedSeason.rosterProjectionRevision),
    }
  })
}

export async function appendTeamSeasonPlayer({
  season = {},
  team = {},
  player = {},
} = {}) {
  const teamId = resolveTeamLookupKey(team)
  if (!teamId) throw new Error('Missing birth team id')

  const effectiveSeason = buildEffectiveSeason({ season })
  const ref = teamSeasonDocRef({
    birthTeamDocumentId: teamId,
    seasonKey: effectiveSeason.seasonKey,
  })

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) throw new Error('Team season not found')

    const existingSeason = snapshot.data() || {}
    const persistedSeasonScope = {
      ...effectiveSeason,
      seasonStatus: resolvePersistedSeasonStatus({
        existingStatus: existingSeason.seasonStatus,
        incomingStatus: effectiveSeason.seasonStatus,
      }),
    }
    const existingPlayers = Array.isArray(existingSeason.teamPlayers)
      ? existingSeason.teamPlayers
      : []
    const normalizedPlayer = normalizeTeamPlayer(player, persistedSeasonScope)
    const existingIndex = findExistingPlayerIndex({
      lookup: buildPlayerLookup(existingPlayers),
      player: normalizedPlayer,
    })

    if (existingIndex !== -1) {
      const error = new Error('Player already exists in team roster')
      error.code = 'TEAM_PLAYER_ALREADY_EXISTS'
      error.playerId = normalizedPlayer.playerId
      throw error
    }

    const nextPlayers = [...existingPlayers, normalizedPlayer]
    const nextSeason = withTeamBalanceSnapshot({
      seasonDoc: normalizeTeamSeasonRosterState({
        seasonDoc: existingSeason,
        season: persistedSeasonScope,
        team: { ...team, birthTeamDocumentId: teamId },
        players: nextPlayers,
      }),
      teamRoot: buildBalanceRootContext({ team, teamId }),
    })
    const persistedSeason = buildTeamSeasonDocumentData({
      team: { ...team, birthTeamDocumentId: teamId },
      season: persistedSeasonScope,
      seasonDoc: nextSeason,
      existingData: existingSeason,
    })
    transaction.set(ref, persistedSeason)

    return {
      birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
      teamSeasonDocumentId: ref.id,
      seasonId: persistedSeasonScope.seasonId,
      seasonKey: persistedSeasonScope.seasonKey,
      target: persistedSeasonScope.seasonStatus === 'completed' ? 'history' : 'current',
      playersCount: countCurrentRosterPlayers(nextPlayers),
      players: persistedSeason.teamPlayers,
      player: normalizedPlayer,
      teamBalance: persistedSeason.teamBalance || null,
      seasonDocument: persistedSeason,
    }
  })
}
