// src/features/reports/performance/performance.definition.js

import {
  buildPerformanceViewModel,
} from './presentation/buildPerformanceViewModel.js'

export const performanceDefinition = {
  normalizeContent(content = {}) {
    return content && typeof content === 'object' ? content : {}
  },
  buildViewModel: buildPerformanceViewModel,
}
