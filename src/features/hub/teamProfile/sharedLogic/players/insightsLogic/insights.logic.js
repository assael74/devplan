// src/features/hub/teamProfile/sharedLogic/players/insightsLogic/insights.logic.js

import {
  buildData,
} from './data.js'

export const buildTeamPlayersInsights = ({ rows = [], summary = {}, team = {} } = {}) => {
  return buildData({
    rows,
    summary,
    team,
  })
}
