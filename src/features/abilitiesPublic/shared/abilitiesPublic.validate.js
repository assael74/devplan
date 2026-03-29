// features/abilitiesPublic/shared/abilitiesPublic.validate.js

import { clean } from './abilitiesPublic.helpers.js'

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

  if (!clean(draft?.roleId)) {
    errors.roleId = 'יש לבחור תפקיד'
  }

  const growthStage = draft?.abilities?.growthStage
  if (growthStage == null || growthStage === '') {
    errors.growthStage = 'יש לבחור שלב התפתחות'
  } else {
    const num = Number(growthStage)
    if (!Number.isFinite(num) || num < 1 || num > 5) {
      errors.growthStage = 'שלב התפתחות לא תקין'
    }
  }

  const activeDomains = Array.isArray(domains)
    ? domains.filter((domain) => domain?.active)
    : []

  const incompleteActiveDomains = activeDomains.filter((domain) => domain?.state !== 'full')

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
