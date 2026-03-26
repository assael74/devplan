import {
  clean,
  buildDomainsFromDraftAbilities,
} from './abilitiesPublic.helpers.js'

export function pickPublicDraftBits(draft = {}) {
  const abilitiesValues = draft?.abilities || {}
  const growthStageValue = abilitiesValues?.growthStage ?? null
  const hasGrowthStage = !(growthStageValue == null || growthStageValue === '')

  return {
    inviteId: clean(draft?.inviteId),
    token: clean(draft?.token),

    playerId: clean(draft?.playerId),
    playerName: clean(draft?.playerName),
    teamId: clean(draft?.teamId),
    teamName: clean(draft?.teamName),
    clubId: clean(draft?.clubId),
    clubName: clean(draft?.clubName),

    evaluatorId: clean(draft?.evaluatorId),
    evaluatorName: clean(draft?.evaluatorName),
    evaluatorType: clean(draft?.evaluatorType),

    evalDate: clean(draft?.evalDate),
    roleId: clean(draft?.roleId),

    abilitiesValues,
    growthStageValue,
    hasGrowthStage,
    missingGrowthStage: !hasGrowthStage,
  }
}

export function calcPublicHasAtLeastOneAbility(draft = {}) {
  const abilities = draft?.abilities || {}

  return Object.entries(abilities).some(([key, value]) => {
    if (key === 'growthStage') return false
    if (value == null) return false
    if (typeof value === 'string') return value.trim() !== ''
    return true
  })
}

export function calcPublicReady({ roleId, hasGrowthStage, hasAtLeastOneAbility }) {
  return Boolean(roleId && hasGrowthStage && hasAtLeastOneAbility)
}

export function calcPublicDomains(abilitiesValues = {}) {
  const all = buildDomainsFromDraftAbilities(abilitiesValues)
  return all.filter((domain) => domain?.id !== 'growth' && domain?.domain !== 'development')
}
