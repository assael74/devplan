// src/features/liveTagging/logic/liveTagging.actions.js

import {
  DEFAULT_LIVE_ACTION_IDS,
  LIVE_ACTION_PAIRS,
} from '../../../shared/liveTagging/index.js'

export const buildInitialLiveActionsState = ({
  selectedActionPairIds = DEFAULT_LIVE_ACTION_IDS,
} = {}) => ({
  selectedActionPairIds,
})

export const isLiveActionPairSelected = (state, actionPairId) => {
  return state?.selectedActionPairIds?.includes(actionPairId)
}

export const toggleLiveActionPair = (state, actionPairId) => {
  const selected = state?.selectedActionPairIds || []
  const exists = selected.includes(actionPairId)

  return {
    ...state,
    selectedActionPairIds: exists
      ? selected.filter((id) => id !== actionPairId)
      : [...selected, actionPairId],
  }
}

export const resetLiveActionPairs = (state) => ({
  ...state,
  selectedActionPairIds: DEFAULT_LIVE_ACTION_IDS,
})

export const buildSelectedLiveActionPairs = (state) => {
  const selected = state?.selectedActionPairIds || DEFAULT_LIVE_ACTION_IDS

  return LIVE_ACTION_PAIRS.filter((item) => {
    return selected.includes(item.id)
  })
}
