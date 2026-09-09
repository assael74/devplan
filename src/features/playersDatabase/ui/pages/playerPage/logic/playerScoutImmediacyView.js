// Immediacy factor presentation for the player scout view model.

import { IMMEDIACY_EVALUATION_RESULT_LABELS, IMMEDIACY_REASON_LABELS, IMMEDIACY_REDUCTION_LABELS } from './playerScoutView.constants.js'
import { clean, toNumber } from './playerScoutView.utils.js'

export const buildImmediacyFactors = opportunity => {
  const evaluations = Array.isArray(opportunity?.evaluations) ? opportunity.evaluations : []

  if (evaluations.length) {
    return evaluations.map((item, index) => {
      const id = clean(item?.id) || `evaluation_${index}`
      const result = clean(item?.result) || 'not_applicable'
      const rawPoints = toNumber(item?.points) || 0

      return {
        id,
        type: result,
        result,
        points: result === 'not_applicable' ? null : rawPoints,
        label: IMMEDIACY_REASON_LABELS[id] || IMMEDIACY_REDUCTION_LABELS[id] || id,
        resultLabel: IMMEDIACY_EVALUATION_RESULT_LABELS[result] || result,
        reason: clean(item?.reason),
        profileId: clean(item?.profileId),
        details: item?.details && typeof item.details === 'object' ? item.details : {},
      }
    })
  }

  const boosts = Array.isArray(opportunity?.boosts) ? opportunity.boosts : []
  const reductions = Array.isArray(opportunity?.reductions) ? opportunity.reductions : []
  const boostIds = new Set(boosts.map(item => clean(item?.id)).filter(Boolean))
  const factors = boosts.map((item, index) => {
    const id = clean(item?.id) || `boost_${index}`
    const points = Math.abs(toNumber(item?.points) || 0)

    return {
      id,
      type: 'boost',
      result: 'boost',
      points,
      label: IMMEDIACY_REASON_LABELS[id] || id,
      resultLabel: IMMEDIACY_EVALUATION_RESULT_LABELS.boost,
    }
  })

  reductions.forEach((item, index) => {
    const id = clean(item?.id) || `reduction_${index}`
    const points = -Math.abs(toNumber(item?.points) || 0)

    factors.push({
      id,
      type: 'reduction',
      result: 'reduction',
      points,
      label: IMMEDIACY_REDUCTION_LABELS[id] || IMMEDIACY_REASON_LABELS[id] || id,
      resultLabel: IMMEDIACY_EVALUATION_RESULT_LABELS.reduction,
    })
  })

  const reasons = Array.isArray(opportunity?.reasons) ? opportunity.reasons : []
  reasons.forEach(reason => {
    const id = clean(reason)
    if (!id || boostIds.has(id)) return

    factors.push({
      id,
      type: 'context',
      result: 'context',
      points: null,
      label: IMMEDIACY_REASON_LABELS[id] || id,
      resultLabel: 'מידע',
    })
  })

  return factors
}

