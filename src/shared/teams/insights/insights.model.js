// src/shared/teams/insights/insights.model.js

import {
  TEAM_INSIGHTS_THRESHOLDS,
} from './insights.config.js'

import {
  buildTeamInsightPlayersMap,
} from './insights.players.js'

import {
  buildTeamInsightAspect,
} from './insights.groups.js'

const emptyArray = []
const emptyObject = {}

const getScopeLabel = scope => {
  if (!scope || scope.mode === 'season') return 'כל השנה'
  if (scope.mode === 'range') return 'טווח משחקים'

  return 'סקופ נבחר'
}

const getGamesCount = playerInsights => {
  const safeRows = Array.isArray(playerInsights) ? playerInsights : emptyArray

  return safeRows.reduce((max, row) => {
    const games = Number(row?.games)
    return Number.isFinite(games) ? Math.max(max, games) : max
  }, 0)
}

const buildMeta = ({
  scope,
  playerInsights,
}) => {
  const safeRows = Array.isArray(playerInsights) ? playerInsights : emptyArray

  return {
    scope: {
      mode: scope?.mode || 'season',
      label: getScopeLabel(scope),
      games: getGamesCount(safeRows),
    },

    source: {
      scoring: safeRows.length > 0,
      playerInsights: safeRows.length > 0,
      teamInsights: true,
    },

    thresholds: TEAM_INSIGHTS_THRESHOLDS,
  }
}

export const buildTeamInsights = ({
  playerInsights = emptyArray,
  aspects = emptyArray,
  scope = emptyObject,
} = {}) => {
  const scoresMap = buildTeamInsightPlayersMap(playerInsights)

  const builtAspects = aspects.reduce((acc, aspect) => {
    if (!aspect?.id) return acc

    acc[aspect.id] = buildTeamInsightAspect({
      aspect,
      items: aspect.items,
      scoresMap,
    })

    return acc
  }, {})

  return {
    aspects: builtAspects,
    meta: buildMeta({
      scope,
      playerInsights,
    }),
  }
}
