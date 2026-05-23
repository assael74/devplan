// teamProfile/sharedLogic/games/insightsLogic/viewModel/drawerContext.resolve.js

const emptyArray = []

export const resolveGamesReady = ({ readiness = {}, games = null }) => {
  return (
    readiness?.gamesReady === true ||
    readiness?.mediumReady === true ||
    Boolean(games)
  )
}

const resolveInsightGames = insights => {
  return (
    insights?.games ||
    insights?.sources?.games ||
    null
  )
}

const resolveRawGames = insights => {
  return Array.isArray(insights?.rawGames)
    ? insights.rawGames
    : emptyArray
}

export const resolveTeamGamesDrawerContext = (insights = {}) => {
  const league = insights?.league || insights?.sources?.team || {}
  const games = resolveInsightGames(insights)
  const rawGames = resolveRawGames(insights)
  const calculation = insights?.calculation || {}
  const active = calculation?.active || insights?.active || league

  return {
    team: insights?.team || insights?.entity || {},
    league,
    games,
    rawGames,
    calculation,
    active,
    isGamesMode: calculation?.mode === 'games',
    readiness: insights?.readiness || {},
    sync: insights?.sync || {},
    coverage: insights?.coverage || {},
    targets: insights?.targets || {},
    benchmarkLevel: insights?.benchmarkLevel || null,
    forecastLevel: insights?.forecastLevel || null,
    targetProfile: insights?.targetProfile || null,
    forecastProfile: insights?.forecastProfile || null,
    targetGap: insights?.targetGap || null,
    blocking: insights?.blocking || {},
  }
}
