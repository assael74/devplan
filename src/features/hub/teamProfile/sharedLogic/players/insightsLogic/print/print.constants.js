// TEAMPROFILE/sharedLogic/players/insightsLogic/print/print.constants.js

import {
  PLAYER_INSIGHT_PROFILES,
} from '../../../../../../../shared/players/insights/index.js'

export const ROLE_LABELS = {
  key: 'שחקני מפתח',
  core: 'שחקנים מרכזיים',
  rotation: 'שחקני רוטציה',
  fringe: 'סגל מורחב',
  none: 'ללא מעמד',
}

export const ROLE_ORDER = [
  'key',
  'core',
  'rotation',
  'fringe',
  'none',
]

export const POSITION_LABELS = {
  goalkeeper: 'שוער',
  defense: 'הגנה',
  dmMid: 'קישור אחורי',
  midfield: 'קישור',
  atMidfield: 'קישור התקפי',
  attack: 'התקפה',
}

export const PROFILE_ORDER = [
  'stat_anchor',
  'core_worker',
  'weak_spot',
  'joker',
  'unstable',
  'secondary_contributor',
  'out_of_sample',
]

export const PROFILE_SORT_ORDER = PROFILE_ORDER.reduce((acc, id, index) => {
  acc[id] = index + 1

  return acc
}, {})

export const getRoleLabel = value => {
  return ROLE_LABELS[value] || ROLE_LABELS.none
}

export const getPositionLabel = value => {
  return POSITION_LABELS[value] || 'ללא עמדה'
}

export const getProfileShortLabel = profileId => {
  const profile = PLAYER_INSIGHT_PROFILES[profileId]

  return profile?.shortLabel || profile?.label || profileId
}
