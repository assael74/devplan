// src/features/playersDatabase/services/write/players/playerDoc.plan.js

import { normalizeComparableValue } from '../../shared/valueComparison.js'
import { buildSeasonKey, clean } from '../leagues/leagueDoc.js'
import {
  buildPlayerBaseDoc,
  buildPlayerDocumentId,
} from './playerDoc.model.js'
import {
  buildPlayerSeasonCompactProjection,
  buildPlayerSeasonDoc,
  buildPlayerSeasonRowsFromTeamSeasonDocument,
  removePlayerSeasonRow,
} from './playerSeason.model.js'
import {
  buildScoutingPlayerReasonEvents,
  buildScoutingPlayerTracking,
  mergeScoutingPlayerEvents,
  normalizeScoutingPlayerEvents,
  normalizeScoutingPlayerTracking,
  resolvePlayerLifecycleTrackingReason,
  resolvePlayerTrackingReasons,
  SCOUTING_PLAYER_EVENT_TYPES,
  SCOUTING_PLAYER_TRACKING_REASONS,
  shouldHavePlayerDocument,
} from './scoutingPlayerLifecycle.model.js'
import { normalizeScoutingPlayerVerification } from './scoutingPlayerVerification.model.js'
import { buildPlayerScoutState } from '../../../domain/orchestration/buildPlayerScoutState.js'

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

const stripTechnicalTimestamps = value => {
  if (!value || typeof value !== 'object') return value
  const next = { ...value }
  delete next.updatedAt
  next.current = (Array.isArray(value.current) ? value.current : []).map(row => {
    const nextRow = { ...row }
    delete nextRow.updatedAt
    return nextRow
  })
  next.history = (Array.isArray(value.history) ? value.history : []).map(row => {
    const nextRow = { ...row }
    delete nextRow.updatedAt
    return nextRow
  })
  return next
}

const isUnchanged = ({ currentData = {}, nextData = {} } = {}) => (
  JSON.stringify(normalizeComparableValue(stripTechnicalTimestamps(currentData))) ===
  JSON.stringify(normalizeComparableValue(stripTechnicalTimestamps(nextData)))
)

