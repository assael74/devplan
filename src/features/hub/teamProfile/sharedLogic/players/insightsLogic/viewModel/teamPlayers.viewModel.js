// TEAMPROFILE/sharedLogic/players/insightsLogic/viewModel/teamPlayers.viewModel.js

import {
  buildStructureCards,
  buildRoleCards,
  buildPositionCards,
  buildProjectCards,
  buildUsageCards,
  buildUsageSummaryChips,
  buildProductionCards,
} from './cards/index.js'

import {
  buildTakeawaysModel,
} from './takeaways/index.js'

import {
  buildOutcomeViewModel,
} from './outcome/index.js'

const emptyObject = {}
const emptyArray = []

export const buildTeamPlayersViewModel = ({ insights, performanceScope } = {}) => {
  if (!insights) return null

  const structure = insights.structure || emptyObject
  const usage = insights.usage || emptyObject
  const production = insights.production || emptyObject
  const alignment = insights.alignment || emptyObject
  const flags = insights.flags || emptyObject
  const meta = insights.meta || emptyObject

  const playerPerformanceRows = Array.isArray(insights.playerPerformanceRows)
    ? insights.playerPerformanceRows
    : emptyArray

  const positionsPrimary = buildPositionCards({
    structure,
    mode: 'primary',
  })

  const positionsCoverage = buildPositionCards({
    structure,
    mode: 'coverage',
  })

  const cards = {
    structure: buildStructureCards({
      structure,
      alignment,
    }),

    roles: buildRoleCards({
      structure,
    }),

    positions: positionsPrimary,
    positionsPrimary,
    positionsCoverage,

    project: buildProjectCards({
      structure,
    }),

    usage: buildUsageCards({
      usage,
    }),

    production: buildProductionCards({
      production,
    }),
  }

  const summaryChips = {
    usage: buildUsageSummaryChips({
      usage,
    }),
  }

  const takeaways = buildTakeawaysModel({
    structure,
    usage,
    production,
    alignment,
    flags,
  })

  const outcomeView = buildOutcomeViewModel({
    structure,
    usage,
    production,
    alignment,
    playerPerformanceRows,
    performanceScope,
  })
  
  return {
    structure,
    usage,
    production,
    alignment,
    flags,
    meta,
    cards,
    summaryChips,
    takeaways,

    build: {
      cards,
      takeaways,
    },

    outcomeView,

    productionView: {
      cards,
      summaryChips,
      takeaways,
    },

    actions: {
      flags,
      takeaways,
    },
  }
}
