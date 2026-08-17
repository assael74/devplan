// src/shared/scouting/players/manualReview/playerManualReview.js

import {
  PLAYER_AGENT_STATUS,
  PLAYER_MANUAL_REVIEW_FIELD,
  PLAYER_MANUAL_REVIEW_STATUS,
  PLAYER_REVIEW_FIT,
} from './playerManualReview.model.js'

const normalizeText = value => String(value || '').trim()

const normalizeEnum = (value, allowedValues, fallback) => {
  const normalized = normalizeText(value).toLowerCase()

  return allowedValues.includes(normalized) ? normalized : fallback
}

const normalizeBaseEntry = (entry = {}) => ({
  note: normalizeText(entry.note),
  updatedAt: entry.updatedAt || null,
  seasonKey: normalizeText(entry.seasonKey),
})

const normalizePosition = (entry = {}) => ({
  ...normalizeBaseEntry(entry),
  value: normalizeText(entry.value),
  status: normalizeText(entry.value)
    ? PLAYER_MANUAL_REVIEW_STATUS.REVIEWED
    : PLAYER_MANUAL_REVIEW_STATUS.UNKNOWN,
})

const normalizeAgentStatus = (entry = {}) => ({
  ...normalizeBaseEntry(entry),
  value: normalizeEnum(
    entry.value,
    Object.values(PLAYER_AGENT_STATUS),
    PLAYER_AGENT_STATUS.UNKNOWN
  ),
})

const normalizeReviewedObservation = (entry = {}) => ({
  ...normalizeBaseEntry(entry),
  status: normalizeEnum(
    entry.status,
    Object.values(PLAYER_MANUAL_REVIEW_STATUS),
    PLAYER_MANUAL_REVIEW_STATUS.UNKNOWN
  ),
})

const normalizeFit = (entry = {}) => ({
  ...normalizeBaseEntry(entry),
  value: normalizeEnum(
    entry.value,
    Object.values(PLAYER_REVIEW_FIT),
    PLAYER_REVIEW_FIT.UNKNOWN
  ),
})

const normalizeTransferHistory = (entry = {}) => ({
  ...normalizeBaseEntry(entry),
  status: normalizeEnum(
    entry.status,
    Object.values(PLAYER_MANUAL_REVIEW_STATUS),
    PLAYER_MANUAL_REVIEW_STATUS.UNKNOWN
  ),
  transfers: Array.isArray(entry.transfers) ? entry.transfers : [],
})

export const buildPlayerManualReview = ({ review = {} } = {}) => {
  const safeReview = review && typeof review === 'object' ? review : {}

  return {
    [PLAYER_MANUAL_REVIEW_FIELD.POSITION]: normalizePosition(
      safeReview[PLAYER_MANUAL_REVIEW_FIELD.POSITION]
    ),
    [PLAYER_MANUAL_REVIEW_FIELD.AGENT_STATUS]: normalizeAgentStatus(
      safeReview[PLAYER_MANUAL_REVIEW_FIELD.AGENT_STATUS]
    ),
    [PLAYER_MANUAL_REVIEW_FIELD.TRANSFER_HISTORY]: normalizeTransferHistory(
      safeReview[PLAYER_MANUAL_REVIEW_FIELD.TRANSFER_HISTORY]
    ),
    [PLAYER_MANUAL_REVIEW_FIELD.GOAL_DISTRIBUTION]: normalizeReviewedObservation(
      safeReview[PLAYER_MANUAL_REVIEW_FIELD.GOAL_DISTRIBUTION]
    ),
    [PLAYER_MANUAL_REVIEW_FIELD.MINUTES_DISTRIBUTION]: normalizeReviewedObservation(
      safeReview[PLAYER_MANUAL_REVIEW_FIELD.MINUTES_DISTRIBUTION]
    ),
    [PLAYER_MANUAL_REVIEW_FIELD.VISUAL_REVIEW]: normalizeReviewedObservation(
      safeReview[PLAYER_MANUAL_REVIEW_FIELD.VISUAL_REVIEW]
    ),
    [PLAYER_MANUAL_REVIEW_FIELD.AGENT_PATH_FIT]: normalizeFit(
      safeReview[PLAYER_MANUAL_REVIEW_FIELD.AGENT_PATH_FIT]
    ),
    [PLAYER_MANUAL_REVIEW_FIELD.SCOUT_PATH_FIT]: normalizeFit(
      safeReview[PLAYER_MANUAL_REVIEW_FIELD.SCOUT_PATH_FIT]
    ),
  }
}
