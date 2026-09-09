// src/features/playersDatabase/domain/contracts/lifecycle.contract.js

import { cleanDomainValue } from './domainValue.contract.js'

const resolveSeasonStatus = (target, seasonStatus) => {
  const normalizedStatus = cleanDomainValue(seasonStatus)

  if (normalizedStatus === 'completed') return 'completed'
  if (normalizedStatus === 'active') return 'active'
  if (normalizedStatus === 'not_started') return 'not_started'

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
    // A future season lives in `current`, but has no actual data from which
    // a projection can be calculated.  Only an explicitly active season can
    // use projected values.
    usesProjection: resolvedSeasonStatus === 'active',
  }
}
