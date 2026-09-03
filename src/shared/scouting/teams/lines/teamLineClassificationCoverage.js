// src/shared/scouting/teams/lines/teamLineClassificationCoverage.js

const clean = value => String(value || '').trim()

const toKnownNonNegativeNumber = value => {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  if (!Number.isFinite(number) || number < 0) return null

  return number
}

const getPlayerStats = player => (
  player?.playerStats && typeof player.playerStats === 'object'
    ? player.playerStats
    : player || {}
)

const isOperationalPlayer = player => clean(player?.rosterStatus) !== 'retired'

const isClassifiedPlayer = player => Boolean(clean(player?.lineClassification?.line))

export const buildTeamLineClassificationCoverage = ({ players = [] } = {}) => {
  const rosterPlayers = (Array.isArray(players) ? players : [])
    .filter(player => player && typeof player === 'object')
    .filter(isOperationalPlayer)
  const classifiedPlayers = rosterPlayers.filter(isClassifiedPlayer)
  const totalMinutes = rosterPlayers.reduce((sum, player) => {
    const minutes = toKnownNonNegativeNumber(getPlayerStats(player).minutes)
    return sum + (minutes === null ? 0 : minutes)
  }, 0)
  const classifiedMinutes = classifiedPlayers.reduce((sum, player) => {
    const minutes = toKnownNonNegativeNumber(getPlayerStats(player).minutes)
    return sum + (minutes === null ? 0 : minutes)
  }, 0)

  return {
    playersClassified: classifiedPlayers.length,
    playersTotal: rosterPlayers.length,
    playersRate: rosterPlayers.length > 0
      ? classifiedPlayers.length / rosterPlayers.length
      : 0,
    minutesClassified: classifiedMinutes,
    minutesTotal: totalMinutes,
    minutesRate: totalMinutes > 0
      ? classifiedMinutes / totalMinutes
      : 0,
  }
}
