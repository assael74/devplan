// src/features/hub/playerProfile/sharedLogic/games/module/playerGames.filters.enrich.js

const safe = (v) => (v == null ? '' : String(v))
const safeArray = (v) => (Array.isArray(v) ? v : [])

export const findPlayerGameEntry = (game, player) => {
  const playerId = safe(player?.id || player?.playerId).trim()
  const source = game?.game || game
  const rows = safeArray(source?.gamePlayers)

  if (!playerId) return null

  return rows.find((item) => {
    const itemPlayerId = safe(item?.playerId || item?.id).trim()
    return itemPlayerId === playerId
  }) || null
}

export const enrichGameWithPlayerLocalMeta = (game, player) => {
  const entry = game?.playerGame || null
  const gameLeagueNum = game?.gameLeagueNum || game?.game?.gameLeagueNum || 0

  return {
    ...game,
    team: game?.team || player?.team || null,
    playerId: player?.id || player?.playerId || '',
    playerFullName: player?.playerFullName || '',
    playerPhoto: player?.photo || '',
    playerPosition: player?.position || '',
    playerEntry: entry,
    hasEntry: !!entry,
    hasVideo: !!safe(game?.vLink).trim(),
    gameLeagueNum,

    goals: Number(entry?.goals) || 0,
    assists: Number(entry?.assists) || 0,
    timePlayed: Number(entry?.timePlayed) || 0,
    isSelected: entry?.isSelected === true,
    isStarting: entry?.isStarting === true,
  }
}
