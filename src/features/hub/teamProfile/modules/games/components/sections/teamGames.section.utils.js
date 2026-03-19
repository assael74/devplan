// teamProfile/modules/games/components/sections/teamGames.section.utils.js

const safe = (v) => (v == null ? '' : String(v))

const resultColorMap = {
  win: 'success',
  draw: 'warning',
  loss: 'danger',
}

const resultLabelMap = {
  win: 'ניצחון',
  draw: 'תיקו',
  loss: 'הפסד',
}

export const getResultKey = (game) => safe(game?.result).trim().toLowerCase()

export const getResultLabel = (game) => {
  return game?.resultH || resultLabelMap[getResultKey(game)] || 'לא שוחק'
}

export const getResultColor = (game) => {
  return resultColorMap[getResultKey(game)] || 'neutral'
}

export const getHomeAwayLabel = (game) => {
  if (game?.homeH) return game.homeH
  if (game?.homeKey === 'home') return 'בית'
  if (game?.homeKey === 'away') return 'חוץ'
  return 'לא הוגדר'
}

export const getHomeAwayIcon = (game) => {
  if (game?.homeIcon) return game.homeIcon
  if (game?.homeKey === 'away') return 'away'
  return 'home'
}

export const getHomeAwayColor = (game) => {
  if (game?.homeKey === 'home') return 'success'
  if (game?.homeKey === 'away') return 'danger'
  return 'neutral'
}

export const getGamePlayers = (game) => {
  return Array.isArray(game?.gamePlayers) ? game.gamePlayers : []
}

export const getSquadPlayers = (players) => {
  const base = Array.isArray(players) ? players : []
  return base.filter((player) => player?.onSquad === true)
}

export const getPlayedPlayers = (players) => {
  const base = Array.isArray(players) ? players : []

  return base.filter((player) => {
    const timePlayed = Number(player?.timePlayed)
    return Number.isFinite(timePlayed) && timePlayed > 0
  })
}

export const getScorers = (players) => {
  const base = Array.isArray(players) ? players : []
  return base.filter((player) => Number(player?.goals) > 0)
}

export const getAssisters = (players) => {
  const base = Array.isArray(players) ? players : []
  return base.filter((player) => Number(player?.assists) > 0)
}
