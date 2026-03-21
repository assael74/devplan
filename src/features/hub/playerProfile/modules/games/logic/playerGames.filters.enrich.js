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
  const entry = findPlayerGameEntry(game, player)
  console.log(player)
  return {
    ...game,
    team: player?.team,
    playerId: player?.id || player?.playerId || '',
    playerFullName: player?.playerFullName || '',
    playerPhoto: player?.photo || '',
    playerPosition: player?.position || '',
    playerEntry: entry,
    hasEntry: !!entry,
    hasVideo: !!safe(game?.vLink).trim(),
  }
}
