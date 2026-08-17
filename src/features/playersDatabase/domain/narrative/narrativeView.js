// src/features/playersDatabase/domain/narrative/narrativeView.js

import { NARRATIVE_SCOPE } from './narrative.contract.js'
import { buildNarrativePlan } from './narrativePlan.js'
import { normalizePlayerNarrative } from './narrativeState.js'

const clean = value => String(value || '').trim()

const findSeasonNarrative = ({ narrative, seasonKey }) => (
  narrative.seasons.find(item => clean(item.seasonKey) === clean(seasonKey)) || null
)

const findSeasonPlan = ({ plan, seasonKey }) => (
  plan.seasons.find(item => clean(item.seasonKey) === clean(seasonKey)) || null
)

const buildLocalPlan = playerDomain => buildNarrativePlan({
  player: playerDomain.identity || {},
  seasons: playerDomain.seasons || [],
  teams: [],
  events: playerDomain.events || [],
  narrative: playerDomain.narrative || null,
})

export const resolveNarrativeView = ({ playerDomain = {}, seasonKey = '' } = {}) => {
  const narrative = normalizePlayerNarrative(playerDomain.narrative)
  const isSeason = Boolean(clean(seasonKey))
  const savedSeason = isSeason
    ? findSeasonNarrative({ narrative, seasonKey })
    : null
  const approved = isSeason ? savedSeason?.approved : narrative.career
  const scope = isSeason ? NARRATIVE_SCOPE.SEASON : NARRATIVE_SCOPE.CAREER

  if (!approved) {
    return {
      scope,
      seasonKey: clean(seasonKey),
      approved: null,
      state: 'missing',
      canUpdate: false,
    }
  }

  const plan = buildLocalPlan(playerDomain)
  const target = isSeason
    ? findSeasonPlan({ plan, seasonKey })
    : plan.career
  const action = target?.action || null
  const canUpdate = action?.reason === 'meaningChanged'

  return {
    scope,
    seasonKey: clean(seasonKey),
    approved,
    state: canUpdate ? 'updateAvailable' : 'current',
    canUpdate,
  }
}
