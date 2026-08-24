// src/features/playersDatabase/services/write/players/scoutingPlayerLifecycle.model.js

import {
  isProfessionalScoutProfile,
} from '../../../../../shared/scouting/players/profiles.js'
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


const getScoutProfiles = source => (
  Array.isArray(source?.scoutSignals) && source.scoutSignals.length > 0
    ? source.scoutSignals
    : Array.isArray(source?.scoutProfiles)
      ? source.scoutProfiles
      : []
)

const hasProfessionalProfileIds = source => (
  Array.isArray(source?.scoutProfileHierarchy?.professionalProfileIds) &&
  source.scoutProfileHierarchy.professionalProfileIds
    .map(clean)
    .filter(Boolean)
    .some(isProfessionalScoutProfile)
)

const hasProfessionalScoutProfile = source => (
  hasProfessionalProfileIds(source) ||
  getScoutProfiles(source).some(isProfessionalScoutProfile)
)

const hasProfessionalScoutProfileInPlayer = player => (
  hasProfessionalScoutProfile(player) ||
  ['current', 'history'].some(target => (
    (Array.isArray(player?.[target]) ? player[target] : [])
      .some(hasProfessionalScoutProfile)
  ))
)

export const resolvePlayerTrackingReasons = player => {
  const tracking = player?.tracking && typeof player.tracking === 'object'
    ? player.tracking
    : {}
  const storedReasons = (Array.isArray(tracking.trackingReasons)
    ? tracking.trackingReasons
    : [])
    .map(normalizeScoutingPlayerTrackingReason)
    .filter(reason => (
      reason === SCOUTING_PLAYER_TRACKING_REASONS.MANUAL ||
      reason === SCOUTING_PLAYER_TRACKING_REASONS.TRANSFER
    ))
  const favorite = tracking.favorite === true || player?.favorite === true
  const watchlist = tracking.watchlist === true || player?.watchlist === true
  const reasons = [
    ...storedReasons,
    favorite ? SCOUTING_PLAYER_TRACKING_REASONS.FAVORITE : '',
    watchlist ? SCOUTING_PLAYER_TRACKING_REASONS.WATCHLIST : '',
    hasProfessionalScoutProfileInPlayer(player)
      ? SCOUTING_PLAYER_TRACKING_REASONS.PROFILE
      : '',
  ].filter(Boolean)

  return [...new Set(reasons)]
}

export const shouldHavePlayerDocument = player => (
  resolvePlayerTrackingReasons(player).length > 0
)

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

export const buildScoutingPlayerTracking = ({ currentTracking = {}, reason = '', trackedAt = '' } = {}) => {
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
  clean(event.fromBirthTeamId),
  clean(event.toBirthTeamId),
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
      fromClubName: clean(transfer.fromClubName || team.clubName || team.displayName),
      toClubId: clean(transfer.toClubId),
      toClubName: clean(transfer.toClubName),
      fromBirthTeamId: clean(
        transfer.fromBirthTeamId ||
        team.birthTeamId ||
        team.teamId
      ),
      fromBirthTeamDocumentId: clean(
        transfer.fromBirthTeamDocumentId ||
        team.birthTeamDocumentId ||
        team.teamDocumentId
      ),
      toBirthTeamId: clean(transfer.toBirthTeamId),
      toBirthTeamDocumentId: clean(transfer.toBirthTeamDocumentId),
      direction: clean(transfer.direction),
      moveType: clean(transfer.moveType),
      fromClubStrengthLevel: transfer.fromClubStrengthLevel || null,
      toClubStrengthLevel: transfer.toClubStrengthLevel || null,
      fromLeagueLevel: transfer.fromLeagueLevel || null,
      toLeagueLevel: transfer.toLeagueLevel || null,
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

export const mergeScoutingPlayerEvents = ({ currentEvents = [], nextEvents = [] } = {}) => {
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
