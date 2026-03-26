import { clean } from './abilitiesPublic.helpers.js'

export function validatePublicAbilitiesDraft(draft = {}) {
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
  }

  const abilities = draft?.abilities || {}
  const abilityEntries = Object.entries(abilities).filter(([key]) => key !== 'growthStage')

  const filledAbilities = abilityEntries.filter(([, value]) => value != null && value !== '')
  if (!filledAbilities.length) {
    errors.abilities = 'יש למלא לפחות יכולת אחת'
  }

  for (const [key, value] of filledAbilities) {
    const num = Number(value)
    if (!Number.isFinite(num) || num < 1 || num > 5) {
      errors[key] = 'ציון לא תקין'
    }
  }

  if (growthStage != null && growthStage !== '') {
    const num = Number(growthStage)
    if (!Number.isFinite(num) || num < 1 || num > 5) {
      errors.growthStage = 'שלב התפתחות לא תקין'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
