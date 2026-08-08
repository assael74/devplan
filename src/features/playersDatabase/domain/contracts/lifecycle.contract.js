// features/playersDatabase/domain/contracts/lifecycle.contract.js

import { cleanDomainValue } from './domainValue.contract.js'

export const createLifecycle = target => {
  const type = cleanDomainValue(target) === 'history' ? 'history' : 'current'
  return {
    type,
    isFinal: type === 'history',
    usesProjection: type === 'current',
  }
}
