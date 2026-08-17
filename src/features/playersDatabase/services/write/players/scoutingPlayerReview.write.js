// src/features/playersDatabase/services/write/players/scoutingPlayerReview.write.js

import { serverTimestamp } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import {
  buildPlayerManualImmediacy,
  buildPlayerManualReview,
  PLAYER_MANUAL_REVIEW_FIELD,
  PLAYER_SCOUT_ACTION_STATUS,
  resolvePlayerEffectiveImmediacy,
} from '../../../../../shared/scouting/players/index.js'
import { buildSeasonKey, clean } from '../leagues/leagueDoc.js'
import {
  buildPlayerDocumentId,
  playerDocRef,
} from './playerDoc.model.js'
import {
  findPlayerSeasonRowIndex,
} from './playerSeason.model.js'

const REVIEW_FIELDS = Object.values(PLAYER_MANUAL_REVIEW_FIELD)
const MANUAL_ACTION_STATUSES = new Set([
  PLAYER_SCOUT_ACTION_STATUS.WATCH,
  PLAYER_SCOUT_ACTION_STATUS.PRIORITY,
  PLAYER_SCOUT_ACTION_STATUS.IMMEDIATE,
  PLAYER_SCOUT_ACTION_STATUS.REMOVE,
])

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value || {}, key)

const stripReviewMeta = entry => {
  const source = entry && typeof entry === 'object' ? entry : {}
  const { updatedAt, seasonKey, ...content } = source

  return content
}

const isSameReviewEntry = (current, next) => (
  JSON.stringify(stripReviewMeta(current)) === JSON.stringify(stripReviewMeta(next))
)

const normalizeProfileIds = values => [...new Set(
  (Array.isArray(values) ? values : [])
    .map(value => clean(value))
    .filter(Boolean)
)]

const mergeReviewPatch = ({ currentReview = {}, reviewPatch = {}, seasonKey = '', updatedAt = '' } = {}) => {
  const nextReview = {
    ...(currentReview && typeof currentReview === 'object' ? currentReview : {}),
  }

  REVIEW_FIELDS.forEach(fieldId => {
    if (!hasOwn(reviewPatch, fieldId)) return

    const currentEntry = nextReview[fieldId] && typeof nextReview[fieldId] === 'object'
      ? nextReview[fieldId]
      : {}
    const patchEntry = reviewPatch[fieldId] && typeof reviewPatch[fieldId] === 'object'
      ? reviewPatch[fieldId]
      : {}

    const mergedEntry = {
      ...currentEntry,
      ...patchEntry,
    }

    if (isSameReviewEntry(currentEntry, mergedEntry)) return

    nextReview[fieldId] = {
      ...mergedEntry,
      updatedAt,
      seasonKey: clean(patchEntry.seasonKey || seasonKey),
    }
  })

  return buildPlayerManualReview({ review: nextReview })
}

const buildStoredManualDecision = ({ decision = null, seasonKey = '', profileIds = [], decidedAt = '' } = {}) => {
  if (decision === null || decision === undefined) return undefined

  const requestedActionStatus = clean(decision?.actionStatus)

  if (requestedActionStatus && !MANUAL_ACTION_STATUSES.has(requestedActionStatus)) {
    throw new Error(`Invalid manual immediacy actionStatus: ${requestedActionStatus}`)
  }

  const normalized = buildPlayerManualImmediacy({
    decision: {
      ...(decision && typeof decision === 'object' ? decision : {}),
      seasonKey: clean(decision?.seasonKey || seasonKey),
      profileIds: normalizeProfileIds(
        Array.isArray(decision?.profileIds) && decision.profileIds.length
          ? decision.profileIds
          : profileIds
      ),
      decidedAt: decision?.decidedAt || decidedAt,
    },
  })

  if (!normalized.hasDecision) return null
  if (!normalized.reason) {
    throw new Error('Manual immediacy decision requires reason')
  }

  return {
    actionStatus: normalized.actionStatus,
    reason: normalized.reason,
    note: normalized.note,
    decidedAt: normalized.decidedAt || decidedAt,
    seasonKey: normalized.seasonKey,
    profileIds: normalizeProfileIds(normalized.profileIds),
  }
}

const isSameDecision = (current, next) => {
  if (!current && !next) return true
  if (!current || !next) return false

  return (
    clean(current.actionStatus) === clean(next.actionStatus) &&
    clean(current.reason) === clean(next.reason) &&
    clean(current.note) === clean(next.note) &&
    clean(current.seasonKey) === clean(next.seasonKey) &&
    JSON.stringify(normalizeProfileIds(current.profileIds)) ===
      JSON.stringify(normalizeProfileIds(next.profileIds))
  )
}

const buildHistoryEntry = ({ decision, decidedAt, seasonKey }) => ({
  actionStatus: clean(decision?.actionStatus),
  reason: clean(decision?.reason),
  note: clean(decision?.note),
  decidedAt: decision?.decidedAt || decidedAt,
  seasonKey: clean(decision?.seasonKey || seasonKey),
  profileIds: normalizeProfileIds(decision?.profileIds),
})

