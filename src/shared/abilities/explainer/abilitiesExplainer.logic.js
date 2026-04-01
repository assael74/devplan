// shared/abilities/explainer/abilitiesExplainer.logic.js

import {
  abilitiesList,
  ABILITIES_EXPLAINER_INTRO,
  ABILITIES_EXPLAINER_DOMAINS_ORDER,
  ABILITIES_EXPLAINER_DOMAIN_DESCRIPTIONS,
  ABILITIES_EXPLAINER_SCORE_SCALE,
  ABILITIES_EXPLAINER_LEVEL_SECTION,
  ABILITIES_EXPLAINER_POTENTIAL_SECTION,
  ABILITIES_EXPLAINER_DEVELOPMENT_SECTION,
  ABILITIES_EXPLAINER_WINDOWS_SECTION,
  ABILITIES_EXPLAINER_RELIABILITY_SECTION,
  ABILITIES_EXPLAINER_EXAMPLE_SECTION,
  ABILITIES_EXPLAINER_SUMMARY,
  ABILITY_DOMAIN_WEIGHTS,
  POTENTIAL_DOMAIN_WEIGHTS,
  PHYSICAL_GROWTH_ADJUSTMENTS,
  FINAL_POTENTIAL_GROWTH_ADJUSTMENTS,
} from './abilitiesExplainer.data.js'

function toPercent(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return ''
  return `${Math.round(num * 100)}%`
}

function sortByDomainsOrder(items = []) {
  const orderMap = new Map(
    ABILITIES_EXPLAINER_DOMAINS_ORDER.map((id, index) => [id, index])
  )

  return [...items].sort((a, b) => {
    const aIndex = orderMap.get(a?.id) ?? 999
    const bIndex = orderMap.get(b?.id) ?? 999
    return aIndex - bIndex
  })
}

export function getExplainerAbilitiesDomains() {
  const domainsMap = new Map()

  for (const item of abilitiesList) {
    const domainId = item?.domain
    if (!domainId || domainId === 'development') continue

    if (!domainsMap.has(domainId)) {
      domainsMap.set(domainId, {
        id: domainId,
        iconId: domainId,
        title: item?.domainLabel || '',
        description: ABILITIES_EXPLAINER_DOMAIN_DESCRIPTIONS?.[domainId] || '',
        abilityWeight: toPercent(ABILITY_DOMAIN_WEIGHTS?.[domainId]),
        potentialWeight: toPercent(POTENTIAL_DOMAIN_WEIGHTS?.[domainId]),
        abilities: [],
      })
    }

    domainsMap.get(domainId).abilities.push({
      id: item.id,
      iconId: item.id,
      label: item.label,
    })
  }

  return sortByDomainsOrder(Array.from(domainsMap.values()))
}

export function getExplainerDomainById(domainId) {
  return getExplainerAbilitiesDomains().find((item) => item.id === domainId) || null
}

export function getExplainerAbilityWeightsForLevel() {
  return getExplainerAbilitiesDomains().map((item) => ({
    id: item.id,
    title: item.title,
    iconId: item.iconId,
    weight: item.abilityWeight,
  }))
}

export function getExplainerAbilityWeightsForPotential() {
  return getExplainerAbilitiesDomains().map((item) => ({
    id: item.id,
    title: item.title,
    iconId: item.iconId,
    weight: item.potentialWeight,
  }))
}

export function getExplainerDevelopmentAdjustments() {
  return Object.keys(FINAL_POTENTIAL_GROWTH_ADJUSTMENTS)
    .map((key) => ({
      id: String(key),
      stage: Number(key),
      physicalAdjustment: PHYSICAL_GROWTH_ADJUSTMENTS?.[key] ?? 0,
      finalPotentialAdjustment: FINAL_POTENTIAL_GROWTH_ADJUSTMENTS?.[key] ?? 0,
    }))
    .sort((a, b) => a.stage - b.stage)
}

export function buildAbilitiesExplainerSections() {
  const domains = getExplainerAbilitiesDomains()
  const levelWeights = getExplainerAbilityWeightsForLevel()
  const potentialWeights = getExplainerAbilityWeightsForPotential()
  const developmentAdjustments = getExplainerDevelopmentAdjustments()

  return [
    ABILITIES_EXPLAINER_INTRO,
    {
      id: 'domains',
      title: 'תחומי הדירוג',
      iconId: 'category',
      domains,
    },
    ABILITIES_EXPLAINER_DEVELOPMENT_SECTION,
    {
      ...ABILITIES_EXPLAINER_LEVEL_SECTION,
      domainWeights: levelWeights,
    },
    {
      ...ABILITIES_EXPLAINER_POTENTIAL_SECTION,
      domainWeights: potentialWeights,
      developmentAdjustments,
    },
    ABILITIES_EXPLAINER_SCORE_SCALE,
    ABILITIES_EXPLAINER_WINDOWS_SECTION,
    ABILITIES_EXPLAINER_RELIABILITY_SECTION,
    ABILITIES_EXPLAINER_EXAMPLE_SECTION,
    ABILITIES_EXPLAINER_SUMMARY,
  ]
}
