// src/features/playersDatabase/services/read/pages/playerPage.read.js

import { doc, onSnapshot } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import {
  trackedGetDoc,
  trackFirestoreListenerClose,
  trackFirestoreListenerOpen,
  trackFirestoreListenerUpdate,
} from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import {
  adaptPlayerDocumentSeason,
  normalizePlayerEventsState,
} from '../../../domain/index.js'
import {
  cleanValue,
  pickDefinedValue,
} from '../../../model/shared/value.model.js'
import {
  buildPlayerDocumentCacheKey,
  readWithDocumentCache,
  refreshWithDocumentCache,
  setDocumentCacheValue,
} from '../../cache/index.js'
import { buildPlayerSeasonDocumentId } from '../../../domain/identity/index.js'

const playerDocRef = documentId => (
  doc(db, PLAYERS_DATABASE_COLLECTIONS.playerRoots, cleanValue(documentId))
)

const loadPlayerSource = async ({ playerId = '', action = 'player-read' } = {}) => {
  const safePlayerId = cleanValue(playerId)
  if (!safePlayerId) return null

  const snapshot = await trackedGetDoc(playerDocRef(safePlayerId), {
    feature: 'playersDatabase',
    action,
    collection: PLAYERS_DATABASE_COLLECTIONS.playerRoots,
    meta: {
      requestedPlayerId: safePlayerId,
      documentId: safePlayerId,
    },
  })
  return snapshot.exists()
    ? { id: snapshot.id, ...snapshot.data() }
    : null
}

export async function readPlayerSource({ playerId = '' } = {}) {
  return loadPlayerSource({
    playerId,
    action: 'player-json-read',
  })
}

export async function readPlayerPageData({
  playerId = '',
  refresh = false,
} = {}) {
  const safePlayerId = cleanValue(playerId)
  if (!safePlayerId) return null

  const requestedKey = buildPlayerDocumentCacheKey(safePlayerId)

  const read = async () => {
    const playerDocument = await loadPlayerSource({
      playerId: safePlayerId,
      action: 'player-read',
    })

    if (!playerDocument) return null
    const refs = playerDocument.seasonRefsById && typeof playerDocument.seasonRefsById === 'object'
      ? playerDocument.seasonRefsById
      : {}
    const playerSeasons = await Promise.all(Object.entries(refs).map(async ([seasonId, ref]) => {
      const documentId = buildPlayerSeasonDocumentId({ playerId: safePlayerId, seasonId })
      if (cleanValue(ref?.playerSeasonDocumentId) && cleanValue(ref.playerSeasonDocumentId) !== documentId) {
        throw new Error('Invalid playerSeasonDocumentId reference')
      }
      const snapshot = await trackedGetDoc(
        doc(db, PLAYERS_DATABASE_COLLECTIONS.playerSeasons, documentId),
        {
          feature: 'playersDatabase',
          action: 'player-season-read',
          collection: PLAYERS_DATABASE_COLLECTIONS.playerSeasons,
          meta: { playerId: safePlayerId, documentId },
        }
      )
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
    }))
    return adaptCanonicalPlayerPage({
      playerRoot: playerDocument,
      playerSeasons: playerSeasons.filter(Boolean),
    })
  }
  const reader = refresh ? refreshWithDocumentCache : readWithDocumentCache
  const playerPageData = await reader({
    key: requestedKey,
    read,
  })

  return playerPageData || null
}

const canonicalPlayerRootSource = playerRoot => ({
  ...playerRoot,
  ...(playerRoot?.identity || {}),
  playerDocumentId: cleanValue(playerRoot?.identity?.playerId || playerRoot?.id),
  updatedAt: playerRoot?.timestamps?.updatedAt || null,
})

const canonicalTeamContexts = playerSeason => {
  const teamsById = playerSeason?.teamsById && typeof playerSeason.teamsById === 'object'
    ? playerSeason.teamsById
    : {}
  if (Object.keys(teamsById).length) return Object.entries(teamsById)
  const teamId = cleanValue(playerSeason?.teamId)
  return teamId && playerSeason?.team ? [[teamId, playerSeason.team]] : []
}

