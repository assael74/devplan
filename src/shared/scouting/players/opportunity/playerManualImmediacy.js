// src/shared/scouting/players/opportunity/playerManualImmediacy.js

import {
  PLAYER_SCOUT_ACTION_STATUS,
} from './playerOpportunity.model.js'

const VALID_STATUSES = new Set(Object.values(PLAYER_SCOUT_ACTION_STATUS))

const normalizeText = value => String(value || '').trim()

export const buildPlayerManualImmediacy = ({ decision = null } = {}) => {
  const safeDecision = decision && typeof decision === 'object' ? decision : {}
  const requestedStatus = normalizeText(safeDecision.actionStatus).toLowerCase()
  const actionStatus = VALID_STATUSES.has(requestedStatus) ? requestedStatus : ''

  return {
    hasDecision: Boolean(actionStatus),
    actionStatus,
    reason: normalizeText(safeDecision.reason),
    note: normalizeText(safeDecision.note),
    decidedAt: safeDecision.decidedAt || null,
    seasonKey: normalizeText(safeDecision.seasonKey),
    profileIds: Array.isArray(safeDecision.profileIds)
      ? safeDecision.profileIds.filter(Boolean)
      : [],
  }
}

export const resolvePlayerEffectiveImmediacy = ({ automaticImmediacy, manualImmediacy } = {}) => {
  const automaticActionStatus = automaticImmediacy?.automaticActionStatus
    || PLAYER_SCOUT_ACTION_STATUS.WATCH
  const hasManualDecision = manualImmediacy?.hasDecision === true
  const effectiveActionStatus = hasManualDecision
    ? manualImmediacy.actionStatus
    : automaticActionStatus

  return {
    effectiveActionStatus,
    automaticActionStatus,
    manualActionStatus: hasManualDecision ? manualImmediacy.actionStatus : '',
    hasManualDecision,
    profilesRemoved: effectiveActionStatus === PLAYER_SCOUT_ACTION_STATUS.REMOVE,
  }
}
