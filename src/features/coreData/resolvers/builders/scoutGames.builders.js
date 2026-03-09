import { safeArr, safeBool, safeNum, safeStr } from '../../utils/data.utils.js'

const normalizeScoutGame = (game = {}) => ({
  ...game,
  gameDate: game?.gameDate ?? null,
  gameDuration: safeNum(game?.gameDuration),
  timePlayed: safeNum(game?.timePlayed),
  isStarting: safeBool(game?.isStarting),
  isSelected: safeBool(game?.isSelected),
  scored: safeNum(game?.scored),
  rivel: safeStr(game?.rivel),
  gameNum: safeNum(game?.gameNum),
})

export const buildScoutGamesSummary = (gamesArr = []) => {
  const games = safeArr(gamesArr).map(normalizeScoutGame)

  const startedCount = games.reduce((sum, game) => sum + (game.isStarting ? 1 : 0), 0)
  const selectedCount = games.reduce((sum, game) => sum + (game.isSelected ? 1 : 0), 0)
  const minutesPlayedSum = games.reduce((sum, game) => sum + game.timePlayed, 0)
  const minutesTotalSum = games.reduce((sum, game) => sum + game.gameDuration, 0)
  const goalsSum = games.reduce((sum, game) => sum + game.scored, 0)

  return {
    games,
    stats: {
      startedCount,
      selectedCount,
      minutesPlayedSum,
      minutesTotalSum,
      minutesPct: minutesTotalSum > 0
        ? Math.round((minutesPlayedSum / minutesTotalSum) * 1000) / 10
        : 0,
      goalsSum,
      numGames: games.length,
    },
  }
}
