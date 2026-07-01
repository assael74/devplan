// ui/fields/selectUi/players/logic/seasonPlanStatusSelect.logic.js

import { SEASON_PLAN_STATUS_OPTIONS } from '../../../../../shared/players/players.constants.js'

const clean = value => String(value ?? '').trim()

const TONE_COLORS = {
  primary: '#2563EB',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  neutral: '#64748B',
}

function resolveOptionColor(option = {}) {
  const color = clean(option.color)
  if (color) return color

  const tone = clean(option.tone)
  return TONE_COLORS[tone] || TONE_COLORS.neutral
}

export function buildSeasonPlanStatusOptions(options = SEASON_PLAN_STATUS_OPTIONS) {
  return (Array.isArray(options) ? options : [])
    .map(option => ({
      value: clean(option?.value),
      label: clean(option?.label),
      shortLabel: clean(option?.shortLabel),
      idIcon: clean(option?.idIcon),
      tone: clean(option?.tone) || 'neutral',
      color: resolveOptionColor(option),
      reviewed: option?.reviewed === true,
      raw: option,
    }))
    .filter(option => option.value && option.label)
}

export function findSeasonPlanStatusOption(value, options = SEASON_PLAN_STATUS_OPTIONS) {
  const normalizedValue = clean(value)
  if (!normalizedValue) return null

  const normalizedOptions = buildSeasonPlanStatusOptions(options)

  return normalizedOptions.find(option => {
    return option.value === normalizedValue
  }) || null
}
