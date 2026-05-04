// teamProfile/sharedLogic/games/insightsLogic/teamGames.view.shared.js

export const EMPTY = '—'

export const toNum = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export const toNullableNum = (value) => {
  if (value === undefined || value === null || value === '') return null

  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export const toText = (value, fallback = EMPTY) => {
  if (value === undefined || value === null || value === '') return fallback
  return String(value)
}

export const hasValue = (value) => {
  return value !== undefined && value !== null && value !== ''
}

export const round1 = (value) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 10) / 10
}

export const calcPctFromTotal = (value, total) => {
  const v = toNum(value)
  const t = toNum(total)

  if (!t) return 0
  return Math.round((v / t) * 100)
}

export const calcPointsPct = (points, totalGames) => {
  const maxPoints = toNum(totalGames) * 3
  if (!maxPoints) return 0

  return Math.round((toNum(points) / maxPoints) * 100)
}

export const resolvePointsColor = (pct) => {
  const n = Number(pct)

  if (!Number.isFinite(n)) return 'neutral'
  if (n >= 60) return 'success'
  if (n >= 40) return 'warning'

  return 'danger'
}

export const resolveProgressColor = (pct) => {
  const n = Number(pct)

  if (!Number.isFinite(n)) return 'neutral'
  if (n > 90) return 'primary'
  if (n >= 80) return 'success'
  if (n >= 60) return 'warning'

  return 'danger'
}

export const getRankRangeLabel = (rankRange) => {
  if (!Array.isArray(rankRange) || rankRange.length < 2) return EMPTY

  const [min, max] = rankRange

  if (!Number.isFinite(Number(min)) || !Number.isFinite(Number(max))) {
    return EMPTY
  }

  return `מקומות ${min}–${max}`
}

export const buildLevelView = (level) => {
  if (!level) return null

  return {
    id: level.id,
    label: level.label,
    shortLabel: level.shortLabel || level.label,
    rankLabel: level.rankLabel || '',
    rankRange: level.rankRange,
    rankRangeLabel: getRankRangeLabel(level.rankRange),
    pointsRange: level.pointsRange,
    color: level.color || 'neutral',
  }
}
