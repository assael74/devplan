import { toNum } from '../../../shared/abilities/abilities.utils.js'
import { groupAbilitiesByDomain } from '../../../shared/abilities/abilities.grouping.js'

export const ABILITY_SCORE_OPTS = [1, 2, 3, 4, 5]

export const PUBLIC_GROWTH_STAGE_OPTIONS = [
  { value: 1, label: 'מאוד מוקדם', idIcon: 'very_early' },
  { value: 2, label: 'מוקדם', idIcon: 'early' },
  { value: 3, label: 'בזמן', idIcon: 'on_time' },
  { value: 4, label: 'מאוחר', idIcon: 'late' },
  { value: 5, label: 'מאוד מאוחר', idIcon: 'very_late' },
]

export const PUBLIC_ABILITY_LABELS_SHORT = {
  1: 'צריך שיפור',
  2: 'מתחת',
  3: 'ממוצע',
  4: 'טוב',
  5: 'מצוין',
}

export function clean(v) {
  return String(v ?? '').trim()
}

export function todayYmd() {
  const d = new Date()
  const to2 = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${to2(d.getMonth() + 1)}-${to2(d.getDate())}`
}

export function patchAbilityValue(draft, id, value) {
  const next = { ...(draft?.abilities || {}) }

  if (value == null || value === '') {
    delete next[id]
  } else {
    next[id] = toNum(value, null)
  }

  return {
    ...draft,
    abilities: next,
  }
}

export function calcDomainScore(domainItems = []) {
  let sumW = 0
  let sum = 0

  for (const it of domainItems) {
    const v = it?.value
    const w = toNum(it?.weight, 1)

    if (v == null) continue
    if (!Number.isFinite(w) || w <= 0) continue

    sumW += w
    sum += v * w
  }

  if (!sumW) return null
  return Math.round((sum / sumW) * 10) / 10
}

export function calcGroupScore(domains = []) {
  let sumW = 0
  let sum = 0

  for (const domain of domains) {
    for (const it of domain?.items || []) {
      const v = it?.value
      const w = toNum(it?.weight, 1)

      if (v == null) continue
      if (!Number.isFinite(w) || w <= 0) continue

      sumW += w
      sum += v * w
    }
  }

  if (!sumW) return null
  return Math.round((sum / sumW) * 10) / 10
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

export function patchDomainScoreToItems(draft, domainId, score, domainItems = []) {
  const nextAbilities = { ...(draft?.abilities || {}) }

  for (const it of domainItems) {
    const weight = toNum(it?.weight, 1)
    if (!Number.isFinite(weight) || weight <= 0) continue
    nextAbilities[it.id] = score
  }

  const nextDomainScores = { ...(draft?.domainScores || {}) }

  if (score == null) delete nextDomainScores[domainId]
  else nextDomainScores[domainId] = score

  return {
    ...draft,
    abilities: nextAbilities,
    domainScores: nextDomainScores,
  }
}

export function patchRecalcDomainFromItems(draft, domainId, domainItems = []) {
  const items = domainItems.map((it) => {
    const raw = (draft?.abilities || {})[it.id]
    const value = raw == null || raw === '' ? null : toNum(raw, null)
    return { ...it, value }
  })

  const domainScore = calcDomainScore(items)
  const nextDomainScores = { ...(draft?.domainScores || {}) }

  if (domainScore == null) delete nextDomainScores[domainId]
  else nextDomainScores[domainId] = domainScore

  return {
    ...draft,
    domainScores: nextDomainScores,
  }
}

export function buildDomainsFromDraftAbilities(abilitiesValues) {
  const domains = groupAbilitiesByDomain(abilitiesValues || {})

  return domains.map((domain) => {
    const items = Array.isArray(domain?.items) ? domain.items : []
    const filled = items.filter((item) => item?.value != null).length
    const total = items.length
    const avg = calcDomainScore(items)

    return {
      ...domain,
      items,
      filled,
      total,
      avg,
    }
  })
}
