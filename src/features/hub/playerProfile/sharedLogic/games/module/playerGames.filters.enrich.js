// playerProfile/sharedLogic/games/module/playerGames.filters.enrich.js

const safe = (v) => (v == null ? '' : String(v))
const safeArray = (v) => (Array.isArray(v) ? v : [])

export const findPlayerGameEntry = (game, player) => {
  const playerId = player?.id || player?.playerId || ''
  const rows = safeArray(game?.gamePlayers)

  return rows.find((item) => {
    const itemPlayerId = item?.playerId || item?.id || ''
    return itemPlayerId === playerId
  }) || null
}

export const enrichGameWithPlayerLocalMeta = (game, player) => {
  const entry = game?.playerGame || null

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

    goals: Number(entry?.goals) || 0,
    assists: Number(entry?.assists) || 0,
    timePlayed: Number(entry?.timePlayed) || 0,
    isSelected: entry?.isSelected === true,
    isStarting: entry?.isStarting === true,
  }
}
