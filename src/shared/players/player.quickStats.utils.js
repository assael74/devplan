// src/shared/players/player.quickStats.utils.js

const num = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const clamp = (n, min, max) => {
  return Math.min(Math.max(n, min), max)
}

export const formatTimePlayedLabel = (timePlayed, totalGameTime) => {
  return `${num(totalGameTime)} / ${num(timePlayed)}`
}

export const formatTimeRateLabel = (playTimeRate) => {
  return `${num(playTimeRate)}%`
}

export const colorTR = (rate) => {
  const r = Number(rate) || 0

  if (r >= 70) return 'success'
  if (r <= 30) return 'danger'
  return 'neutral'
}

export const getPlayerQuickStats = ({ player, team } = {}) => {
  const stats = player?.playerFullStats || {}

  const games = num(stats?.games)
  const goals = num(stats?.goals)
  const assists = num(stats?.assists)

  const timePlayed = num(stats?.timePlayed)
  const totalGameTime = num(team?.teamFullStats?.totalGameTime)

  const playTimeRate = totalGameTime > 0 ? clamp(Math.round((timePlayed / totalGameTime) * 100), 0, 100) : 0
  const trColor = colorTR(playTimeRate)

  const timePlayedLabel = formatTimePlayedLabel(timePlayed, totalGameTime)
  const timeRateLabel = formatTimeRateLabel(playTimeRate)

  return {
    games,
    goals,
    assists,
    trColor,
    timePlayed,
    playTimeRate,
    totalGameTime,
    timePlayedLabel,
    timeRateLabel,
  }
}
