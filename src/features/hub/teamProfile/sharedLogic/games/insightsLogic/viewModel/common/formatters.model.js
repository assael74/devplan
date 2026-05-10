// teamProfile/sharedLogic/games/insightsLogic/viewModel/common/formatters.model.js

export function toNum(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function hasValue(value) {
  return value !== undefined && value !== null && value !== ''
}

export function pickValue(values = [], fallback = '') {
  const found = values.find(hasValue)

  if (hasValue(found)) return found

  return fallback
}

export function formatPct(value) {
  const n = Number(value)

  if (!Number.isFinite(n)) return '—'

  return `${Math.round(n)}%`
}

export function formatSignedGap(value) {
  const n = Number(value)

  if (!Number.isFinite(n)) return ''

  const rounded = Math.round(n)

  if (rounded > 0) return `+${rounded}%`
  if (rounded < 0) return `${rounded}%`

  return '0%'
}

export function formatPointsText(points, maxPoints) {
  return `${toNum(points)}/${toNum(maxPoints)} נק׳`
}

export function formatGamesText(games) {
  return `${toNum(games)} מש׳`
}

export function formatShortTargetText(targetRate, gap) {
  if (!hasValue(targetRate)) return ''

  return `יעד ${formatPct(targetRate)} · ${formatSignedGap(gap)}`
}

export function formatMetricSub({ targetRate, gap, fallback = '' }) {
  const targetText = formatShortTargetText(targetRate, gap)

  if (targetText) return targetText

  return fallback
}
