// src/features/liveTagging/logic/liveTagging.flow.js

export const LIVE_TAGGING_FLOW_IDS = {
  ACTIVE_SUBJECT_ACTION_ZONE: 'activeSubjectActionZone',
  ZONE_ACTION_SUBJECT: 'zoneActionSubject',
}

export const DEFAULT_LIVE_TAGGING_FLOW =
  LIVE_TAGGING_FLOW_IDS.ACTIVE_SUBJECT_ACTION_ZONE

export const buildInitialTaggingState = ({
  flow = DEFAULT_LIVE_TAGGING_FLOW,
  activeType = 'player',
  activePlayerId = null,
} = {}) => ({
  flow,
  activeType,
  activePlayerId,
  selectedActionId: null,
  selectedZoneNumber: null,
})

export const setActiveSubject = (state, { activeType, activePlayerId }) => ({
  ...state,
  activeType: activeType || 'team',
  activePlayerId: activeType === 'player' ? activePlayerId || null : null,
})

export const setSelectedAction = (state, actionId) => ({
  ...state,
  selectedActionId: actionId || null,
})

export const setSelectedZone = (state, zoneNumber) => ({
  ...state,
  selectedZoneNumber: zoneNumber || null,
})

export const clearPendingTag = (state) => ({
  ...state,
  selectedActionId: null,
  selectedZoneNumber: null,
})

export const canCreateLiveEvent = (state) => {
  if (!state?.selectedActionId) return false
  if (!state?.selectedZoneNumber) return false
  if (state.activeType === 'player' && !state.activePlayerId) return false

  return true
}

export const buildEventSubjectFromState = (state) => {
  if (state?.activeType === 'player') {
    return {
      subjectType: 'player',
      playerId: state.activePlayerId || null,
    }
  }

  return {
    subjectType: 'team',
    playerId: null,
  }
}
