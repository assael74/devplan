import { normalizeSeasonIdentity, normalizeSeasonStatus } from '../../model/shared/season.model.js'
import { resolveTeamLookupKey } from '../../model/team/teamIdentity.model.js'
import {
  buildPlayerLookup,
  buildTeamSeasonDoc,
  findExistingPlayerIndex,
  normalizeTeamPlayer,
  normalizeTeamSeasonRosterState,
} from './support/teams/teamSeason.model.js'
import { withTeamBalanceSnapshot } from './support/teams/teamBalanceSnapshot.js'
import {
  applyTeamPerformanceProjection,
  buildPersistedTeamPerformanceFallback,
} from '../projections/teamPerformance.projection.js'
import {
  createEmptyMovementState,
  normalizeRosterImport,
  ROSTER_IMPORT_MODE,
  compareSeasonKeys,
} from '../movement/index.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const buildTeamSeasonDocumentData = ({ team = {}, season = {}, seasonDoc = {}, existingData = {} } = {}) => {
  const birthTeamDocumentId = clean(team.birthTeamDocumentId || seasonDoc.birthTeamDocumentId || seasonDoc.teamDocumentId)
  const seasonKey = clean(seasonDoc.seasonKey || season.seasonKey)
  const id = birthTeamDocumentId && seasonKey ? `${birthTeamDocumentId}__${seasonKey}` : ''
  if (!id) throw new Error('Missing canonical Team Season identity')
  return { ...seasonDoc, id, birthTeamId: clean(team.birthTeamId || seasonDoc.birthTeamId || birthTeamDocumentId), birthTeamDocumentId, createdAt: existingData.createdAt || seasonDoc.createdAt || null }
}

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
      transfersIn: normalizedMovementState.transfersIn || [],
      transfersOut: normalizedMovementState.transfersOut || [],
      pendingPlayers: normalizedMovementState.pendingPlayers || [],
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


