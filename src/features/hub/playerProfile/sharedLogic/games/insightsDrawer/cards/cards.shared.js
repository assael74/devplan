// playerProfile/sharedUi/insights/playerGames/cards/cards.shared.js

import {
  EMPTY,
  formatNumber,
  formatPercent,
  resolvePctColor,
  resolveToneColor,
  toNum,
  toText,
} from '../common/index.js'

export {
  EMPTY,
  formatNumber,
  formatPercent,
  resolvePctColor,
  resolveToneColor,
  toNum,
  toText,
}

const JOY_COLORS = [
  'primary',
  'neutral',
  'danger',
  'success',
  'warning',
]

export const normalizeJoyColor = (value, fallback = 'neutral') => {
  if (JOY_COLORS.includes(value)) return value
  return fallback
}

export const resolveBriefIcon = (id) => {
  if (id === 'usage') return 'time'
  if (id === 'roleFit') return 'squad'
  if (id === 'positionFit') return 'position'
  if (id === 'scoring') return 'goal'
  if (id === 'teamContext') return 'team'
  if (id === 'difficulty') return 'difficulty'
  if (id === 'recent') return 'trend'

  return 'insights'
}

export const resolveBriefLabel = (id) => {
  if (id === 'usage') return 'שימוש'
  if (id === 'roleFit') return 'מעמד'
  if (id === 'positionFit') return 'עמדה'
  if (id === 'scoring') return 'תפוקה'
  if (id === 'teamContext') return 'השפעה'
  if (id === 'difficulty') return 'רמת יריבה'
  if (id === 'recent') return 'מגמה'

  return 'תובנה'
}

export const normalizeBriefCard = (brief = {}) => {
  const id = brief?.sectionId || brief?.id || ''
  const color = normalizeJoyColor(resolveToneColor(brief?.tone))

  return {
    id,
    title: brief?.title || resolveBriefLabel(id),
    value: brief?.meta?.coreIssue || brief?.status || '',
    subValue: brief?.text || '',
    icon: resolveBriefIcon(id),
    color,
    level: 'medium',
    status: brief?.status || 'empty',
    tone: normalizeJoyColor(brief?.tone),
    targetLabel: brief?.targetLabel || '',
    sourceLabel: brief?.sourceLabel || '',
    items: Array.isArray(brief?.items) ? brief.items : [],
    metrics: brief?.metrics || {},
    meta: brief?.meta || {},
    debug: brief?.debug || {},
    tooltip: brief?.tooltip || null,
    details: Array.isArray(brief?.details) ? brief.details : [],
    raw: brief,
  }
}