export const buildProfiledPlayerDocPlan = ({
  season = {},
  team = {},
  target = 'current',
  player = {},
  teamSeasonDocument = null,
  currentData = {},
  playerDocumentExists = false,
  verificationAnswers = null,
  resolveLifecycleAfterCalculation = false,
  trackedAt = '',
} = {}) => {
  const playerDocumentId = buildPlayerDocumentId(player)
  const seasonId = clean(season.seasonId)
  if (!playerDocumentId) return { skipped: true, reason: 'missingPlayerDocumentId' }
  if (!seasonId) throw new Error('Missing season id')

  const resolvedTeam = teamSeasonDocument
    ? { ...teamSeasonDocument, ...team }
    : team
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const isHistory = clean(target) === 'history'
  const seasonStatus = isHistory || clean(season.seasonStatus) === 'completed'
    ? 'completed'
    : 'active'
  const seasonScope = { ...season, seasonId, seasonKey, seasonStatus }
  const verification = normalizeScoutingPlayerVerification({
    ...currentData.verification,
    ...(Array.isArray(verificationAnswers) ? { answers: verificationAnswers } : {}),
  })
  const baseDoc = buildPlayerBaseDoc(
    { ...player, playerDocumentId },
    currentData,
    season,
    resolvedTeam
  )
  const initialSeasonDoc = buildPlayerSeasonDoc({ season: seasonScope, team: resolvedTeam, player })
  const hydratedRows = !playerDocumentExists && teamSeasonDocument
    ? buildPlayerSeasonRowsFromTeamSeasonDocument({
        teamSeasonDocument,
        season: seasonScope,
        team: resolvedTeam,
        player,
      })
    : { current: [], history: [] }
  const sourceCurrentRows = playerDocumentExists ? baseDoc.current : hydratedRows.current
  const sourceHistoryRows = playerDocumentExists ? baseDoc.history : hydratedRows.history
  const currentWithoutSeason = removePlayerSeasonRow({ rows: sourceCurrentRows, season: seasonScope, team: resolvedTeam })
  const historyWithoutSeason = removePlayerSeasonRow({ rows: sourceHistoryRows, season: seasonScope, team: resolvedTeam })
  const playerSeasonStints = [...historyWithoutSeason, ...currentWithoutSeason, initialSeasonDoc]
  const scoutedPlayer = buildPlayerScoutState({
    player: {
      ...player,
      playerSeasonStints,
      playerReview: currentData.playerReview || player.playerReview || null,
      manualImmediacyDecision: currentData.manualImmediacyDecision || player.manualImmediacyDecision || null,
      verification,
      verificationAnswers: Array.isArray(verificationAnswers) ? verificationAnswers : verification.answers,
    },
    team: resolvedTeam,
    season: seasonScope,
    verificationAnswers: Array.isArray(verificationAnswers) ? verificationAnswers : verification.answers,
    manualReview: currentData.playerReview || player.playerReview || null,
    manualImmediacyDecision: currentData.manualImmediacyDecision || player.manualImmediacyDecision || null,
  })
  const seasonDoc = buildPlayerSeasonDoc({ season: seasonScope, team: resolvedTeam, player: scoutedPlayer })
  const nextCurrent = isHistory ? currentWithoutSeason : [...currentWithoutSeason, seasonDoc]
  const nextHistory = isHistory ? [...historyWithoutSeason, seasonDoc] : historyWithoutSeason
  const trackingReason = resolveLifecycleAfterCalculation
    ? resolvePlayerLifecycleTrackingReason({
        ...currentData,
        ...scoutedPlayer,
        current: nextCurrent,
        history: nextHistory,
        tracking: { ...(player.tracking || {}), ...(currentData.tracking || {}) },
      })
    : SCOUTING_PLAYER_TRACKING_REASONS.PROFILE

  const resultBase = {
    playerDocumentId,
    scoutProfilesCount: seasonDoc.scoutProfiles.length,
    trackingReason,
    lifecycle: trackingReason === SCOUTING_PLAYER_TRACKING_REASONS.PROFILE
      ? 'profile'
      : trackingReason ? 'tracking' : 'clear',
    scoutedPlayer: { ...scoutedPlayer, playerDocumentId },
  }

  if (!trackingReason && !playerDocumentExists) {
    return {
      ...resultBase,
      action: 'skip',
      created: false,
      updated: false,
      skipped: true,
      reason: 'playerDocNotRequired',
      lifecycle: 'retain',
      patch: null,
    }
  }

  const effectiveTrackedAt = clean(trackedAt)
  if (!effectiveTrackedAt) {
    throw new Error('Missing trackedAt for profiled player plan')
  }
  const currentTracking = {
    ...(player.tracking || {}),
    ...(currentData.tracking || {}),
    favorite: currentData.tracking?.favorite === true || currentData.favorite === true || player.tracking?.favorite === true || player.favorite === true,
    watchlist: currentData.tracking?.watchlist === true || currentData.watchlist === true || player.tracking?.watchlist === true || player.watchlist === true,
  }
  const tracking = trackingReason
    ? buildScoutingPlayerTracking({ currentTracking, reason: trackingReason, trackedAt: effectiveTrackedAt })
    : {
        ...normalizeScoutingPlayerTracking(currentTracking),
        trackingReasons: resolvePlayerTrackingReasons({ ...currentData, current: nextCurrent, history: nextHistory, tracking: currentTracking }),
      }
  const profileEvents = buildScoutingPlayerReasonEvents({ reason: trackingReason, season: seasonScope, team: resolvedTeam, player: scoutedPlayer, trackedAt: effectiveTrackedAt })
  const createdEvents = playerDocumentExists ? [] : [buildCreatedEvent({ season: seasonScope, team: resolvedTeam, trackedAt: effectiveTrackedAt })]
  const events = mergeScoutingPlayerEvents({ currentEvents: currentData.events, nextEvents: trackingReason ? [...createdEvents, ...profileEvents] : [] })
  const nextData = {
    ...baseDoc,
    favorite: currentData.favorite === true || currentData.tracking?.favorite === true,
    tracking,
    playerReview: scoutedPlayer.playerReview || baseDoc.playerReview || null,
    manualImmediacyDecision: scoutedPlayer.manualImmediacyDecision || baseDoc.manualImmediacyDecision || null,
    verification,
    events,
    current: nextCurrent,
    history: nextHistory,
  }
  const changed = !playerDocumentExists || !isUnchanged({ currentData, nextData })

  return {
    ...resultBase,
    action: changed ? (playerDocumentExists ? 'update' : 'create') : 'retain',
    created: !playerDocumentExists,
    updated: true,
    changed,
    writeSkipped: !changed,
    patch: changed ? nextData : null,
    expectedCurrentData: currentData,
    trackedAt: effectiveTrackedAt,
  }
}

