import {
  updatePlayerAgent,
  updatePlayerSeasonGoalDistribution,
} from '../../players/index.js'

export const updatePlayerAgentFlow = payload => updatePlayerAgent(payload)

export const updatePlayerSeasonGoalDistributionFlow = payload => (
  updatePlayerSeasonGoalDistribution(payload)
)
