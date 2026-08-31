// src/features/playersDatabase/services/write/players/playerDoc.upsert.js

import { db } from '../../../../../services/firebase/firebase.js'
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
import {
  buildPlayerSeasonDoc,
  buildPlayerSeasonRowsFromTeamSeasonDocument,
  removePlayerSeasonRow,
} from './playerSeason.model.js'
import {
  buildScoutingPlayerReasonEvents,
  buildScoutingPlayerTracking,
  mergeScoutingPlayerEvents,
  normalizeScoutingPlayerTracking,
  resolvePlayerLifecycleTrackingReason,
  resolvePlayerTrackingReasons,
  SCOUTING_PLAYER_EVENT_TYPES,
  SCOUTING_PLAYER_TRACKING_REASONS,
} from './scoutingPlayerLifecycle.model.js'
import {
  buildScoutingPlayerVerification,
  normalizeScoutingPlayerVerification,
} from './scoutingPlayerVerification.model.js'
import { buildPlayerScoutState } from '../../../domain/orchestration/buildPlayerScoutState.js'
import {
  PLAYER_VERIFICATION_ANSWER,
  PLAYER_VERIFICATION_QUESTION,
} from '../../../../../shared/scouting/players/verification/playerVerification.model.js'

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'

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

const isPlayerDocStateUnchanged = ({
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
export const upsertProfiledPlayerDoc = async ({
  season = {},
  team = {},
  target = 'current',
  player = {},
  teamSeasonDocument = null,
  verificationAnswers = null,
  confirmPositionContext = false,
  resolveLifecycleAfterCalculation = false,
} = {}) => {
  const playerDocumentId = buildPlayerDocumentId(player)
  const seasonId = clean(season.seasonId)
  if (!playerDocumentId) return {
    skipped: true,
    reason: 'missingPlayerDocumentId',
  }
  if (!seasonId) throw new Error('Missing season id')

  const ref = playerDocRef(playerDocumentId)
  const teamDocumentId = clean(
    team.birthTeamDocumentId ||
    team.birthTeamId ||
    team.teamDocumentId ||
    team.teamId
  )
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const resolvedTeamSeasonDocument = teamSeasonDocument || (
    teamDocumentId ? await getTeamSeason({
      birthTeamDocumentId: teamDocumentId,
      seasonKey,
    }) : null
  )
  const resolvedTeam = resolvedTeamSeasonDocument ? {
    ...resolvedTeamSeasonDocument,
    ...team,
  } : team

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const incomingVerification = normalizeScoutingPlayerVerification({
      ...currentData.verification,
      ...(Array.isArray(verificationAnswers)
        ? { answers: verificationAnswers }
        : {}),
    })
    // A manual role/layer update is an explicit professional indication. Keep
    // the evidence with the Player Document so the reclassification remains
    // stable on every later scout calculation.
    const verification = confirmPositionContext
      ? buildScoutingPlayerVerification({
          currentVerification: incomingVerification,
          questionId: PLAYER_VERIFICATION_QUESTION.POSITION_CONTEXT_VERIFIED,
          answer: PLAYER_VERIFICATION_ANSWER.YES,
          sourceType: 'player_role_update',
          sourceLabel: 'עדכון עמדה / חוליה',
        })
      : incomingVerification
    const baseDoc = buildPlayerBaseDoc(
      {
        ...player,
        playerDocumentId,
      },
      currentData,
      season,
      resolvedTeam
    )
    const isHistory = clean(target) === 'history'
    const seasonStatus = isHistory || clean(season.seasonStatus) === 'completed'
      ? 'completed'
      : 'active'
    const seasonScope = {
      ...season,
      seasonId,
      seasonKey,
      seasonStatus,
    }
    const initialSeasonDoc = buildPlayerSeasonDoc({
      season: seasonScope,
      team: resolvedTeam,
      player,
    })

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
    const playerSeasonStints = [
      ...historyWithoutSeason,
      ...currentWithoutSeason,
      initialSeasonDoc,
    ]
    const scoutedPlayer = buildPlayerScoutState({
      player: {
        ...player,
        playerSeasonStints,
        playerReview: currentData.playerReview || player.playerReview || null,
        manualImmediacyDecision:
          currentData.manualImmediacyDecision ||
          player.manualImmediacyDecision ||
          null,
        verification,
        verificationAnswers: Array.isArray(verificationAnswers)
          ? verificationAnswers
          : verification.answers,
      },
      team: resolvedTeam,
      season: seasonScope,
      verificationAnswers: Array.isArray(verificationAnswers)
        ? verificationAnswers
        : verification.answers,
      manualReview: currentData.playerReview || player.playerReview || null,
      manualImmediacyDecision:
        currentData.manualImmediacyDecision ||
        player.manualImmediacyDecision ||
        null,
    })
    const seasonDoc = buildPlayerSeasonDoc({
      season: seasonScope,
      team: resolvedTeam,
      player: scoutedPlayer,
    })

    const nextCurrent = isHistory
      ? currentWithoutSeason
      : [...currentWithoutSeason, seasonDoc]
    const nextHistory = isHistory
      ? [...historyWithoutSeason, seasonDoc]
      : historyWithoutSeason
    const trackingReason = resolveLifecycleAfterCalculation
      ? resolvePlayerLifecycleTrackingReason({
          ...currentData,
          ...scoutedPlayer,
          current: nextCurrent,
          history: nextHistory,
          tracking: {
            ...(player.tracking || {}),
            ...(currentData.tracking || {}),
          },
        })
      : SCOUTING_PLAYER_TRACKING_REASONS.PROFILE

    if (!trackingReason && !snapshot.exists()) {
      return {
        playerDocumentId,
        created: false,
        updated: false,
        skipped: true,
        reason: 'playerDocNotRequired',
        lifecycle: 'retain',
        scoutProfilesCount: seasonDoc.scoutProfiles.length,
        scoutedPlayer: {
          ...scoutedPlayer,
          playerDocumentId,
        },
      }
    }

    const trackedAt = new Date().toISOString()
    const currentTracking = {
      ...(player.tracking || {}),
      ...(currentData.tracking || {}),
      favorite:
        currentData.tracking?.favorite === true ||
        currentData.favorite === true ||
        player.tracking?.favorite === true ||
        player.favorite === true,
      watchlist:
        currentData.tracking?.watchlist === true ||
        currentData.watchlist === true ||
        player.tracking?.watchlist === true ||
        player.watchlist === true,
    }
    const tracking = trackingReason
      ? buildScoutingPlayerTracking({
          currentTracking,
          reason: trackingReason,
          trackedAt,
        })
      : {
          ...normalizeScoutingPlayerTracking(currentTracking),
          trackingReasons: resolvePlayerTrackingReasons({
            ...currentData,
            current: nextCurrent,
            history: nextHistory,
            tracking: currentTracking,
          }),
        }

    const profileEvents = buildScoutingPlayerReasonEvents({
      reason: trackingReason,
      season: seasonScope,
      team: resolvedTeam,
      player: scoutedPlayer,
      trackedAt,
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
      nextEvents: trackingReason ? [
        ...createdEvents,
        ...profileEvents,
      ] : [],
    })
    const nextData = {
      ...baseDoc,
      favorite:
        currentData.favorite === true ||
        currentData.tracking?.favorite === true,
      tracking,
      playerReview: scoutedPlayer.playerReview || baseDoc.playerReview || null,
      manualImmediacyDecision:
        scoutedPlayer.manualImmediacyDecision ||
        baseDoc.manualImmediacyDecision ||
        null,
      verification,
      events,
      current: nextCurrent,
      history: nextHistory,
    }

    if (
      snapshot.exists() &&
      isPlayerDocStateUnchanged({
        currentData,
        nextData,
      })
    ) {
      return {
        playerDocumentId,
        created: false,
        updated: true,
        changed: false,
        writeSkipped: true,
        scoutProfilesCount: seasonDoc.scoutProfiles.length,
        trackingReason,
        lifecycle: trackingReason === SCOUTING_PLAYER_TRACKING_REASONS.PROFILE
          ? 'profile'
          : trackingReason
            ? 'tracking'
            : 'clear',
        scoutedPlayer: {
          ...scoutedPlayer,
          playerDocumentId,
        },
      }
    }

    transaction.set(ref, nextData, { merge: true })

    return {
      playerDocumentId,
      created: !snapshot.exists(),
      updated: true,
      changed: true,
      scoutProfilesCount: seasonDoc.scoutProfiles.length,
      trackingReason,
      lifecycle: trackingReason === SCOUTING_PLAYER_TRACKING_REASONS.PROFILE
        ? 'profile'
        : trackingReason
          ? 'tracking'
          : 'clear',
      scoutedPlayer: {
        ...scoutedPlayer,
        playerDocumentId,
      },
    }
  })
}

export const upsertOfficialPlayerDoc = upsertProfiledPlayerDoc
