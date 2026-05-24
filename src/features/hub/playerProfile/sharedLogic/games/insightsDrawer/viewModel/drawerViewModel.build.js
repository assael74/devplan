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

const emptyObject = {}

const buildScoringGamesSnapshot = ({ games, scoring }) => {
  if (!scoring) return games

  const summary = scoring?.summary || emptyObject
  const rows = Array.isArray(scoring?.rows) ? scoring.rows : []

  return {
    ...(games || {}),

    scoring,

    rows,
    points: scoring?.points || rows,
    byGameId: scoring?.byGameId || {},

    rating:
      summary?.avgRating ??
      summary?.rating ??
      games?.rating ??
      null,

    ratingRaw:
      summary?.ratingRaw ??
      summary?.avgRating ??
      games?.ratingRaw ??
      null,

    avgRating:
      summary?.avgRating ??
      games?.avgRating ??
      null,

    totalImpact:
      summary?.totalImpact ??
      games?.totalImpact ??
      null,

    cumulativeImpact:
      summary?.cumulativeImpact ??
      summary?.totalImpact ??
      games?.cumulativeImpact ??
      null,

    tva:
      summary?.tva ??
      summary?.totalImpact ??
      games?.tva ??
      null,

    totalMinutes:
      summary?.totalMinutes ??
      games?.totalMinutes ??
      null,

    goals:
      summary?.goals ??
      games?.goals ??
      0,

    assists:
      summary?.assists ??
      games?.assists ??
      0,

    involvement:
      summary?.involvement ??
      games?.involvement ??
      0,

    ratedGames:
      summary?.ratedGames ??
      summary?.ratedScores ??
      games?.ratedGames ??
      null,

    isReady: true,

    meta: {
      ...(games?.meta || {}),
      scoringSource: scoring?.meta?.source || '',
      scoringReady: scoring?.meta?.ready === true,
      scoringRows: rows.length,
    },
  }
}

export const buildPlayerGamesDrawerViewModel = (insights = {}) => {
  const context = resolvePlayerGamesDrawerContext(insights)
  const mainDiagnosis = buildPlayerMainDiagnosisViewModel(insights)

  const {
    games,
    teamContext,
    readiness,
    blocking,
    targets,
    scoring,
  } = context

  const gamesReady = resolvePlayerGamesReady({
    readiness,
    games,
    scoring,
  })

  const teamContextReady = resolvePlayerTeamContextReady({
    readiness,
    teamContext,
  })

  const safeGames = gamesReady
    ? buildScoringGamesSnapshot({
        games,
        scoring,
      })
    : {}

  const topStats = buildPlayerGamesTopStats({
    games: safeGames,
    targets,
  })

  const briefCards = buildPlayerBriefCards({
    ...insights,
    games: safeGames,
    scoring,
  })

  return {
    context,

    readiness,

    gamesReady,
    teamContextReady,

    scoring,

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
