// playerProfile/sharedLogic/games/insightsDrawer/viewModel/drawerContext.resolve.js

const emptyObject = {}

const resolveScoring = insights => {
  return (
    insights?.scoring ||
    insights?.profileData?.playerScoring ||
    insights?.profileData?.scoring?.player ||
    null
  )
}

const resolveScoringSummary = scoring => {
  return scoring?.summary || emptyObject
}

const resolveScoringTrend = scoring => {
  return scoring?.trend || emptyObject
}

const hasScoringRows = scoring => {
  return Array.isArray(scoring?.rows) && scoring.rows.length > 0
}

export const resolvePlayerGamesReady = ({
  readiness = {},
  games = null,
  scoring = null,
}) => {
  return (
    readiness?.gamesReady === true ||
    readiness?.mediumReady === true ||
    Boolean(games?.isReady) ||
    hasScoringRows(scoring)
  )
}

export const resolvePlayerTeamContextReady = ({
  readiness = {},
  teamContext = null,
}) => {
  return (
    readiness?.teamContextReady === true ||
    readiness?.heavyReady === true ||
    teamContext?.meta?.hasEnoughData === true
  )
}

export const resolvePlayerGamesDrawerContext = (insights = {}) => {
  const games = insights?.games || insights?.summary?.medium || null
  const teamContext = insights?.teamContext || insights?.summary?.teamContext || null

  const scoring = resolveScoring(insights)
  const scoringSummary = resolveScoringSummary(scoring)
  const scoringTrend = resolveScoringTrend(scoring)

  return {
    player: insights?.player || insights?.entity || {},
    team: insights?.team || {},

    games,
    teamContext,

    scoring,
    scoringSummary,
    scoringTrend,

    targets: insights?.targets || games?.targets || {},
    reliability:
      insights?.reliability ||
      games?.reliability ||
      scoringSummary?.reliability ||
      {},

    readiness: insights?.readiness || {},
    blocking: insights?.blocking || {},

    briefs: insights?.briefs || insights?.sections || {},
    briefsOrder: Array.isArray(insights?.briefsOrder)
      ? insights.briefsOrder
      : [],
    briefsList: Array.isArray(insights?.briefsList)
      ? insights.briefsList
      : [],

    leagueGameTime:
      insights?.leagueGameTime ||
      games?.leagueGameTime ||
      insights?.team?.leagueGameTime ||
      90,
  }
}
