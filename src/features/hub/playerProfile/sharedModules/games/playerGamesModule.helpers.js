// playerProfile/sharedModules/games/playerGamesModule.helpers.js

const LEAGUE_GAME_TYPE = 'league'

export const getGameObject = (row = {}) => {
  return row?.game || row
}

export const isLeagueGame = (row = {}) => {
  const game = getGameObject(row)
  const type = String(row?.type || game?.type || '').toLowerCase()

  return type === LEAGUE_GAME_TYPE
}

export const isPrivatePlayerEntity = player => {
  return (
    player?.isPrivatePlayer === true ||
    player?.playerSource === 'private'
  )
}
