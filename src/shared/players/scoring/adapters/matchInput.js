// src/shared/players/scoring/adapters/matchInput.js

/*
|--------------------------------------------------------------------------
| Player Scoring Engine / Adapter. Match Input
|--------------------------------------------------------------------------
|
| אחריות:
| בניית input אחיד לציון משחק מתוך game row, team ו־playerId.
|
| סדר במנוע:
| Adapter לפני scoring.match.js.
|
| תפקיד:
| למצוא את playerGame מתוך game.gamePlayers,
| למצוא את player מתוך team.players,
| ולהחזיר אובייקט מוכן ל־buildPlayerMatchScore.
*/

const asText = (value) => {
  return value == null ? '' : String(value).trim()
}

const getGameObject = (row = {}) => {
  return row?.game || row
}

const getGamePlayers = (row = {}) => {
  const game = getGameObject(row)

  if (Array.isArray(game?.gamePlayers)) return game.gamePlayers
  if (Array.isArray(row?.gamePlayers)) return row.gamePlayers

  return []
}

const getPlayerId = (item = {}) => {
  return asText(
    item?.id ||
      item?.playerId ||
      item?.player?.id ||
      item?.raw?.id ||
      ''
  )
}

const findPlayerGame = ({
  row,
  playerId,
}) => {
  const id = asText(playerId)

  if (!id) return null

  return (
    getGamePlayers(row).find((item) => {
      return asText(item?.playerId) === id
    }) || null
  )
}

const findTeamPlayer = ({
  team,
  playerId,
}) => {
  const id = asText(playerId)
  const players = Array.isArray(team?.players) ? team.players : []

  if (!id || !players.length) return null

  return (
    players.find((item) => {
      return getPlayerId(item) === id
    }) || null
  )
}

export const buildMatchScoreInput = ({
  row,
  game,
  team,
  player,
  playerId,
  calculationMode,
  coachAssessment,
} = {}) => {
  const activeRow = row || game || {}
  const id = asText(playerId) || getPlayerId(player)

  const playerGame = findPlayerGame({
    row: activeRow,
    playerId: id,
  })

  const resolvedPlayer = player || findTeamPlayer({
    team,
    playerId: id,
  })

  return {
    player: resolvedPlayer,
    team,
    game: activeRow,
    playerGame,
    calculationMode,
    coachAssessment,
  }
}
