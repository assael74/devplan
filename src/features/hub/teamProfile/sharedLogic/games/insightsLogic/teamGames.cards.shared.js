// teamProfile/sharedLogic/games/insightsLogic/teamGames.cards.shared.js

import {
  resolveResultMeta,
  resolveHomeMeta,
} from '../../../../../../shared/games/games.meta.logic.js'

export const EMPTY = '—'

export const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export const toText = (v, fallback = EMPTY) => {
  if (v == null || v === '') return fallback
  return String(v)
}

export const pointsColor = (pct) => {
  if (pct >= 60) return 'success'
  if (pct >= 40) return 'warning'
  return 'danger'
}

export const getDifficultyColor = (id) => {
  if (id === 'easy') return 'success'
  if (id === 'equal') return 'warning'
  if (id === 'hard') return 'danger'
  return 'neutral'
}

export const resolveVenueIcon = (id) => {
  return resolveHomeMeta(id)?.idIcon || 'game'
}

export const getResultMeta = (id) => {
  return resolveResultMeta(id)
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

export const resolveDifficultyBuckets = (grouped) => {
  const byDifficultyRaw = Array.isArray(grouped?.byDifficulty) ? grouped.byDifficulty : []
  const ordered = ['easy', 'equal', 'hard']

  return ordered.map((id) => {
    const found = byDifficultyRaw.find((item) => item?.id === id)

    return {
      id,
      label:
        found?.label ||
        (id === 'easy' ? 'רמה קלה' : id === 'equal' ? 'אותה רמה' : 'רמה קשה'),
      idIcon: found?.idIcon || 'difficulty',
      total: toNum(found?.total),
      points: toNum(found?.points),
      pointsPct: toNum(found?.pointsPct),
      ppg: toNum(found?.ppg),
      winPct: toNum(found?.winPct),
    }
  })
}
