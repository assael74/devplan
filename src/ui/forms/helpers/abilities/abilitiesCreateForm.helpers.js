// C:\projects\devplan\src\ui\forms\helpers\abilities\abilitiesCreateForm.helpers.js
import { toNum } from '../../../../shared/abilities/abilities.utils.js'
import { groupAbilitiesByDomain } from '../../../../shared/abilities/abilities.grouping.js'

export const ABILITY_SCORE_OPTS = [1, 2, 3, 4, 5]

export const growthStageOptions = [
  { value: 1, label: 'מאוד מוקדם' },
  { value: 2, label: 'מוקדם' },
  { value: 3, label: 'בזמן' },
  { value: 4, label: 'מאוחר' },
  { value: 5, label: 'מאוד מאוחר' },
]

export const abilitiesLabelsShort = {
  1: 'צריך שיפור',
  2: 'מתחת',
  3: 'ממוצע',
  4: 'טוב',
  5: 'מצוין',
}

export const clean = (v) => String(v ?? '').trim()

export function patchAbilityValue(draft, id, value) {
  const next = { ...(draft?.abilities || {}) }
  if (value == null || value === '') delete next[id]
  else next[id] = toNum(value, null)
  return { abilities: next }
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
  for (const d of domains) {
    for (const it of d.items || []) {
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

export function buildDomainsFromDraftAbilities(abilitiesValues) {
  const domains = groupAbilitiesByDomain(abilitiesValues || {})
  return domains.map((d) => {
    const items = d.items || []
    const filled = items.filter((x) => x.value != null).length
    const total = items.length
    const avg = calcDomainScore(items)
    return { ...d, items, filled, total, avg }
  })
}

export function patchDomainScoreToItems(draft, domain, score, domainItems) {
  const nextAbilities = { ...(draft?.abilities || {}) }

  for (const it of domainItems || []) {
    const w = toNum(it?.weight, 1)
    if (!Number.isFinite(w) || w <= 0) continue
    nextAbilities[it.id] = score
  }

  const nextDomainScores = { ...(draft?.domainScores || {}) }
  if (score == null) delete nextDomainScores[domain]
  else nextDomainScores[domain] = score

  return { abilities: nextAbilities, domainScores: nextDomainScores }
}

export function patchRecalcDomainFromItems(draft, domain, domainItems) {
  const items = (domainItems || []).map((it) => {
    const raw = (draft?.abilities || {})[it.id]
    const value = raw == null || raw === '' ? null : toNum(raw, null)
    return { ...it, value }
  })
  const domainScore = calcDomainScore(items)

  const nextDomainScores = { ...(draft?.domainScores || {}) }
  if (domainScore == null) delete nextDomainScores[domain]
  else nextDomainScores[domain] = domainScore

  return { domainScores: nextDomainScores }
}
