// src/features/bulkActions/games/delete/logic/buildGamesDeleteSummary.js

const asArray = value => (Array.isArray(value) ? value : [])

const hasStats = game => {
  return Boolean(
    game?.hasStats ||
    game?.statsDocId ||
    game?.statsStatus ||
    game?.gameStatsDocId
  )
}

const hasVideo = game => {
  return Boolean(
    game?.videoId ||
    game?.videoUrl ||
    game?.videoLink ||
    game?.hasVideo ||
    game?.videoDocId
  )
}

const isTrainingGame = game => {
  const type = String(game?.gameType || game?.type || '').toLowerCase()
  return type.includes('training') || type.includes('אימון')
}

const isOfficialGame = game => {
  return !isTrainingGame(game)
}

export function buildGamesDeleteSummary(games = []) {
  const rows = asArray(games)

  return rows.reduce(
    (summary, game) => {
      summary.totalGames += 1

      if (hasStats(game)) summary.withStats += 1
      if (hasVideo(game)) summary.withVideo += 1
      if (isOfficialGame(game)) summary.officialGames += 1
      if (isTrainingGame(game)) summary.trainingGames += 1

      return summary
    },
    {
      totalGames: 0,
      withStats: 0,
      withVideo: 0,
      officialGames: 0,
      trainingGames: 0,
    }
  )
}
