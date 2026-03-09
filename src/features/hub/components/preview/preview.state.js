// features/hub/components/preview/preview.state.js
export const DOMAIN_STATE = {
  EMPTY: 'EMPTY',
  PARTIAL: 'PARTIAL',
  OK: 'OK',
  STALE: 'STALE',
  LOCKED: 'LOCKED',
}

export function getDomainState({ count, isLocked, isStale }) {
  if (isLocked) return DOMAIN_STATE.LOCKED
  if (typeof count === 'number') {
    if (count <= 0) return DOMAIN_STATE.EMPTY
    if (isStale) return DOMAIN_STATE.STALE
    return DOMAIN_STATE.OK
  }
  return DOMAIN_STATE.PARTIAL
}
