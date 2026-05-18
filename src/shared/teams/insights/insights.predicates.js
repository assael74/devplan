// src/shared/teams/insights/insights.predicates.js

const riskRank = {
  none: 0,
  info: 1,
  warning: 2,
  danger: 3,
}

const toNum = value => {
  const n = Number(value)

  return Number.isFinite(n) ? n : 0
}

const riskAtLeast = (level, min) => {
  return riskRank[level] >= riskRank[min]
}

export const isPositionAspect = context => {
  return context?.aspectId === 'position'
}

export const isNotPositionAspect = context => {
  return context?.aspectId !== 'position'
}

export const isRoleAspect = context => {
  return context?.aspectId === 'role'
}

export const isKeyRole = context => {
  return context?.roleId === 'key'
}

export const hasNoSample = context => {
  return !toNum(context?.sample?.checked)
}

export const hasLowSample = context => {
  return context?.sampleLevel === 'low'
}

export const hasPartialSample = context => {
  return context?.sampleLevel === 'partial'
}

export const hasReliableSample = context => {
  return context?.sampleLevel === 'reliable'
}

export const hasStrongSample = context => {
  return context?.sampleLevel === 'strong'
}

export const isStrongQuality = context => {
  return context?.qualityLevel === 'strong'
}

export const isOkQuality = context => {
  return context?.qualityLevel === 'ok'
}

export const isLimitedQuality = context => {
  return context?.qualityLevel === 'limited'
}

export const isWeakQuality = context => {
  return context?.qualityLevel === 'weak'
}

export const isBadQuality = context => {
  return context?.qualityLevel === 'bad'
}

export const hasProfessionalRisk = context => {
  return context?.riskLevel !== 'none'
}

export const hasNoProfessionalRisk = context => {
  return context?.riskLevel === 'none'
}

export const hasInfoRisk = context => {
  return context?.riskLevel === 'info'
}

export const hasWarningRisk = context => {
  return riskAtLeast(context?.riskLevel, 'warning')
}

export const hasDangerRisk = context => {
  return riskAtLeast(context?.riskLevel, 'danger')
}

export const hasWeakPlayers = context => {
  return toNum(context?.health?.weakCount) > 0
}

export const hasHighDamage = context => {
  return toNum(context?.health?.damageScore) >= 1.5
}

export const hasNegativeImpact = context => {
  return toNum(context?.metrics?.totalTva) < 0
}

export const hasPositiveImpact = context => {
  return toNum(context?.metrics?.totalTva) > 0
}

export const hasStrongScore = context => {
  const score = Number(context?.score)

  return Number.isFinite(score) && score >= 6.1
}

export const hasPositionOverload = context => {
  return context?.structureStatus === 'overload'
}

export const isStrongGroupWithRisk = context => {
  return (
    isNotPositionAspect(context) &&
    isStrongQuality(context) &&
    hasProfessionalRisk(context)
  )
}

export const isOkGroupWithRisk = context => {
  return (
    isNotPositionAspect(context) &&
    isOkQuality(context) &&
    hasProfessionalRisk(context)
  )
}

export const isLimitedGroupWithRisk = context => {
  return (
    isNotPositionAspect(context) &&
    isLimitedQuality(context) &&
    hasProfessionalRisk(context)
  )
}

export const isStrongGroup = context => {
  return (
    isNotPositionAspect(context) &&
    isStrongQuality(context) &&
    hasNoProfessionalRisk(context)
  )
}

export const isStableGroup = context => {
  return (
    isNotPositionAspect(context) &&
    isOkQuality(context) &&
    hasNoProfessionalRisk(context)
  )
}

export const isLimitedGroup = context => {
  return (
    isNotPositionAspect(context) &&
    isLimitedQuality(context) &&
    hasNoProfessionalRisk(context)
  )
}

export const isPositionCollapse = context => {
  return (
    isPositionAspect(context) &&
    isBadQuality(context)
  )
}

export const isPositionWeak = context => {
  return (
    isPositionAspect(context) &&
    isWeakQuality(context)
  )
}

export const isPositionWithRisk = context => {
  return (
    isPositionAspect(context) &&
    hasProfessionalRisk(context)
  )
}

export const isStrongPosition = context => {
  return (
    isPositionAspect(context) &&
    isStrongQuality(context) &&
    hasNoProfessionalRisk(context)
  )
}

export const isStablePosition = context => {
  return (
    isPositionAspect(context) &&
    (
      isOkQuality(context) ||
      isLimitedQuality(context)
    ) &&
    hasNoProfessionalRisk(context)
  )
}