const updateSeasonOpportunity = ({ row = {}, manualDecision = null } = {}) => {
  const currentOpportunity = row.scoutOpportunity && typeof row.scoutOpportunity === 'object'
    ? row.scoutOpportunity
    : {}
  const manualImmediacy = buildPlayerManualImmediacy({ decision: manualDecision })
  const effective = resolvePlayerEffectiveImmediacy({
    automaticImmediacy: currentOpportunity,
    manualImmediacy,
  })

  return {
    ...row,
    scoutOpportunity: {
      ...currentOpportunity,
      effectiveActionStatus: effective.effectiveActionStatus,
      automaticActionStatus: effective.automaticActionStatus,
      manualActionStatus: effective.manualActionStatus,
      hasManualDecision: effective.hasManualDecision,
      profilesRemoved: effective.profilesRemoved,
      manualDecision: manualImmediacy,
    },
    updatedAt: new Date().toISOString(),
  }
}

export async function updateScoutingPlayerReview({
  season = {},
  team = {},
  target = 'current',
  player = {},
  reviewPatch = {},
  manualImmediacyDecision,
} = {}) {
  const playerDocumentId = buildPlayerDocumentId(player)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)

  if (!playerDocumentId) {
    return {
      updated: false,
      skipped: true,
      reason: 'missingPlayerDocumentId',
    }
  }

  const ref = playerDocRef(playerDocumentId)

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)

    if (!snapshot.exists()) {
      return {
        playerDocumentId,
        updated: false,
        skipped: true,
        reason: 'playerDocMissing',
      }
    }

    const currentData = snapshot.data() || {}
    const decidedAt = new Date().toISOString()
    const fieldKey = clean(target) === 'history' ? 'history' : 'current'
    const rows = Array.isArray(currentData[fieldKey]) ? currentData[fieldKey] : []
    const seasonIndex = findPlayerSeasonRowIndex({ rows, season, team })
    const currentSeasonRow = seasonIndex >= 0 ? rows[seasonIndex] || null : null
    const profileIds = (Array.isArray(currentSeasonRow?.scoutProfiles)
      ? currentSeasonRow.scoutProfiles
      : [])
      .map(profile => clean(profile?.profileId || profile?.id))
      .filter(Boolean)
    const nextReview = mergeReviewPatch({
      currentReview: currentData.playerReview,
      reviewPatch,
      seasonKey,
      updatedAt: decidedAt,
    })
    const nextManualDecision = buildStoredManualDecision({
      decision: manualImmediacyDecision,
      seasonKey,
      profileIds,
      decidedAt,
    })
    const currentManualDecision = currentData.manualImmediacyDecision || null
    const manualDecisionChanged = nextManualDecision !== undefined && !isSameDecision(
      currentManualDecision,
      nextManualDecision
    )
    const storedManualDecision = nextManualDecision === undefined || !manualDecisionChanged
      ? currentManualDecision
      : nextManualDecision
    const currentHistory = Array.isArray(currentData.manualImmediacyHistory)
      ? currentData.manualImmediacyHistory
      : []
    const historyDecision = storedManualDecision || (
      manualDecisionChanged && manualImmediacyDecision && typeof manualImmediacyDecision === 'object'
        ? {
            actionStatus: '',
            reason: clean(manualImmediacyDecision.reason),
            note: clean(manualImmediacyDecision.note),
            seasonKey,
            profileIds,
          }
        : null
    )
    const nextHistory = manualDecisionChanged
      ? [
          ...currentHistory,
          buildHistoryEntry({
            decision: historyDecision,
            decidedAt,
            seasonKey,
          }),
        ]
      : currentHistory
    const nextRows = [...rows]
    let seasonPlayer = null

    if (currentSeasonRow) {
      const nextSeasonRow = updateSeasonOpportunity({
        row: currentSeasonRow,
        manualDecision: storedManualDecision,
      })

      nextRows[seasonIndex] = nextSeasonRow
      seasonPlayer = {
        ...nextSeasonRow,
        playerId: clean(player.playerId || currentData.id || playerDocumentId),
        playerDocumentId,
        externalPlayerId: clean(player.externalPlayerId || currentData.externalPlayerId),
        fullName: clean(player.fullName || currentData.fullName),
        scoutSignals: Array.isArray(nextSeasonRow.scoutProfiles)
          ? nextSeasonRow.scoutProfiles
          : [],
      }
    }

    transaction.set(
      ref,
      {
        playerReview: nextReview,
        manualImmediacyDecision: storedManualDecision,
        manualImmediacyHistory: nextHistory,
        ...(currentSeasonRow ? { [fieldKey]: nextRows } : {}),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    return {
      playerDocumentId,
      updated: true,
      playerReview: nextReview,
      manualImmediacyDecision: storedManualDecision,
      manualImmediacyHistoryCount: nextHistory.length,
      manualDecisionChanged,
      seasonPlayer,
    }
  })
}
