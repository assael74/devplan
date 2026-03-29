
import { abilitiesList } from '../abilities.list.js'
import {
  ABILITY_DOMAIN_WEIGHTS,
  POTENTIAL_DOMAIN_WEIGHTS,
  PHYSICAL_GROWTH_ADJUSTMENTS,
  FINAL_POTENTIAL_GROWTH_ADJUSTMENTS,
  ABILITY_SCORE_MIN,
  ABILITY_SCORE_MAX,
  DOMAIN_RELIABILITY,
  OVERALL_RELIABILITY,
} from './abilitiesHistory.constants.js'
import {
  isFilled,
  round1,
  round2,
  roundToHalf,
  clamp,
  safeStr,
  toNum,
} from './abilitiesHistory.utils.js'
import { normalizeAbilities } from './abilitiesHistory.forms.js'
import {
  groupFormsByWindow,
  buildWindowSnapshot,
  mergeWindowAbilitiesHistory,
} from './abilitiesHistory.windows.js'

export function getDomainsMeta() {
  const map = {}

  for (const item of abilitiesList) {
    const domain = item?.domain
    if (!domain) continue

    if (!map[domain]) {
      map[domain] = {
        domain,
        domainLabel: item?.domainLabel || domain,
        items: [],
      }
    }

    map[domain].items.push(item)
  }

  return map
}

export function calcDomainFromAbilities(abilities = {}, domainMeta = {}) {
  const items = Array.isArray(domainMeta?.items) ? domainMeta.items : []
  const countableItems = items.filter((item) => Number(item?.weight ?? 1) > 0)

  let weightedSum = 0
  let filledWeight = 0
  let filledCount = 0
  let totalWeight = 0

  const resolvedItems = items.map((item) => {
    const value = abilities?.[item.id] == null ? null : Number(abilities[item.id])
    const weight = Number(item?.weight ?? 1)

    if (weight > 0) totalWeight += weight
    if (weight > 0 && isFilled(value)) {
      weightedSum += value * weight
      filledWeight += weight
      filledCount += 1
    }

    return {
      id: item.id,
      label: item.label,
      domain: item.domain,
      domainLabel: item.domainLabel,
      weight,
      value: isFilled(value) ? value : value == null ? null : Number(value),
    }
  })

  const score = filledWeight > 0 ? round1(weightedSum / filledWeight) : null
  const coveragePct = totalWeight > 0 ? round1((filledWeight / totalWeight) * 100) : 0

  let validity = 'invalid'
  let reliability = DOMAIN_RELIABILITY.low

  if (filledCount >= 3 && coveragePct > 60) {
    validity = 'reliable'
    reliability = DOMAIN_RELIABILITY.high
  } else if (filledCount >= 2 && coveragePct >= 35) {
    validity = 'partial'
    reliability = DOMAIN_RELIABILITY.medium
  }

  return {
    domain: domainMeta?.domain || null,
    domainLabel: domainMeta?.domainLabel || null,
    score,
    filledCount,
    totalCount: countableItems.length,
    coveragePct,
    validity,
    reliability,
    items: resolvedItems,
    isValidForOverall: validity !== 'invalid',
  }
}

export function calcDomainsResult(abilities = {}) {
  const domainsMeta = getDomainsMeta()
  const domains = Object.values(domainsMeta).map((meta) => calcDomainFromAbilities(abilities, meta))
  const byId = Object.fromEntries(domains.map((domain) => [domain.domain, domain]))

  return {
    domains,
    byId,
  }
}

export function calcWeightedOverallFromDomains(domainsById = {}, domainWeights = {}) {
  let sum = 0
  let sumWeights = 0
  let validDomainsCount = 0
  let totalModelWeight = 0

  for (const [domainId, domainWeight] of Object.entries(domainWeights)) {
    totalModelWeight += domainWeight
    const domain = domainsById?.[domainId]
    if (!domain?.isValidForOverall) continue
    if (!Number.isFinite(Number(domain?.score))) continue

    sum += Number(domain.score) * domainWeight
    sumWeights += domainWeight
    validDomainsCount += 1
  }

  const score = sumWeights > 0 ? roundToHalf(sum / sumWeights) : null
  const coveragePct = totalModelWeight > 0 ? round1((sumWeights / totalModelWeight) * 100) : 0

  return {
    score,
    validDomainsCount,
    coveragePct,
  }
}

function resolveGrowthStageTableKey(growthStage) {
  const n = toNum(growthStage, null)
  if (!Number.isFinite(n)) return null
  return clamp(Math.floor(n), 1, 5)
}

