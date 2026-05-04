// teamProfile/sharedLogic/games/insightsLogic/teamGames.cards.logic.js

import {
  buildTeamGamesTopStats,
  buildTeamGamesCards,
} from './teamGames.cards.result.js'

import {
  buildHomeAwayInsightItems,
  buildDifficultyInsightItems,
  buildFeedInsightItems,
} from './teamGames.cards.grouped.js'

import { buildTeamGamesTargetProgress } from './teamGames.targets.logic.js'
import { buildTeamGamesHomeAwayProjection } from './teamGames.homeAway.logic.js'
import { buildTeamGamesDifficultyProjection } from './teamGames.difficulty.logic.js'
import { buildTeamGamesSquadMetrics } from './teamGames.squad.logic.js'

export {
  buildTeamGamesTopStats,
  buildTeamGamesCards,
  buildHomeAwayInsightItems,
  buildDifficultyInsightItems,
  buildFeedInsightItems,
  buildTeamGamesTargetProgress,
  buildTeamGamesHomeAwayProjection,
  buildTeamGamesDifficultyProjection,
  buildTeamGamesSquadMetrics,
}

const resolveGamesReady = ({ readiness = {}, games = null }) => {
  return readiness?.gamesReady === true || readiness?.mediumReady === true || Boolean(games)
}

const resolveTeamGamesDrawerContext = (insights = {}) => {
  const league = insights?.league || insights?.sources?.team || {}
  const games = insights?.games || insights?.sources?.games || null
  const calculation = insights?.calculation || {}
  const active = calculation?.active || insights?.active || league

  return {
    team: insights?.team || insights?.entity || {},
    league,
    games,
    calculation,
    active,
    isGamesMode: calculation?.mode === 'games',
    readiness: insights?.readiness || {},
    sync: insights?.sync || {},
    coverage: insights?.coverage || {},
  }
}

export const buildTeamGamesDrawerViewModel = (insights) => {
  const {
    team,
    games,
    calculation,
    active,
    isGamesMode,
    readiness,
    sync,
    coverage,
  } = resolveTeamGamesDrawerContext(insights)

  const gamesReady = resolveGamesReady({
    readiness,
    games,
  })

  const safeGames = gamesReady ? games : null

  return {
    calculation,
    readiness,
    sync,
    coverage,

    targetProgress: buildTeamGamesTargetProgress({
      source: active,
      calculation,
      coverage,
      sync,
      targets: insights?.targets || {},
      benchmarkLevel: insights?.benchmarkLevel || null,
      forecastLevel: insights?.forecastLevel || null,
    }),

    homeAwayProjection: isGamesMode
      ? buildTeamGamesHomeAwayProjection({
          source: active,
          games: safeGames || {},
        })
      : null,

    difficultyProjection: isGamesMode
      ? buildTeamGamesDifficultyProjection({
          games: safeGames || {},
        })
      : null,

    squadMetrics: isGamesMode
      ? buildTeamGamesSquadMetrics({
          team,
          games: safeGames || {},
        })
      : null,

    blocked: {
      games: !gamesReady,
      gamesReasons: !gamesReady
        ? insights?.blocking?.games || insights?.blocking?.medium || []
        : [],

      sync: sync?.isSynced === false,
      syncReasons: sync?.isSynced === false
        ? sync?.blockingReasons || []
        : [],
    },
  }
}
