// playerProfile/sharedLogic/games/insightsDrawer/viewModel/drawerContext.resolve.js

export const resolvePlayerGamesReady = ({ readiness = {}, games = null }) => {
  return (
    readiness?.gamesReady === true ||
    readiness?.mediumReady === true ||
    Boolean(games?.isReady)
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

  return {
    player: insights?.player || insights?.entity || {},
    team: insights?.team || {},

    games,
    teamContext,

    targets: insights?.targets || games?.targets || {},
    reliability: insights?.reliability || games?.reliability || {},

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