export function calcPotentialScore(domainsById = {}, growthStage = null) {
  const adjustedDomains = { ...domainsById }

  const physical = domainsById?.physical || null
  const basePhysicalScore = Number.isFinite(Number(physical?.score))
    ? Number(physical.score)
    : null

  const growthStageTableKey = resolveGrowthStageTableKey(growthStage)
  const growthAdj = PHYSICAL_GROWTH_ADJUSTMENTS[String(growthStageTableKey)] ?? 0
  const finalGrowthAdj = FINAL_POTENTIAL_GROWTH_ADJUSTMENTS[String(growthStageTableKey)] ?? 0

  const adjustedPhysicalScore =
    basePhysicalScore == null
      ? null
      : clamp(round1(basePhysicalScore + growthAdj), ABILITY_SCORE_MIN, ABILITY_SCORE_MAX)

  adjustedDomains.physical = adjustedDomains.physical
    ? {
        ...adjustedDomains.physical,
        potentialAdjustedScore: adjustedPhysicalScore,
      }
    : null

  let sum = 0
  let sumWeights = 0
  let validDomainsCount = 0
  let totalModelWeight = 0

  for (const [domainId, domainWeight] of Object.entries(POTENTIAL_DOMAIN_WEIGHTS)) {
    totalModelWeight += domainWeight

    const domain = adjustedDomains?.[domainId]
    if (!domain?.isValidForOverall) continue

    const score =
      domainId === 'physical'
        ? domain?.potentialAdjustedScore
        : domain?.score

    if (!Number.isFinite(Number(score))) continue

    sum += Number(score) * domainWeight
    sumWeights += domainWeight
    validDomainsCount += 1
  }

  const basePotential = sumWeights > 0 ? sum / sumWeights : null
  const finalPotential =
    basePotential == null
      ? null
      : clamp(roundToHalf(basePotential + finalGrowthAdj), ABILITY_SCORE_MIN, ABILITY_SCORE_MAX)

  const coveragePct = totalModelWeight > 0 ? round1((sumWeights / totalModelWeight) * 100) : 0
  const physicalCoveragePct = domainsById?.physical?.coveragePct ?? 0
  const hasPhysical = Boolean(domainsById?.physical?.isValidForOverall)

  return {
    score: finalPotential,
    basePotential: basePotential == null ? null : round2(basePotential),
    validDomainsCount,
    coveragePct,
    hasPhysical,
    physicalCoveragePct,
    physicalAdjustedScore: adjustedPhysicalScore,
    growthStageTableKey,
  }
}

export function resolveOverallReliability({
  validDomainsCount = 0,
  coveragePct = 0,
  evaluatorsCount = 0,
}) {
  if (validDomainsCount >= 4 && coveragePct >= 75) {
    if (evaluatorsCount >= 2) return OVERALL_RELIABILITY.high
    return OVERALL_RELIABILITY.medium
  }

  if (validDomainsCount >= 3 && coveragePct >= 65) {
    return OVERALL_RELIABILITY.medium
  }

  return OVERALL_RELIABILITY.low
}

export function resolvePotentialReliability({
  validDomainsCount = 0,
  coveragePct = 0,
  hasPhysical = false,
  physicalCoveragePct = 0,
  evaluatorsCount = 0,
}) {
  if (
    validDomainsCount >= 4 &&
    coveragePct >= 80 &&
    hasPhysical &&
    physicalCoveragePct >= 35
  ) {
    if (evaluatorsCount >= 2) return OVERALL_RELIABILITY.high
    return OVERALL_RELIABILITY.medium
  }

  if (validDomainsCount >= 4 && coveragePct >= 70) {
    return OVERALL_RELIABILITY.medium
  }

  return OVERALL_RELIABILITY.low
}

export function buildFinalPlayerResult({ forms = [] }) {
  const groupedWindows = groupFormsByWindow(forms)
  const windowSnapshots = groupedWindows.map((bucket) => buildWindowSnapshot(bucket))
  const historyMerged = mergeWindowAbilitiesHistory(windowSnapshots)
  const mergedAbilities = normalizeAbilities(historyMerged.abilities || {})

  const domainsResult = calcDomainsResult(mergedAbilities)
  const overallAbility = calcWeightedOverallFromDomains(
    domainsResult.byId,
    ABILITY_DOMAIN_WEIGHTS
  )
  const overallPotential = calcPotentialScore(
    domainsResult.byId,
    mergedAbilities?.growthStage ?? null
  )

  const allEvaluatorIds = Array.from(
    new Set(forms.map((f) => safeStr(f?.evaluatorId || f?.roleId)).filter(Boolean))
  )

  const abilityReliability = resolveOverallReliability({
    validDomainsCount: overallAbility.validDomainsCount,
    coveragePct: overallAbility.coveragePct,
    evaluatorsCount: allEvaluatorIds.length,
  })

  const potentialReliability = resolvePotentialReliability({
    validDomainsCount: overallPotential.validDomainsCount,
    coveragePct: overallPotential.coveragePct,
    hasPhysical: overallPotential.hasPhysical,
    physicalCoveragePct: overallPotential.physicalCoveragePct,
    evaluatorsCount: allEvaluatorIds.length,
  })

  return {
    abilities: mergedAbilities,
    domainScores: Object.fromEntries(
      domainsResult.domains.map((d) => [d.domain, d.score])
    ),
    domainsMeta: domainsResult.domains,
    level: overallAbility.score,
    levelPotential: overallPotential.score,
    reliability: {
      ability: abilityReliability,
      potential: potentialReliability,
    },
    coverage: {
      ability: overallAbility.coveragePct,
      potential: overallPotential.coveragePct,
      physical: overallPotential.physicalCoveragePct,
    },
    validDomainsCount: {
      ability: overallAbility.validDomainsCount,
      potential: overallPotential.validDomainsCount,
    },
    snapshotsMeta: {
      windowsCount: historyMerged.windowsCount,
      lastWindowKey: historyMerged.lastWindowKey,
      formsCount: forms.length,
      evaluatorsCount: allEvaluatorIds.length,
      evaluatorIds: allEvaluatorIds,
      mergeLog: historyMerged.mergeLog,
    },
    windows: windowSnapshots,
  }
}