const canonicalSeasonSource = ({ playerRoot, playerSeason, teamId, team }) => {
  const seasonIdentity = playerSeason?.identity || {}
  const roster = team?.roster || {}
  const stats = team?.stats || {}
  const playerStats = stats.playerStats || {}
  const scouting = team?.scouting || {}
  const evidence = scouting.evidence || {}
  const context = evidence.calculationContext || {}
  const manual = team?.manual || {}

  return {
    seasonId: seasonIdentity.seasonId,
    seasonKey: seasonIdentity.seasonKey,
    seasonStatus: seasonIdentity.seasonStatus,
    birthYear: playerRoot?.identity?.birthYear,
    teamId,
    birthTeamDocumentId: teamId,
    teamSeasonDocumentId: team?.teamSeasonDocumentId,
    clubId: team?.clubId,
    leagueId: team?.leagueId,
    ageGroupId: team?.ageGroupId,
    birthTeamSlot: team?.teamSlot,
    rosterStatus: roster.rosterStatus,
    isYoungerAgeGroup: roster.isYoungerAgeGroup,
    isOlderAgeGroup: roster.isOlderAgeGroup,
    numShirt: roster.numShirt,
    statsStatus: stats.statsStatus,
    ...playerStats,
    teamGames: playerStats.teamGamePlayed || context.teamGamePlayed,
    teamMinutes: playerStats.teamMinutes || context.teamMinutesPlayed,
    leagueTotalRound: context.leagueTotalRound,
    teamRank: context.teamTableRank,
    teamGoalsFor: context.teamGoalsFor,
    teamGoalsAgainst: context.teamGoalsAgainst,
    lineClassification: stats.lineClassification || null,
    primaryPosition: playerRoot?.primaryPosition,
    positionLayer: playerRoot?.positionLayer,
    primaryScoutProfileId: scouting?.primary?.profileId,
    primaryScoutProfileStrengthDepthPct: scouting?.primary?.strengthDepthPct,
    professionalScoutProfileIds: scouting.professionalProfileIds,
    preliminaryScoutProfileIds: scouting.preliminaryProfileIds,
    scoutEffectiveImmediacyStatus: scouting.scoutEffectiveImmediacyStatus,
    scoutPlayerInterestLevel: scouting.scoutPlayerInterestLevel,
    projectedStats: evidence.projected || null,
    playerUrl: manual.playerUrl,
    goalDistribution: manual.goalDistribution,
    movementsById: team?.movementsById || {},
    updatedAt: team?.updatedAt || playerSeason?.timestamps?.updatedAt || null,
  }
}

const adaptCanonicalPlayerPage = ({ playerRoot, playerSeasons }) => {
  if (!playerRoot) return null
  const rootSource = canonicalPlayerRootSource(playerRoot)
  const seasons = playerSeasons.flatMap(playerSeason => (
    canonicalTeamContexts(playerSeason).map(([teamId, team]) => {
      const seasonSource = canonicalSeasonSource({
        playerRoot,
        playerSeason,
        teamId,
        team,
      })
      const target = cleanValue(playerSeason?.identity?.seasonStatus) === 'completed'
        ? 'history'
        : 'current'
      return adaptPlayerDocumentSeason({
        playerDocument: rootSource,
        seasonDocument: seasonSource,
        target,
      })
    })
  ))
  const current = seasons.filter(season => season.lifecycle?.type === 'current')
  const history = seasons.filter(season => season.lifecycle?.type !== 'current')

  return {
    identity: {
      playerId: cleanValue(playerRoot?.identity?.playerId || playerRoot.id),
      playerDocumentId: cleanValue(playerRoot?.identity?.playerId || playerRoot.id),
      externalPlayerId: cleanValue(playerRoot?.identity?.externalPlayerId),
      displayName: cleanValue(playerRoot?.identity?.fullName || '-'),
      normalizedName: cleanValue(playerRoot?.identity?.normalizedName),
      birthYear: pickDefinedValue(playerRoot?.identity?.birthYear, null),
      birthDate: pickDefinedValue(playerRoot?.identity?.birthDate, null),
      status: '',
      avatarUrl: '',
    },
    current,
    history,
    seasons,
    activeSeason: current[0] || history[0] || null,
    events: normalizePlayerEventsState(playerRoot),
    metadata: {
      notes: cleanValue(playerRoot.notes),
      updatedAt: playerRoot?.timestamps?.updatedAt || null,
    },
  }
}

