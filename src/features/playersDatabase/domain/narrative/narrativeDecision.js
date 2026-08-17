// src/features/playersDatabase/domain/narrative/narrativeDecision.js

import { normalizeNarrativeSnapshot } from './narrativeState.js'

const resolveApprovedSnapshot = current => (
  normalizeNarrativeSnapshot(
    current?.approved || current?.state?.approved || current
  )
)

export const resolveNarrativeAction = ({ current, inputHash } = {}) => {
  const approved = resolveApprovedSnapshot(current)

  if (!inputHash) {
    return {
      action: 'skip',
      reason: 'missingInputHash',
    }
  }

  if (approved?.inputHash === inputHash) {
    return {
      action: 'reuse',
      reason: 'sameMeaning',
    }
  }

  return {
    action: 'generate',
    reason: approved ? 'meaningChanged' : 'missingNarrative',
  }
}
