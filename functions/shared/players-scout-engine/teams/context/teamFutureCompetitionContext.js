// src/shared/scouting/teams/context/teamFutureCompetitionContext.js

import {
  FUTURE_COMPETITION_OUTLOOK,
} from '../../common/futureCompetition/index.js'

export const buildTeamFutureCompetitionContext = ({ futureCompetitionPath } = {}) => {
  const path = futureCompetitionPath || null

  if (!path) {
    return {
      outlook: FUTURE_COMPETITION_OUTLOOK.UNKNOWN,
      current: null,
      steps: [],
      hasCompletePath: false,
    }
  }

  return {
    outlook: path.outlook || FUTURE_COMPETITION_OUTLOOK.UNKNOWN,
    current: path.current || null,
    steps: Array.isArray(path.steps) ? path.steps : [],
    hasCompletePath: Boolean(path.hasCompletePath),
  }
}
