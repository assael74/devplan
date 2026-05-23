// src/shared/games/insights/team/sections/performance/performance.tone.js

const getDeltaTone = ({
  value,
  positiveIsGood = true,
  strong = 1,
  weak = 0.25,
}) => {
  const num = Number(value)

  if (!Number.isFinite(num)) return 'neutral'
  if (Math.abs(num) < weak) return 'neutral'

  const good = positiveIsGood
    ? num > 0
    : num < 0

  if (good) return Math.abs(num) >= strong ? 'success' : 'primary'

  return Math.abs(num) >= strong ? 'danger' : 'warning'
}

export const getRatingTone = (rating) => {
  const num = Number(rating)

  if (!Number.isFinite(num)) return 'neutral'
  if (num >= 6.35) return 'success'
  if (num >= 6.1) return 'primary'
  if (num >= 5.9) return 'neutral'
  if (num >= 5.7) return 'warning'

  return 'danger'
}

export const getTvaTone = (tva) => {
  return getDeltaTone({
    value: tva,
    positiveIsGood: true,
    strong: 2,
    weak: 0.3,
  })
}

export const getPointsPaceTone = (delta) => {
  return getDeltaTone({
    value: delta,
    positiveIsGood: true,
    strong: 2,
    weak: 0.5,
  })
}

export const getGoalsForTone = (delta) => {
  return getDeltaTone({
    value: delta,
    positiveIsGood: true,
    strong: 2,
    weak: 0.5,
  })
}

export const getGoalsAgainstTone = (delta) => {
  return getDeltaTone({
    value: delta,
    positiveIsGood: false,
    strong: 2,
    weak: 0.5,
  })
}
