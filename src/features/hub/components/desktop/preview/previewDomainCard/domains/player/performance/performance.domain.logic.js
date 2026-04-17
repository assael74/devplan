// src/features/players/components/preview/PreviewDomainCard/domains/performance/performance.domain.logic.js
import { DOMAIN_STATE } from '../../../../preview.state'

const n = (v) => {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

export const resolvePerformanceDomain = (entity) => {
  const s = entity?.playerFullStats || {}

  const gamesCount = n(s.gamesCount)
  const totalGameTime = n(s.totalGameTime)

  let state = DOMAIN_STATE.EMPTY
  if (gamesCount === 0) state = DOMAIN_STATE.EMPTY
  else if (totalGameTime === 0) state = DOMAIN_STATE.PARTIAL
  else state = DOMAIN_STATE.OK

  return {
    state,
    stats: {
      gamesCount,
      goals: n(s.goals),
      assists: n(s.assists),
      timePlayed: n(s.timePlayed),
      totalGameTime,
      playTimeRate: n(s.playTimeRate),
    },
  }
}
