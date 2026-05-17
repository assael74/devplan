// TEAMPROFILE/sharedLogic/players/insightsLogic/model.js

import {
  buildTeamPlayersInsights,
} from './insights.logic.js'

import {
  buildTeamPlayersViewModel,
} from './viewModel/index.js'

import {
  buildPerf,
} from './performance/index.js'

const emptyArray = []
const emptyObject = {}

const getGames = ({ games, team }) => {
  if (Array.isArray(games)) return games
  if (Array.isArray(team?.teamGames)) return team.teamGames

  return emptyArray
}

export const buildEmptyModel = ({ team, isBuilding = false } = {}) => {
  return {
    liveTeam: team || emptyObject,

    insights: null,
    isBuilding,

    structure: emptyObject,
    usage: emptyObject,
    production: emptyObject,
    alignment: emptyObject,
    flags: emptyObject,
    meta: emptyObject,

    playerPerformance: null,
    scopedPlayerPerformance: null,
    playerPerformanceRows: emptyArray,

    cards: {
      structure: emptyArray,
      roles: emptyArray,
      positions: emptyArray,
      positionsPrimary: emptyArray,
      positionsCoverage: emptyArray,
      project: emptyArray,
      usage: emptyArray,
      production: emptyArray,
    },

    summaryChips: {
      usage: emptyArray,
    },

    takeaways: emptyObject,
    outcomeView: emptyObject,

    build: emptyObject,
    productionView: emptyObject,
    actions: emptyObject,
  }
}

export const buildModel = ({
  rows = emptyArray,
  summary = emptyObject,
  team = emptyObject,
  games,
  enabled = true,
  calculationMode = 'games',
  performanceScope,
} = {}) => {
  if (!enabled) {
    return buildEmptyModel({ team, isBuilding: true })
  }

  const insights = buildTeamPlayersInsights({
    rows,
    summary,
    team,
  })

  if (!insights) {
    return buildEmptyModel({ team, isBuilding: true })
  }

  const sourceGames = getGames({
    games,
    team,
  })

  const perf = buildPerf({
    games: sourceGames,
    team,
    calculationMode,
    performanceScope,
  })

  const mergedInsights = {
    ...insights,
    ...perf,
  }

  const view = buildTeamPlayersViewModel({
    insights: mergedInsights,
    performanceScope,
  })

  if (!view) {
    return buildEmptyModel({ team, isBuilding: true })
  }

  return {
    liveTeam: team,

    insights: mergedInsights,
    isBuilding: false,

    ...perf,
    ...view,
  }
}
