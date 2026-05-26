// features/insightsHub/performance/data/performanceModel.steps.js

import {
  introSteps,
  outcomeSteps,
  scoringSteps,
  targetsSteps,
} from './steps/index.js'

export const PERFORMANCE_MODEL_STEPS = [
  ...introSteps,
  ...targetsSteps,
  ...scoringSteps,
  ...outcomeSteps,
]
