// teamProfile/sharedLogic/games/insightsLogic/teamGames.cards.shared.js

import {
  resolveResultMeta,
  resolveHomeMeta,
} from '../../../../../../shared/games/games.meta.logic.js'

import {
  EMPTY,
  toNum,
  toText,
  calcPctFromTotal,
  calcPointsPct,
  resolvePointsColor,
} from './teamGames.view.shared.js'

export {
  EMPTY,
  toNum,
  toText,
  calcPctFromTotal,
  calcPointsPct,
}

export const pointsColor = resolvePointsColor

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

export const resolveDifficultyBuckets = (grouped = {}) => {
  const byDifficultyRaw = Array.isArray(grouped?.byDifficulty)
    ? grouped.byDifficulty
    : []

  const ordered = ['easy', 'equal', 'hard']

  return ordered.map((id) => {
    const found = byDifficultyRaw.find((item) => item?.id === id)

    return {
      id,
      label:
        found?.label ||
        (id === 'easy'
          ? 'רמה קלה'
          : id === 'equal'
            ? 'אותה רמה'
            : 'רמה קשה'),
      idIcon: found?.idIcon || 'difficulty',
      total: toNum(found?.total),
      points: toNum(found?.points),
      pointsPct: toNum(found?.pointsPct),
      ppg: toNum(found?.ppg),
      winPct: toNum(found?.winPct),
    }
  })
}
