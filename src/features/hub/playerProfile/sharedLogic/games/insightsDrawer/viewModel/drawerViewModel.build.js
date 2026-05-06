// playerProfile/sharedLogic/games/insightsDrawer/viewModel/drawerViewModel.build.js

import {
  buildPlayerBriefCards,
  buildPlayerGamesTopStats,
} from '../cards/index.js'

import {
  resolvePlayerGamesDrawerContext,
  resolvePlayerGamesReady,
  resolvePlayerTeamContextReady,
} from './drawerContext.resolve.js'

import {
  buildPlayerMainDiagnosisViewModel,
} from '../diagnosis/index.js'

export const buildPlayerGamesDrawerViewModel = (insights = {}) => {
  const context = resolvePlayerGamesDrawerContext(insights)
  const mainDiagnosis = buildPlayerMainDiagnosisViewModel(insights)

  const {
    games,
    teamContext,
    readiness,
    blocking,
    targets,
  } = context

  const gamesReady = resolvePlayerGamesReady({
    readiness,
    games,
  })

  const teamContextReady = resolvePlayerTeamContextReady({
    readiness,
    teamContext,
  })

  const safeGames = gamesReady ? games : {}

  const topStats = buildPlayerGamesTopStats({
    games: safeGames,
    targets,
  })

  const briefCards = buildPlayerBriefCards(insights)

  return {
    context,

    readiness,

    gamesReady,
    teamContextReady,

    topStats,
    briefCards,

    briefs: context.briefs,
    briefsOrder: context.briefsOrder,
    briefsList: context.briefsList,

    games: safeGames,
    teamContext,
    mainDiagnosis,

    targets,
    reliability: context.reliability,

    blocked: {
      games: !gamesReady,
      gamesReasons: !gamesReady
        ? blocking?.games || blocking?.medium || []
        : [],

      teamContext: !teamContextReady,
      teamContextReasons: !teamContextReady
        ? blocking?.teamContext || blocking?.heavy || []
        : [],
    },
  }
}
