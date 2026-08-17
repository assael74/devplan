// src/features/playersDatabase/domain/contracts/lifecycle.contract.js

import { cleanDomainValue } from './domainValue.contract.js'

const resolveSeasonStatus = (target, seasonStatus) => {
  const normalizedStatus = cleanDomainValue(seasonStatus)

  if (normalizedStatus === 'completed') return 'completed'
  if (normalizedStatus === 'active') return 'active'

  return cleanDomainValue(target) === 'history'
    ? 'completed'
    : 'active'
}

export const createLifecycle = (target, seasonStatus = '') => {
  const type = cleanDomainValue(target) === 'history' ? 'history' : 'current'
  const resolvedSeasonStatus = resolveSeasonStatus(type, seasonStatus)
  const isFinal = resolvedSeasonStatus === 'completed'

  return {
    type,
    seasonStatus: resolvedSeasonStatus,
    isFinal,
    usesProjection: !isFinal,
  }
}
