// src/features/playersDatabase/services/write/players/scoutingPlayerDoc.ensure.js

import {
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { getTeamSeason } from '../../read/teamSeason.js'
import {
  buildSeasonKey,
  clean,
} from '../leagues/leagueDoc.js'
import {
  buildPlayerBaseDoc,
  buildPlayerDocumentId,
  playerDocRef,
} from './playerDoc.model.js'
import { resolveWritablePlayerDocumentId } from '../../../model/playerIdentity.model.js'
import {
  buildPlayerSeasonCompactProjection,
  buildPlayerSeasonRowsFromTeamSeasonDocument,
  findPlayerSeasonRowIndex,
  removePlayerSeasonRow,
} from './playerSeason.model.js'
import {
  buildScoutingPlayerReasonEvents,
  buildScoutingPlayerTracking,
  mergeScoutingPlayerEvents,
  normalizeScoutingPlayerEvents,
  normalizeScoutingPlayerTracking,
  normalizeScoutingPlayerTrackingReason,
  resolvePlayerTrackingReasons,
  SCOUTING_PLAYER_EVENT_TYPES,
  SCOUTING_PLAYER_TRACKING_REASONS,
} from './scoutingPlayerLifecycle.model.js'
import { normalizeScoutingPlayerVerification } from './scoutingPlayerVerification.model.js'


const normalizeComparableValue = value => {
  if (Array.isArray(value)) {
    return value.map(normalizeComparableValue)
  }

  if (
    value &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = normalizeComparableValue(value[key])
        return result
      }, {})
  }

  return value
}

const stripPlayerDocTechnicalTimestamps = value => {
  if (!value || typeof value !== 'object') return value

  const next = {
    ...value,
  }

  delete next.updatedAt

  next.current = (Array.isArray(value.current) ? value.current : []).map(row => {
    const nextRow = {
      ...row,
    }
    delete nextRow.updatedAt
    return nextRow
  })

  next.history = (Array.isArray(value.history) ? value.history : []).map(row => {
    const nextRow = {
      ...row,
    }
    delete nextRow.updatedAt
    return nextRow
  })

  return next
}

const isScoutingPlayerDocStateUnchanged = ({
  currentData = {},
  nextData = {},
} = {}) => (
  JSON.stringify(
    normalizeComparableValue(
      stripPlayerDocTechnicalTimestamps(currentData)
    )
  ) ===
  JSON.stringify(
    normalizeComparableValue(
      stripPlayerDocTechnicalTimestamps(nextData)
    )
  )
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

const resolveScoutingPlayerTeam = async (team, season = {}, teamSeasonDocument = null) => {
  const teamDocumentId = clean(
    team.birthTeamDocumentId ||
    team.birthTeamId ||
    team.teamDocumentId ||
    team.teamId
  )

  const providedTeamSeasonDocument = teamSeasonDocument && typeof teamSeasonDocument === 'object'
    ? teamSeasonDocument
    : null
  const resolvedTeamSeasonDocument = providedTeamSeasonDocument || (
    teamDocumentId
      ? await getTeamSeason({
          birthTeamDocumentId: teamDocumentId,
          seasonKey: clean(season.seasonKey || season.seasonId),
        })
      : null
  )

  return {
    teamSeasonDocument: resolvedTeamSeasonDocument,
    resolvedTeam: resolvedTeamSeasonDocument
      ? {
          ...resolvedTeamSeasonDocument,
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
  teamSeasonDocument = null,
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
    teamSeasonDocument: resolvedTeamSeasonDocument,
    resolvedTeam,
  } = await resolveScoutingPlayerTeam(team, season, teamSeasonDocument)

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
    const shouldHydrateFromTeamSeason = !snapshot.exists() && resolvedTeamSeasonDocument
    const hydratedRows = shouldHydrateFromTeamSeason
      ? buildPlayerSeasonRowsFromTeamSeasonDocument({
          teamSeasonDocument: resolvedTeamSeasonDocument,
          season: seasonScope,
          team: resolvedTeam,
          player,
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
    const sourceSeasonRows = isHistory ? sourceHistoryRows : sourceCurrentRows
    const sourceSeasonIndex = findPlayerSeasonRowIndex({
      rows: sourceSeasonRows,
      season: seasonScope,
      team: resolvedTeam,
    })
    const sourceSeasonRow = sourceSeasonIndex >= 0
      ? sourceSeasonRows[sourceSeasonIndex]
      : null
    const seasonDoc = buildPlayerSeasonCompactProjection({
      season: {
        ...(sourceSeasonRow || {}),
        ...seasonScope,
      },
      team: {
        ...(sourceSeasonRow || {}),
        ...resolvedTeam,
      },
      player: {
        ...(sourceSeasonRow || {}),
        ...player,
      },
    })
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
    const currentEvents = normalizeScoutingPlayerEvents(currentData.events)
    const events = mergeScoutingPlayerEvents({
      currentEvents,
      nextEvents: [
        ...createdEvents,
        ...reasonEvents,
      ],
    })
    const actualNewEventsCount = Math.max(
      0,
      events.length - currentEvents.length
    )
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

    const writeSkipped = snapshot.exists() && isScoutingPlayerDocStateUnchanged({
      currentData,
      nextData,
    })

    if (!writeSkipped) {
      transaction.set(ref, nextData, { merge: true })
    }

    return {
      playerDocumentId,
      created: !snapshot.exists(),
      updated: true,
      changed: !writeSkipped,
      writeSkipped,
      trackingReason: normalizedReason,
      tracking,
      eventsAdded: writeSkipped ? 0 : actualNewEventsCount,
      scoutProfilesCount: seasonDoc.scoutProfiles.length,
    }
  })
}


export const updateScoutingPlayerFavoriteState = async ({ playerDocumentId = '', favorite = false } = {}) => {
  const normalizedPlayerDocumentId = clean(resolveWritablePlayerDocumentId({
    playerDocumentId,
  }))

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
    const nextTracking = {
      ...currentTracking,
      favorite: nextFavorite,
    }
    const nextTrackingWithReasons = {
      ...nextTracking,
      trackingReasons: resolvePlayerTrackingReasons({
        ...currentData,
        favorite: nextFavorite,
        tracking: nextTracking,
      }),
    }
    const favoriteStateUnchanged = (
      currentData.favorite === nextFavorite &&
      JSON.stringify(normalizeComparableValue(currentTracking)) ===
        JSON.stringify(normalizeComparableValue(nextTrackingWithReasons))
    )

    if (!favoriteStateUnchanged) {
      transaction.set(
        ref,
        {
          favorite: nextFavorite,
          tracking: nextTrackingWithReasons,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    }

    return {
      playerDocumentId: normalizedPlayerDocumentId,
      updated: true,
      changed: !favoriteStateUnchanged,
      writeSkipped: favoriteStateUnchanged,
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
