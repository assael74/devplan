// src/features/playersDatabase/services/write/favorites/playerFavoriteLifecycle.js

import {
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import {
  PLAYERS_DATABASE_COLLECTIONS,
  PLAYERS_DATABASE_FAVORITES_DOCUMENTS,
  PLAYERS_DATABASE_FAVORITES_LIMIT,
} from '../../../constants/pdb.constants.js'
import {
  buildFavoriteItem,
  normalizeFavoriteItems,
} from '../../../model/favorite.model.js'
import { resolveWritablePlayerDocumentId } from '../../../model/playerIdentity.model.js'
import {
  buildSeasonKey,
  clean,
} from '../leagues/leagueDoc.js'
import {
  buildPlayerBaseDoc,
  playerDocRef,
} from '../players/playerDoc.model.js'
import {
  buildPlayerSeasonDoc,
  removePlayerSeasonRow,
} from '../players/playerSeason.model.js'
import {
  buildScoutingPlayerReasonEvents,
  buildScoutingPlayerTracking,
  mergeScoutingPlayerEvents,
  normalizeScoutingPlayerTracking,
  resolvePlayerTrackingReasons,
  SCOUTING_PLAYER_EVENT_TYPES,
  SCOUTING_PLAYER_TRACKING_REASONS,
} from '../players/scoutingPlayerLifecycle.model.js'
import { normalizeScoutingPlayerVerification } from '../players/scoutingPlayerVerification.model.js'

const playerFavoritesDocRef = () => doc(
  db,
  PLAYERS_DATABASE_COLLECTIONS.favorites,
  PLAYERS_DATABASE_FAVORITES_DOCUMENTS.PLAYERS
)

const buildCreatedEvent = ({ season = {}, team = {}, trackedAt = '' } = {}) => ({
  eventKey: [
    SCOUTING_PLAYER_EVENT_TYPES.PLAYER_DOCUMENT_CREATED,
    clean(season.seasonKey || season.seasonId),
    clean(team.clubId),
    clean(team.birthTeamId || team.teamId),
  ].filter(Boolean).join('__'),
  type: SCOUTING_PLAYER_EVENT_TYPES.PLAYER_DOCUMENT_CREATED,
  seasonId: clean(season.seasonId),
  seasonKey: clean(season.seasonKey),
  clubId: clean(team.clubId),
  birthTeamId: clean(team.birthTeamId || team.teamId),
  detectedAt: trackedAt || null,
})

const buildPlayerFavoriteDocData = ({ currentData = {}, scouting = {}, trackedAt = '', playerExists = false } = {}) => {
  const season = scouting.season || {}
  const team = scouting.team || {}
  const target = clean(scouting.target) === 'history' ? 'history' : 'current'
  const sourcePlayer = scouting.player || {}
  const player = {
    ...sourcePlayer,
    playerDocumentId: clean(
      sourcePlayer.playerDocumentId ||
      scouting.playerDocumentId
    ),
  }
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const seasonScope = {
    ...season,
    seasonId,
    seasonKey,
  }
  const baseDoc = buildPlayerBaseDoc(
    player,
    currentData,
    seasonScope,
    team
  )
  const tracking = buildScoutingPlayerTracking({
    currentTracking: {
      ...(currentData.tracking || {}),
      favorite: true,
      watchlist:
        currentData.tracking?.watchlist === true ||
        currentData.watchlist === true,
    },
    reason: SCOUTING_PLAYER_TRACKING_REASONS.FAVORITE,
    trackedAt,
  })
  const reasonEvents = buildScoutingPlayerReasonEvents({
    reason: SCOUTING_PLAYER_TRACKING_REASONS.FAVORITE,
    season: seasonScope,
    team,
    player,
    trackedAt,
  })
  const createdEvents = playerExists
    ? []
    : [buildCreatedEvent({ season: seasonScope, team, trackedAt })]
  const events = mergeScoutingPlayerEvents({
    currentEvents: currentData.events,
    nextEvents: [
      ...createdEvents,
      ...reasonEvents,
    ],
  })

  if (!seasonId) {
    return {
      ...baseDoc,
      favorite: true,
      tracking,
      verification: normalizeScoutingPlayerVerification(
        currentData.verification
      ),
      events,
    }
  }

  const seasonDoc = buildPlayerSeasonDoc({
    season: seasonScope,
    team,
    player,
  })
  const currentWithoutSeason = removePlayerSeasonRow({
    rows: baseDoc.current,
    season: seasonScope,
    team,
  })
  const historyWithoutSeason = removePlayerSeasonRow({
    rows: baseDoc.history,
    season: seasonScope,
    team,
  })

  return {
    ...baseDoc,
    favorite: true,
    tracking,
    verification: normalizeScoutingPlayerVerification(
      currentData.verification
    ),
    events,
    current: target === 'history'
      ? currentWithoutSeason
      : [...currentWithoutSeason, seasonDoc],
    history: target === 'history'
      ? [...historyWithoutSeason, seasonDoc]
      : historyWithoutSeason,
  }
}

export async function addPlayerFavoriteWithLifecycle({ entityId = '', displayName = '', birthYear = null, scouting = {} } = {}) {
  const favoriteRef = playerFavoritesDocRef()
  const sourcePlayer = scouting.player || {}
  const playerDocumentId = resolveWritablePlayerDocumentId({
    ...sourcePlayer,
    playerDocumentId: clean(
      sourcePlayer.playerDocumentId ||
      scouting.playerDocumentId
    ),
  })

  if (!playerDocumentId) {
    throw new Error('Missing player document id for favorite lifecycle')
  }

  const playerRef = playerDocRef(playerDocumentId)

  return trackedRunTransaction(db, async transaction => {
    const favoriteSnapshot = await transaction.get(favoriteRef)
    const playerSnapshot = await transaction.get(playerRef)
    const favoriteData = favoriteSnapshot.exists()
      ? favoriteSnapshot.data() || {}
      : {}
    const playerData = playerSnapshot.exists()
      ? playerSnapshot.data() || {}
      : {}
    const currentItems = normalizeFavoriteItems(favoriteData.items)
    const favoriteItem = buildFavoriteItem({
      entityId,
      displayName,
      birthYear,
      createdAt: Timestamp.now(),
    })
    const existingItem = currentItems.find(
      item => item.entityId === favoriteItem.entityId
    )

    if (!existingItem && currentItems.length >= PLAYERS_DATABASE_FAVORITES_LIMIT) {
      throw new Error(`Favorites limit reached: ${PLAYERS_DATABASE_FAVORITES_LIMIT}`)
    }

    const trackedAt = new Date().toISOString()
    const playerDocData = buildPlayerFavoriteDocData({
      currentData: playerData,
      scouting: {
        ...scouting,
        player: {
          ...sourcePlayer,
          playerDocumentId,
          fullName: clean(sourcePlayer.fullName || displayName),
          birthYear: sourcePlayer.birthYear || birthYear,
        },
      },
      trackedAt,
      playerExists: playerSnapshot.exists(),
    })

    if (!existingItem) {
      transaction.set(
        favoriteRef,
        {
          items: [...currentItems, favoriteItem],
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    }

    transaction.set(
      playerRef,
      {
        ...playerDocData,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    return existingItem || favoriteItem
  })
}

export async function removePlayerFavoriteWithLifecycle({ entityId = '', playerDocumentId = '' } = {}) {
  const normalizedEntityId = clean(entityId)
  const normalizedPlayerDocumentId = clean(resolveWritablePlayerDocumentId({
    playerDocumentId,
  }))

  if (!normalizedEntityId) {
    throw new Error('Missing favorite entity id')
  }

  if (!normalizedPlayerDocumentId) {
    throw new Error('Missing player document id for favorite lifecycle')
  }

  const favoriteRef = playerFavoritesDocRef()
  const playerRef = playerDocRef(normalizedPlayerDocumentId)

  return trackedRunTransaction(db, async transaction => {
    const favoriteSnapshot = await transaction.get(favoriteRef)
    const playerSnapshot = await transaction.get(playerRef)
    const favoriteData = favoriteSnapshot.exists()
      ? favoriteSnapshot.data() || {}
      : {}
    const currentItems = normalizeFavoriteItems(favoriteData.items)
    const nextItems = currentItems.filter(
      item => item.entityId !== normalizedEntityId
    )
    const removed = nextItems.length !== currentItems.length

    if (removed) {
      transaction.set(
        favoriteRef,
        {
          items: nextItems,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    }

    if (playerSnapshot.exists()) {
      const playerData = playerSnapshot.data() || {}
      const tracking = normalizeScoutingPlayerTracking({
        ...(playerData.tracking || {}),
        favorite:
          playerData.tracking?.favorite === true ||
          playerData.favorite === true,
        watchlist:
          playerData.tracking?.watchlist === true ||
          playerData.watchlist === true,
      })

      const nextTracking = {
        ...tracking,
        favorite: false,
      }

      transaction.set(
        playerRef,
        {
          favorite: false,
          tracking: {
            ...nextTracking,
            trackingReasons: resolvePlayerTrackingReasons({
              ...playerData,
              favorite: false,
              tracking: nextTracking,
            }),
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    }

    return {
      entityId: normalizedEntityId,
      removed,
      playerUpdated: playerSnapshot.exists(),
    }
  })
}
