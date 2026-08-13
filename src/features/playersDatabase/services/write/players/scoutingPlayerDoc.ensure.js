// features/playersDatabase/services/write/players/scoutingPlayerDoc.ensure.js

import {
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { getTeamById } from '../../read/team.js'
import {
  buildSeasonKey,
  clean,
} from '../leagues/leagueDoc.js'
import {
  buildPlayerBaseDoc,
  buildPlayerDocumentId,
  playerDocRef,
} from './playerDoc.model.js'
import {
  buildPlayerSeasonDoc,
  buildPlayerSeasonRowsFromTeamDoc,
  removePlayerSeasonRow,
} from './playerSeason.model.js'
import {
  buildScoutingPlayerReasonEvents,
  buildScoutingPlayerTracking,
  mergeScoutingPlayerEvents,
  normalizeScoutingPlayerTracking,
  normalizeScoutingPlayerTrackingReason,
  SCOUTING_PLAYER_EVENT_TYPES,
  SCOUTING_PLAYER_TRACKING_REASONS,
} from './scoutingPlayerLifecycle.model.js'
import { normalizeScoutingPlayerVerification } from './scoutingPlayerVerification.model.js'

const buildCreatedEvent = ({
  season = {},
  team = {},
  trackedAt = '',
} = {}) => ({
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

const resolveScoutingPlayerTeam = async (team, teamDocument = null) => {
  const teamDocumentId = clean(
    team.birthTeamDocumentId ||
    team.birthTeamId ||
    team.teamDocumentId ||
    team.teamId
  )

  const providedTeamDocument = teamDocument && typeof teamDocument === 'object'
    ? teamDocument
    : null
  const teamDoc = providedTeamDocument || (
    teamDocumentId
      ? await getTeamById(teamDocumentId)
      : null
  )

  return {
    teamDoc,
    resolvedTeam: teamDoc
      ? {
          ...teamDoc,
          ...team,
        }
      : team,
  }
}

export const ensureScoutingPlayerDoc = async ({
  season = {},
  team = {},
  target = 'current',
  player = {},
  reason = SCOUTING_PLAYER_TRACKING_REASONS.MANUAL,
  transfer = {},
  teamDocument = null,
} = {}) => {
  const playerDocumentId = buildPlayerDocumentId(player)
  const seasonId = clean(season.seasonId)
  const normalizedReason = normalizeScoutingPlayerTrackingReason(reason)

  if (!playerDocumentId) {
    return {
      skipped: true,
      reason: 'missingPlayerDocumentId',
    }
  }

  if (!seasonId) {
    throw new Error('Missing season id')
  }

  const ref = playerDocRef(playerDocumentId)
  const {
    teamDoc,
    resolvedTeam,
  } = await resolveScoutingPlayerTeam(team, teamDocument)

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists()
      ? snapshot.data() || {}
      : {}
    const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
    const trackedAt = new Date().toISOString()
    const seasonScope = {
      ...season,
      seasonId,
      seasonKey,
    }
    const baseDoc = buildPlayerBaseDoc(
      {
        ...player,
        playerDocumentId,
      },
      currentData,
      seasonScope,
      resolvedTeam
    )
    const isHistory = clean(target) === 'history'
    const seasonDoc = buildPlayerSeasonDoc({
      season: seasonScope,
      team: resolvedTeam,
      player,
    })
    const shouldHydrateFromTeamDoc = !snapshot.exists() && teamDoc
    const hydratedRows = shouldHydrateFromTeamDoc
      ? buildPlayerSeasonRowsFromTeamDoc({
          teamDoc,
          season: seasonScope,
          team: resolvedTeam,
          player,
          target: isHistory ? 'history' : 'current',
        })
      : {
          current: [],
          history: [],
        }
    const sourceCurrentRows = snapshot.exists()
      ? baseDoc.current
      : hydratedRows.current
    const sourceHistoryRows = snapshot.exists()
      ? baseDoc.history
      : hydratedRows.history
    const currentWithoutSeason = removePlayerSeasonRow({
      rows: sourceCurrentRows,
      season: seasonScope,
      team: resolvedTeam,
    })
    const historyWithoutSeason = removePlayerSeasonRow({
      rows: sourceHistoryRows,
      season: seasonScope,
      team: resolvedTeam,
    })
    const tracking = buildScoutingPlayerTracking({
      currentTracking: {
        ...(currentData.tracking || {}),
        favorite:
          currentData.tracking?.favorite === true ||
          currentData.favorite === true,
        watchlist:
          currentData.tracking?.watchlist === true ||
          currentData.watchlist === true,
      },
      reason: normalizedReason,
      trackedAt,
    })
    const reasonEvents = buildScoutingPlayerReasonEvents({
      reason: normalizedReason,
      season: seasonScope,
      team: resolvedTeam,
      player,
      trackedAt,
      transfer,
    })
    const createdEvents = snapshot.exists()
      ? []
      : [buildCreatedEvent({
          season: seasonScope,
          team: resolvedTeam,
          trackedAt,
        })]
    const events = mergeScoutingPlayerEvents({
      currentEvents: currentData.events,
      nextEvents: [
        ...createdEvents,
        ...reasonEvents,
      ],
    })
    const nextData = {
      ...baseDoc,
      favorite:
        currentData.favorite === true ||
        currentData.tracking?.favorite === true ||
        normalizedReason === SCOUTING_PLAYER_TRACKING_REASONS.FAVORITE,
      tracking,
      verification: normalizeScoutingPlayerVerification(
        currentData.verification
      ),
      events,
      current: isHistory
        ? currentWithoutSeason
        : [...currentWithoutSeason, seasonDoc],
      history: isHistory
        ? [...historyWithoutSeason, seasonDoc]
        : historyWithoutSeason,
    }

    transaction.set(ref, nextData, { merge: true })

    return {
      playerDocumentId,
      created: !snapshot.exists(),
      trackingReason: normalizedReason,
      tracking,
      eventsAdded: createdEvents.length + reasonEvents.length,
      scoutProfilesCount: seasonDoc.scoutProfiles.length,
    }
  })
}


export const updateScoutingPlayerFavoriteState = async ({
  playerDocumentId = '',
  favorite = false,
} = {}) => {
  const normalizedPlayerDocumentId = clean(playerDocumentId)

  if (!normalizedPlayerDocumentId) {
    return {
      skipped: true,
      reason: 'missingPlayerDocumentId',
    }
  }

  const ref = playerDocRef(normalizedPlayerDocumentId)

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)

    if (!snapshot.exists()) {
      return {
        playerDocumentId: normalizedPlayerDocumentId,
        updated: false,
        skipped: true,
        reason: 'playerDocMissing',
      }
    }

    const currentData = snapshot.data() || {}
    const currentTracking = normalizeScoutingPlayerTracking({
      ...(currentData.tracking || {}),
      favorite:
        currentData.tracking?.favorite === true ||
        currentData.favorite === true,
      watchlist:
        currentData.tracking?.watchlist === true ||
        currentData.watchlist === true,
    })
    const nextFavorite = favorite === true

    transaction.set(
      ref,
      {
        favorite: nextFavorite,
        tracking: {
          ...currentTracking,
          favorite: nextFavorite,
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    return {
      playerDocumentId: normalizedPlayerDocumentId,
      updated: true,
      favorite: nextFavorite,
    }
  })
}

export const ensureFavoriteScoutingPlayerDoc = payload =>
  ensureScoutingPlayerDoc({
    ...payload,
    reason: SCOUTING_PLAYER_TRACKING_REASONS.FAVORITE,
  })

export const ensureWatchlistScoutingPlayerDoc = payload =>
  ensureScoutingPlayerDoc({
    ...payload,
    reason: SCOUTING_PLAYER_TRACKING_REASONS.WATCHLIST,
  })

export const ensureManualScoutingPlayerDoc = payload =>
  ensureScoutingPlayerDoc({
    ...payload,
    reason: SCOUTING_PLAYER_TRACKING_REASONS.MANUAL,
  })

export const ensureTransferredScoutingPlayerDoc = payload =>
  ensureScoutingPlayerDoc({
    ...payload,
    reason: SCOUTING_PLAYER_TRACKING_REASONS.TRANSFER,
  })
