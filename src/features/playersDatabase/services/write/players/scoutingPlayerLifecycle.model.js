// features/playersDatabase/services/write/players/scoutingPlayerLifecycle.model.js

import { clean } from '../leagues/leagueDoc.js'

export const SCOUTING_PLAYER_TRACKING_REASONS = Object.freeze({
  PROFILE: 'PROFILE',
  FAVORITE: 'FAVORITE',
  WATCHLIST: 'WATCHLIST',
  MANUAL: 'MANUAL',
  TRANSFER: 'TRANSFER',
})

export const SCOUTING_PLAYER_EVENT_TYPES = Object.freeze({
  PLAYER_DOCUMENT_CREATED: 'PLAYER_DOCUMENT_CREATED',
  PROFILE_DETECTED: 'PROFILE_DETECTED',
  FAVORITE_ADDED: 'FAVORITE_ADDED',
  WATCHLIST_ADDED: 'WATCHLIST_ADDED',
  MANUAL_TRACKING: 'MANUAL_TRACKING',
  TRANSFER_DETECTED: 'TRANSFER_DETECTED',
})

const TRACKING_REASON_VALUES = new Set(
  Object.values(SCOUTING_PLAYER_TRACKING_REASONS)
)

const EVENT_TYPE_BY_REASON = Object.freeze({
  [SCOUTING_PLAYER_TRACKING_REASONS.PROFILE]:
    SCOUTING_PLAYER_EVENT_TYPES.PROFILE_DETECTED,
  [SCOUTING_PLAYER_TRACKING_REASONS.FAVORITE]:
    SCOUTING_PLAYER_EVENT_TYPES.FAVORITE_ADDED,
  [SCOUTING_PLAYER_TRACKING_REASONS.WATCHLIST]:
    SCOUTING_PLAYER_EVENT_TYPES.WATCHLIST_ADDED,
  [SCOUTING_PLAYER_TRACKING_REASONS.MANUAL]:
    SCOUTING_PLAYER_EVENT_TYPES.MANUAL_TRACKING,
  [SCOUTING_PLAYER_TRACKING_REASONS.TRANSFER]:
    SCOUTING_PLAYER_EVENT_TYPES.TRANSFER_DETECTED,
})

export const normalizeScoutingPlayerTrackingReason = value => {
  const reason = clean(value).toUpperCase()

  return TRACKING_REASON_VALUES.has(reason)
    ? reason
    : SCOUTING_PLAYER_TRACKING_REASONS.MANUAL
}

export const normalizeScoutingPlayerTracking = value => {
  const tracking = value && typeof value === 'object'
    ? value
    : {}

  return {
    favorite: tracking.favorite === true,
    watchlist: tracking.watchlist === true,
    firstTrackedAt: tracking.firstTrackedAt || null,
    trackingReasons: [
      ...new Set(
        (Array.isArray(tracking.trackingReasons)
          ? tracking.trackingReasons
          : [])
          .map(normalizeScoutingPlayerTrackingReason)
          .filter(Boolean)
      ),
    ],
  }
}

export const buildScoutingPlayerTracking = ({
  currentTracking = {},
  reason = '',
  trackedAt = '',
} = {}) => {
  const normalizedReason = normalizeScoutingPlayerTrackingReason(reason)
  const current = normalizeScoutingPlayerTracking(currentTracking)
  const trackingReasons = [
    ...new Set([
      ...current.trackingReasons,
      normalizedReason,
    ]),
  ]

  return {
    favorite:
      current.favorite ||
      normalizedReason === SCOUTING_PLAYER_TRACKING_REASONS.FAVORITE,
    watchlist:
      current.watchlist ||
      normalizedReason === SCOUTING_PLAYER_TRACKING_REASONS.WATCHLIST,
    firstTrackedAt: current.firstTrackedAt || trackedAt || null,
    trackingReasons,
  }
}

export const buildScoutingPlayerEventKey = event => [
  clean(event.type),
  clean(event.seasonKey || event.seasonId),
  clean(event.clubId),
  clean(event.birthTeamId),
  clean(event.profileId),
  clean(event.fromClubId),
  clean(event.toClubId),
].filter(Boolean).join('__')

export const normalizeScoutingPlayerEvents = value => {
  const events = Array.isArray(value) ? value : []
  const eventsByKey = new Map()

  events.forEach(event => {
    if (!event || typeof event !== 'object') return

    const key = clean(event.eventKey) || buildScoutingPlayerEventKey(event)
    if (!key) return

    eventsByKey.set(key, {
      ...event,
      eventKey: key,
    })
  })

  return [...eventsByKey.values()]
}

export const buildScoutingPlayerReasonEvents = ({
  reason = '',
  season = {},
  team = {},
  player = {},
  trackedAt = '',
  transfer = {},
} = {}) => {
  const normalizedReason = normalizeScoutingPlayerTrackingReason(reason)
  const eventType = EVENT_TYPE_BY_REASON[normalizedReason]
  if (!eventType) return []

  const baseEvent = {
    type: eventType,
    seasonId: clean(season.seasonId),
    seasonKey: clean(season.seasonKey),
    clubId: clean(team.clubId),
    birthTeamId: clean(team.birthTeamId || team.teamId),
    detectedAt: trackedAt || null,
  }

  if (normalizedReason === SCOUTING_PLAYER_TRACKING_REASONS.PROFILE) {
    const profiles = Array.isArray(player.scoutSignals)
      ? player.scoutSignals
      : Array.isArray(player.scoutProfiles)
        ? player.scoutProfiles
        : []

    return profiles
      .map(profile => clean(profile.profileId || profile.id))
      .filter(Boolean)
      .map(profileId => {
        const event = {
          ...baseEvent,
          profileId,
        }

        return {
          ...event,
          eventKey: buildScoutingPlayerEventKey(event),
        }
      })
  }

  if (normalizedReason === SCOUTING_PLAYER_TRACKING_REASONS.TRANSFER) {
    const event = {
      ...baseEvent,
      fromClubId: clean(transfer.fromClubId || team.clubId),
      toClubId: clean(transfer.toClubId),
      fromBirthTeamId: clean(
        transfer.fromBirthTeamId ||
        team.birthTeamId ||
        team.teamId
      ),
      toBirthTeamId: clean(transfer.toBirthTeamId),
    }

    return [{
      ...event,
      eventKey: buildScoutingPlayerEventKey(event),
    }]
  }

  const event = {
    ...baseEvent,
  }

  return [{
    ...event,
    eventKey: buildScoutingPlayerEventKey(event),
  }]
}

export const mergeScoutingPlayerEvents = ({
  currentEvents = [],
  nextEvents = [],
} = {}) => {
  const eventsByKey = new Map()

  normalizeScoutingPlayerEvents(currentEvents).forEach(event => {
    eventsByKey.set(event.eventKey, event)
  })

  normalizeScoutingPlayerEvents(nextEvents).forEach(event => {
    if (!eventsByKey.has(event.eventKey)) {
      eventsByKey.set(event.eventKey, event)
    }
  })

  return [...eventsByKey.values()]
}
