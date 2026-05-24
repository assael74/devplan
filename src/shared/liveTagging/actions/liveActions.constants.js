// src/shared/liveTagging/actions/liveActions.constants.js

import {
  DEFAULT_LIVE_ACTION_PAIR_IDS,
  LIVE_ACTION_STATS_MAP,
} from './liveActionStatsMap.js'

export const LIVE_ACTION_SIDE_IDS = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
}

export const LIVE_ACTION_SCOPE_IDS = {
  PLAYER: 'player',
  TEAM: 'team',
  BOTH: 'both',
}

export const LIVE_ACTION_GROUP_IDS = {
  PASSING: 'passing',
  DRIBBLING: 'dribbling',
  DEFENDING: 'defending',
  SHOOTING: 'shooting',
  POSITIONING: 'positioning',
  TEAM_TACTIC: 'teamTactic',
  OFFENSIVE: 'offensive',
}

const hasSide = (item, side) => {
  if (side === LIVE_ACTION_SIDE_IDS.POSITIVE) {
    return Boolean(item.positiveLabel && item.positiveStatId)
  }

  return Boolean(item.negativeLabel && (item.negativeStatId || item.totalStatId))
}

const buildAction = (item, side) => ({
  id: `${item.id}_${side}`,
  baseId: item.id,
  label: `${item.label} - ${
    side === LIVE_ACTION_SIDE_IDS.POSITIVE ? item.positiveLabel : item.negativeLabel
  }`,
  shortLabel:
    side === LIVE_ACTION_SIDE_IDS.POSITIVE ? item.positiveLabel : item.negativeLabel,
  side,
  group: item.group,
  scope: item.scope,
  idIcon: item.idIcon,
  stats: {
    group: item.statsGroup || null,
    statId:
      side === LIVE_ACTION_SIDE_IDS.POSITIVE
        ? item.positiveStatId || null
        : item.negativeStatId || item.totalStatId || null,
    totalStatId: item.totalStatId || null,
    rateStatId: item.rateStatId || null,
  },
})

export const LIVE_ACTION_PAIRS = LIVE_ACTION_STATS_MAP

export const DEFAULT_LIVE_ACTION_IDS = DEFAULT_LIVE_ACTION_PAIR_IDS

export const DEFAULT_LIVE_ACTION_PAIRS = LIVE_ACTION_PAIRS.filter((item) => {
  return DEFAULT_LIVE_ACTION_IDS.includes(item.id)
})

export const buildLiveActionsFromPairs = (pairs = LIVE_ACTION_PAIRS) => {
  return pairs.flatMap((item) => {
    const actions = []

    if (hasSide(item, LIVE_ACTION_SIDE_IDS.POSITIVE)) {
      actions.push(buildAction(item, LIVE_ACTION_SIDE_IDS.POSITIVE))
    }

    if (hasSide(item, LIVE_ACTION_SIDE_IDS.NEGATIVE)) {
      actions.push(buildAction(item, LIVE_ACTION_SIDE_IDS.NEGATIVE))
    }

    return actions
  })
}

export const LIVE_ACTIONS = buildLiveActionsFromPairs(LIVE_ACTION_PAIRS)

export const LIVE_ACTIONS_BY_ID = LIVE_ACTIONS.reduce((acc, action) => {
  acc[action.id] = action
  return acc
}, {})
