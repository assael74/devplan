import {
  GAME_DIFFICULTY,
  GAME_RESULT,
} from '../../../../../../../../shared/games/games.constants.js'

export const EMPTY = '—'

export const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export const toText = (v, fallback = EMPTY) => {
  if (v == null || v === '') return fallback
  return String(v)
}

export const normalizeColor = (color) => {
  if (color === 'sucsses') return 'success'
  if (color === 'warninig') return 'warning'
  return color || 'neutral'
}

export const pointsColor = (pct) => {
  if (pct >= 60) return 'success'
  if (pct >= 40) return 'warning'
  return 'danger'
}

export const getDifficultyColor = (id) => {
  if (id === 'easy') return 'success'
  if (id === 'medium') return 'warning'
  if (id === 'hard') return 'danger'
  return 'neutral'
}

export const resolveVenueIcon = (id) => {
  if (id === 'home') return 'home'
  if (id === 'away') return 'away'
  return 'game'
}

export const getResultMeta = (id) => {
  const found = Array.isArray(GAME_RESULT)
    ? GAME_RESULT.find((item) => item?.id === id)
    : null

  if (!found) {
    return {
      id,
      labelH: id,
      idIcon: 'game',
      color: 'neutral',
    }
  }

  return {
    ...found,
    color: normalizeColor(found?.color),
  }
}

export const calcPointsPct = (points, total) => {
  const maxPoints = toNum(total) * 3
  if (!maxPoints) return 0
  return Math.round((toNum(points) / maxPoints) * 100)
}

export const calcPctFromTotal = (value, total) => {
  const v = toNum(value)
  const t = toNum(total)

  if (!t) return 0
  return Math.round((v / t) * 100)
}

export const resolveDifficultyBuckets = (grouped) => {
  const byDifficultyRaw = Array.isArray(grouped?.byDifficulty) ? grouped.byDifficulty : []

  return GAME_DIFFICULTY.map((base) => {
    const found = byDifficultyRaw.find((item) => item?.id === base.id)

    return {
      id: base.id,
      label: found?.label || base?.labelH || base?.label || '',
      idIcon: found?.idIcon || base?.idIcon || 'difficulty',
      total: toNum(found?.total),
      points: toNum(found?.points),
      pointsPct: toNum(found?.pointsPct),
      ppg: toNum(found?.ppg),
      winPct: toNum(found?.winPct),
    }
  })
}
