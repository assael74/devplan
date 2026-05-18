// TEAMPROFILE/sharedLogic/players/insightsLogic/print/teamPlayersInsightsPrint.model.js

import {
  getGameLabel,
  getRangeGames,
} from './print.utils.js'

import {
  buildRecommendations,
  buildRoleSections,
  buildSummary,
} from './print.sections.js'

const getScopeTitle = ({ performanceScope }) => {
  if (performanceScope?.mode === 'range') {
    return 'טווח משחקים'
  }

  return 'כל השנה'
}

const getScopeDescription = ({
  performanceScope,
  rangeGames,
}) => {
  if (!rangeGames.length) {
    return 'לא נמצאו משחקי ליגה ששוחקו בפועל'
  }

  if (performanceScope?.mode !== 'range') {
    return `${rangeGames.length} משחקי ליגה ששוחקו`
  }

  const first = rangeGames[0]
  const last = rangeGames[rangeGames.length - 1]

  return [
    `${rangeGames.length} משחקים`,
    `מ־${getGameLabel(first)}`,
    `עד ${getGameLabel(last)}`,
  ].join(' · ')
}

const getRowsSource = model => {
  return Array.isArray(model?.playerPerformanceRows)
    ? model.playerPerformanceRows
    : []
}

export const buildTeamPlayersInsightsPrintModel = ({
  team,
  model,
  games,
  performanceScope,
} = {}) => {
  const rows = getRowsSource(model)

  const rangeGames = getRangeGames({
    games,
    performanceScope,
  })

  const title = 'דוח תפקוד סגל והמלצות'
  const teamName = team?.teamName || team?.name || 'קבוצה'

  return {
    title,
    teamName,

    scope: {
      mode: performanceScope?.mode || 'season',
      title: getScopeTitle({
        performanceScope,
      }),
      description: getScopeDescription({
        performanceScope,
        rangeGames,
      }),
      gamesCount: rangeGames.length,
    },

    summary: buildSummary({
      rows,
      rangeGames,
    }),

    roleSections: buildRoleSections(rows),
    recommendations: buildRecommendations(model),
  }
}