const subscribePlayerDocument = ({
  collectionName,
  documentId,
  action,
  onValue,
  onError,
}) => {
  const listenerId = `players-database-${action}-${documentId}-${Date.now()}`
  const usage = {
    collection: collectionName,
    shortKey: documentId,
    feature: 'playersDatabase',
    action,
    listenerId,
    meta: { documentPath: `${collectionName}/${documentId}` },
  }
  trackFirestoreListenerOpen(usage)
  const unsubscribe = onSnapshot(
    doc(db, collectionName, documentId),
    snapshot => {
      const value = snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
      trackFirestoreListenerUpdate({
        ...usage,
        docs: value ? [value] : [],
        docsCount: value ? 1 : 0,
        readsCount: value ? 1 : 0,
        fromCache: snapshot.metadata.fromCache,
      })
      onValue(value)
    },
    error => {
      trackFirestoreListenerUpdate({
        ...usage,
        docsCount: 0,
        readsCount: 0,
        status: 'error',
        errorCode: error?.code || 'unknown',
      })
      onError?.(error)
    }
  )
  return () => {
    unsubscribe()
    trackFirestoreListenerClose(usage)
  }
}

export const subscribePlayerPageData = ({ playerId = '', onError } = {}) => {
  const safePlayerId = cleanValue(playerId)
  if (!safePlayerId) return () => {}
  const cacheKey = buildPlayerDocumentCacheKey(safePlayerId)
  let active = true
  let rootLoaded = false
  let playerRoot = null
  const seasonListeners = new Map()
  const seasonDocuments = new Map()

  const publish = () => {
    if (!active || !rootLoaded) return
    if ([...seasonListeners.values()].some(listener => !listener.loaded)) return
    const value = adaptCanonicalPlayerPage({
      playerRoot,
      playerSeasons: [...seasonDocuments.values()].filter(Boolean),
    })
    setDocumentCacheValue({ key: cacheKey, value })
  }

  const reconcileSeasons = () => {
    const refs = playerRoot?.seasonRefsById && typeof playerRoot.seasonRefsById === 'object'
      ? playerRoot.seasonRefsById
      : {}
    const required = new Map(Object.entries(refs).map(([seasonId, ref]) => {
      const documentId = buildPlayerSeasonDocumentId({
        playerId: safePlayerId,
        seasonId,
      })
      if (cleanValue(ref?.playerSeasonDocumentId) && cleanValue(ref.playerSeasonDocumentId) !== documentId) {
        throw new Error('Invalid playerSeasonDocumentId reference')
      }
      return [documentId, seasonId]
    }))

    seasonListeners.forEach((listener, documentId) => {
      if (required.has(documentId)) return
      listener.unsubscribe()
      seasonListeners.delete(documentId)
      seasonDocuments.delete(documentId)
    })
    required.forEach((_seasonId, documentId) => {
      if (seasonListeners.has(documentId)) return
      const listener = { loaded: false, unsubscribe: () => {} }
      listener.unsubscribe = subscribePlayerDocument({
        collectionName: PLAYERS_DATABASE_COLLECTIONS.playerSeasons,
        documentId,
        action: 'player-page-player-season-live',
        onError,
        onValue: value => {
          listener.loaded = true
          seasonDocuments.set(documentId, value)
          publish()
        },
      })
      seasonListeners.set(documentId, listener)
    })
    publish()
  }

  const unsubscribeRoot = subscribePlayerDocument({
    collectionName: PLAYERS_DATABASE_COLLECTIONS.playerRoots,
    documentId: safePlayerId,
    action: 'player-page-player-root-live',
    onError,
    onValue: value => {
      rootLoaded = true
      playerRoot = value
      if (!playerRoot) {
        seasonListeners.forEach(listener => listener.unsubscribe())
        seasonListeners.clear()
        seasonDocuments.clear()
        publish()
        return
      }
      try {
        reconcileSeasons()
      } catch (error) {
        onError?.(error)
      }
    },
  })

  return () => {
    active = false
    unsubscribeRoot()
    seasonListeners.forEach(listener => listener.unsubscribe())
    seasonListeners.clear()
  }
}