const buildCompatibleTrackingForClear = data => {
  const current = normalizeScoutingPlayerTracking({
    ...(data?.tracking || {}),
    favorite: data?.tracking?.favorite === true || data?.favorite === true,
    watchlist: data?.tracking?.watchlist === true || data?.watchlist === true,
  })

  return {
    ...current,
    trackingReasons: resolvePlayerTrackingReasons({ ...data, tracking: current }),
  }
}

export const buildClearPlayerSeasonProfilesPlan = ({
  season = {}, team = {}, target = 'current', player = {}, currentData = {},
  playerDocumentExists = false, retainPlayerDocument = false,
} = {}) => {
  const playerDocumentId = clean(player.playerDocumentId) || buildPlayerDocumentId(player)
  const seasonId = clean(season.seasonId)
  if (!playerDocumentId) return { action: 'skip', skipped: true, reason: 'missingPlayerDocumentId' }
  if (!seasonId) throw new Error('Missing season id')
  if (!playerDocumentExists) return { playerDocumentId, action: 'skip', updated: false, skipped: true, reason: 'playerDocMissing' }

  const baseDoc = buildPlayerBaseDoc({ ...player, playerDocumentId }, currentData, season, team)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const isHistory = clean(target) === 'history'
  const seasonStatus = isHistory || clean(season.seasonStatus) === 'completed' ? 'completed' : 'active'
  const seasonScope = { ...season, seasonId, seasonKey, seasonStatus }
  const currentWithoutSeason = removePlayerSeasonRow({ rows: baseDoc.current, season: seasonScope, team })
  const historyWithoutSeason = removePlayerSeasonRow({ rows: baseDoc.history, season: seasonScope, team })
  const hadSeasonRow = currentWithoutSeason.length !== baseDoc.current.length || historyWithoutSeason.length !== baseDoc.history.length
  if (!hadSeasonRow) return { playerDocumentId, action: 'skip', updated: false, skipped: true, reason: 'playerSeasonMissing' }

  const seasonDoc = buildPlayerSeasonCompactProjection({
    season: seasonScope,
    team,
    player: { ...player, scoutSignals: [], scoutProfiles: [], scoutCombinations: [] },
  })
  const nextCurrent = isHistory ? currentWithoutSeason : [...currentWithoutSeason, seasonDoc]
  const nextHistory = isHistory ? [...historyWithoutSeason, seasonDoc] : historyWithoutSeason
  const nextTrackingSource = { ...currentData, current: nextCurrent, history: nextHistory }
  const patch = {
    favorite: currentData.favorite === true || currentData.tracking?.favorite === true,
    tracking: buildCompatibleTrackingForClear(nextTrackingSource),
    verification: normalizeScoutingPlayerVerification(currentData.verification),
    events: normalizeScoutingPlayerEvents(currentData.events),
    current: nextCurrent,
    history: nextHistory,
  }
  const nextPlayerDocument = { ...currentData, ...patch }
  const hasRetainedSeasonHistory = currentWithoutSeason.length > 0 || historyWithoutSeason.length > 0
  if (!shouldHavePlayerDocument(nextPlayerDocument) && (!retainPlayerDocument || !hasRetainedSeasonHistory)) {
    return { playerDocumentId, action: 'delete', updated: true, deleted: true, changed: true, scoutProfilesCount: 0, patch: null }
  }

  const currentPayload = {
    favorite: currentData.favorite === true,
    tracking: currentData.tracking || {}, verification: currentData.verification || {}, events: currentData.events || [],
    ...(isHistory ? { history: Array.isArray(currentData.history) ? currentData.history : [] } : { current: Array.isArray(currentData.current) ? currentData.current : [] }),
  }
  const changed = !isUnchanged({ currentData: currentPayload, nextData: patch })
  return {
    playerDocumentId, action: changed ? 'update' : 'retain', updated: true, changed,
    writeSkipped: !changed, scoutProfilesCount: 0, patch: changed ? patch : null,
  }
}
