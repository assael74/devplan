// features/abilitiesPublic/shared/abilitiesPublic.derived.js

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
    playerPhoto: clean(draft?.playerPhoto),
    teamId: clean(draft?.teamId),
    teamName: clean(draft?.teamName),
    teamPhoto: clean(draft?.teamPhoto),
    clubId: clean(draft?.clubId),
    clubName: clean(draft?.clubName),
    clubPhoto: clean(draft?.clubPhoto),

    evaluatorId: clean(draft?.evaluatorId),
    evaluatorName: clean(draft?.evaluatorName),
    evaluatorType: clean(draft?.evaluatorType),
    evaluatorPhoto: clean(draft?.evaluatorPhoto),

    evalDate: clean(draft?.evalDate),

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

export function calcPublicReady({ validation }) {
  return Boolean(validation?.isValid)
}

export function calcPublicDomains(abilitiesValues = {}) {
  const all = buildDomainsFromDraftAbilities(abilitiesValues)

  return all
    .filter((domain) => domain?.id !== 'growth' && domain?.domain !== 'development')
    .map((domain) => {
      const filled = Number(domain?.filled || 0)
      const total = Number(domain?.total || 0)
      const avg = domain?.avg
      const percent = total > 0 ? Math.round((filled / total) * 100) : 0

      let state = 'empty'
      if (filled > 0 && filled < total) state = 'partial'
      if (total > 0 && filled === total) state = 'full'

      return {
        ...domain,
        filled,
        total,
        avg,
        percent,
        state,
      }
    })
}

export function buildPublicMissingItems({ bits = {}, domains = [], validation = {} }) {
  const missing = []

  if (!bits?.hasGrowthStage) {
    missing.push({
      id: 'growthStage',
      label: 'בחירת שלב התפתחות',
      kind: 'required',
    })
  }

  for (const domain of domains || []) {
    if (!domain?.active) continue
    if (domain?.state === 'full') continue

    missing.push({
      id: `domain-${domain?.id || domain?.domain}`,
      label: `דומיין ${domain?.domainLabel || domain?.id || domain?.domain} עדיין לא הושלם`,
      kind: 'domain-incomplete',
    })
  }

  return missing
}

export function buildPublicCompletionModel({ bits = {}, domains = [], validation = {} }) {
  const activeDomains = Array.isArray(domains)
    ? domains.filter((domain) => domain?.active)
    : []

  const totalDomains = activeDomains.length
  const startedDomains = activeDomains.filter((domain) => Number(domain?.filled || 0) > 0).length
  const fullDomains = activeDomains.filter((domain) => domain?.state === 'full').length
  const remainingDomains = Math.max(totalDomains - fullDomains, 0)

  const missing = buildPublicMissingItems({ bits, domains, validation })

  let summaryText = 'הטופס מוכן לשליחה'

  if (!validation?.isValid) {
    if (!bits?.hasGrowthStage) {
      summaryText = 'יש לבחור שלב התפתחות'
    } else if (remainingDomains > 0) {
      summaryText =
        remainingDomains === 1
          ? 'נשאר דומיין פעיל אחד להשלמה'
          : `נשארו ${remainingDomains} דומיינים פעילים להשלמה`
    } else {
      summaryText = 'יש להשלים את הטופס לפני שליחה'
    }
  }

  return {
    totalDomains,
    startedDomains,
    fullDomains,
    remainingDomains,
    ready: Boolean(validation?.isValid),
    missing,
    missingRequired: missing.filter((item) => item?.kind === 'required'),
    missingDomains: missing.filter((item) => item?.kind === 'domain-incomplete'),
    summaryText,
  }
}
