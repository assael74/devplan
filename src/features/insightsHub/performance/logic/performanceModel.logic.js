// features/insightsHub/performance/logic/performanceModel.logic.js

import {
  buildPlayerOutputShareBlock,
} from './playerOutputShare.logic.js'

import {
  buildPlayerScoringWeightsBlock,
} from './playerScoringWeights.logic.js'

import {
  buildTeamTargetNumbersBlock,
} from './teamTargetNumbers.logic.js'

const blockBuilders = {
  teamTargetProfiles: buildTeamTargetNumbersBlock,
  playerOutputShare: buildPlayerOutputShareBlock,
  playerScoringWeights: buildPlayerScoringWeightsBlock,
}

export const resolveNumbersBlock = (block = null) => {
  if (!block?.type) return null

  const builder = blockBuilders[block.type]

  return typeof builder === 'function'
    ? builder(block)
    : null
}
