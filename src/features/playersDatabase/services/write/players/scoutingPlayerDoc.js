// features/playersDatabase/services/write/players/scoutingPlayerDoc.js

export {
  ensureFavoriteScoutingPlayerDoc,
  ensureManualScoutingPlayerDoc,
  ensureScoutingPlayerDoc,
  ensureTransferredScoutingPlayerDoc,
  ensureWatchlistScoutingPlayerDoc,
  updateScoutingPlayerFavoriteState,
} from './scoutingPlayerDoc.ensure.js'

export {
  SCOUTING_PLAYER_EVENT_TYPES,
  SCOUTING_PLAYER_TRACKING_REASONS,
  buildScoutingPlayerEventKey,
  buildScoutingPlayerReasonEvents,
  buildScoutingPlayerTracking,
  mergeScoutingPlayerEvents,
  normalizeScoutingPlayerEvents,
  normalizeScoutingPlayerTracking,
  normalizeScoutingPlayerTrackingReason,
} from './scoutingPlayerLifecycle.model.js'

export {
  buildScoutingPlayerVerification,
  normalizeScoutingPlayerVerification,
  normalizeScoutingPlayerVerificationAnswer,
} from './scoutingPlayerVerification.model.js'
