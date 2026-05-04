// shared/games/insights/shared/insightNumbers.js

export const toNumber = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

export const roundNumber = (value, digits = 1, fallback = 0) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback

  return Number(number.toFixed(digits))
}

export const calcPercent = (part, total, fallback = 0) => {
  const partNumber = Number(part)
  const totalNumber = Number(total)

  if (!Number.isFinite(partNumber) || !Number.isFinite(totalNumber) || totalNumber <= 0) {
    return fallback
  }

  return Math.round((partNumber / totalNumber) * 100)
}

export const calcAverage = (sum, total, digits = 1, fallback = 0) => {
  const sumNumber = Number(sum)
  const totalNumber = Number(total)

  if (!Number.isFinite(sumNumber) || !Number.isFinite(totalNumber) || totalNumber <= 0) {
    return fallback
  }

  return Number((sumNumber / totalNumber).toFixed(digits))
}

export const calcProjection = ({ currentValue, currentGames, totalGames, digits = 1 }) => {
  const value = Number(currentValue)
  const played = Number(currentGames)
  const total = Number(totalGames)

  if (
    !Number.isFinite(value) ||
    !Number.isFinite(played) ||
    !Number.isFinite(total) ||
    played <= 0 ||
    total <= 0
  ) {
    return 0
  }

  return Number(((value / played) * total).toFixed(digits))
}
