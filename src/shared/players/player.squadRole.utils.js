import {
  SEASON_PLAN_STATUS,
  SEASON_PLAN_STATUS_OPTIONS,
  SQUAD_ROLE_OPTIONS,
} from './players.constants.js'

import {
  CONFIDENCE_LEVEL_OPTIONS,
  resolveConfidenceLevel,
} from './targets/index.js'

const EMPTY_SEASON_PLAN_STATUS = {
  value: '',
  label: 'לא הוגדר תכנון לעונה',
  shortLabel: 'לא הוגדר',
  idIcon: 'notReviewed',
  tone: 'neutral',
  reviewed: false,
  defined: false,
}

export const PLAYER_CONFIDENCE_OPTIONS = CONFIDENCE_LEVEL_OPTIONS.map(option => ({
  value: option.value,
  label: option.label,
  shortLabel: option.shortLabel,
  multiplier: option.multiplier,
  color: option.color,
}))

export function getPlayerConfidenceMeta(obj = {}) {
  const value = String(obj?.confidenceLevel || '').trim()
  const option = resolveConfidenceLevel(value)

  if (!option) {
    return {
      value: '',
      label: 'לא דורג',
      shortLabel: '100%',
      multiplier: 1,
      color: 'neutral',
      rated: false,
    }
  }

  return {
    value: option.value,
    label: option.label,
    shortLabel: option.shortLabel,
    multiplier: option.multiplier,
    color: option.color,
    rated: true,
  }
}

export function getSquadRoleMeta(obj = {}, colors = {}) {
  const value = String(obj?.squadRole || '').trim()
  const option = SQUAD_ROLE_OPTIONS.find(item => item.value === value)

  if (!option) {
    return {
      value: '',
      label: 'לא הוגדר מעמד',
      color: '#9E9E9E',
      iconId: '',
      isKey: false,
      icon: null,
    }
  }

  const isKey = value === 'key'
  const color = option.color || (isKey ? colors?.accent : '#9E9E9E')

  return {
    value,
    label: option.label,
    color,
    iconId: option.idIcon || '',
    isKey,
  }
}

export function getSeasonPlanStatusMeta(obj = {}) {
  const value = String(obj?.seasonPlanStatus || '').trim()
  const option = SEASON_PLAN_STATUS_OPTIONS.find(item => item.value === value)

  if (!option) return EMPTY_SEASON_PLAN_STATUS

  return {
    value: option.value,
    label: option.label,
    shortLabel: option.shortLabel,
    idIcon: option.idIcon,
    tone: option.tone,
    reviewed: option.reviewed === true,
    defined: true,
  }
}

export function isSeasonPlanStatus(obj = {}, status) {
  const value = String(obj?.seasonPlanStatus || '').trim()
  return value === status
}

export function isPlayerSeasonPlanReviewed(obj = {}) {
  const meta = getSeasonPlanStatusMeta(obj)
  return meta.defined && meta.reviewed
}

export function isPlayerPlannedForSeason(obj = {}) {
  return isSeasonPlanStatus(obj, SEASON_PLAN_STATUS.IN_SQUAD)
}

export function isPlayerSeasonPlanPending(obj = {}) {
  return [
    SEASON_PLAN_STATUS.NOT_REVIEWED,
    SEASON_PLAN_STATUS.UNDER_REVIEW,
    SEASON_PLAN_STATUS.UNDECIDED,
  ].includes(String(obj?.seasonPlanStatus || '').trim())
}
