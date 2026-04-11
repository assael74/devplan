// features/abilitiesPublic/shared/abilitiesPublic.validate.js

import { clean } from './abilitiesPublic.helpers.js'
import { shouldUseGrowthStage } from '../../../shared/abilities/abilitiesAgeRule.js'

function shouldRequireGrowthStage(draft = {}) {
  const allowGrowthStageEdit = draft?.publicMeta?.allowGrowthStageEdit !== false
  const useGrowthStage = shouldUseGrowthStage(draft)

  if (!useGrowthStage) return false

  const value = draft?.abilities?.growthStage
  const hasValue = !(value == null || value === '')
  return allowGrowthStageEdit || !hasValue
}

export function validatePublicAbilitiesDraft({
  draft = {},
  domains = [],
} = {}) {
  const errors = {}

  if (!clean(draft?.inviteId)) {
    errors.inviteId = 'חסר inviteId'
  }

  if (!clean(draft?.token)) {
    errors.token = 'חסר token'
  }

  if (!clean(draft?.playerId)) {
    errors.playerId = 'חסר שחקן'
  }

  const growthStage = draft?.abilities?.growthStage
  if (shouldRequireGrowthStage(draft)) {
    if (growthStage == null || growthStage === '') {
      errors.growthStage = 'יש לבחור שלב התפתחות'
    } else {
      const num = Number(growthStage)
      if (!Number.isFinite(num) || num < 1 || num > 5) {
        errors.growthStage = 'שלב התפתחות לא תקין'
      }
    }
  }

  const activeDomains = Array.isArray(domains)
    ? domains.filter((domain) => domain?.active && Number(domain?.total || 0) > 0)
    : []

  const incompleteActiveDomains = activeDomains.filter((domain) => {
    const filled = Number(domain?.filled || 0)
    const total = Number(domain?.total || 0)
    if (!total) return false
    return filled < total
  })

  if (incompleteActiveDomains.length) {
    errors.activeDomains = 'יש להשלים את כל הדומיינים הפעילים'
  }

  const abilities = draft?.abilities || {}
  const abilityEntries = Object.entries(abilities).filter(([key]) => key !== 'growthStage')

  for (const [key, value] of abilityEntries) {
    if (value == null || value === '') continue

    const num = Number(value)
    if (!Number.isFinite(num) || num < 1 || num > 5) {
      errors[key] = 'ציון לא תקין'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
