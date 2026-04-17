//   hub/teamProfile/modules/abilities/components/insightsDrawer/logic/insightsDrawer.logic.js

import { resolveTeamAbilitiesInsights } from '../../../../../../../../../shared/abilities/insights/abilities.insights.js'
import { buildTeamInsights } from '../../../../../../../../../shared/abilities/insights/teamInsights.builder.js'
import {
  buildDomainRows,
  buildPotentialRows,
  buildProfileRows,
  buildReadinessRows,
  buildTopStats,
} from './insightsDrawer.rows.logic.js'
import {
  buildLayerRows,
  buildPositionRows,
  buildRoleRows,
} from './insightsDrawer.breakdown.logic.js'

export function buildTeamAbilitiesInsightsDrawerModel(team = {}, context = {}) {
  const readinessResult = resolveTeamAbilitiesInsights(team, context)
  const teamInsightsResult = buildTeamInsights(team, context)

  return {
    teamName: team?.teamName || team?.name || 'קבוצה',
    isEligible: Boolean(readinessResult?.isEligible),
    topStats: buildTopStats(team, readinessResult, teamInsightsResult),
    readinessRows: buildReadinessRows(readinessResult),
    profileRows: buildProfileRows(teamInsightsResult),
    potentialRows: buildPotentialRows(teamInsightsResult),
    domainRows: buildDomainRows(readinessResult?.domains || []),
    positionRows: buildPositionRows(teamInsightsResult),
    layerRows: buildLayerRows(teamInsightsResult),
    roleRows: buildRoleRows(teamInsightsResult),
    raw: {
      readinessResult,
      teamInsightsResult,
    },
  }
}
