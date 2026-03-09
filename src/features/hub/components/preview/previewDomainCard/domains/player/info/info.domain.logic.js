// src/features/players/components/preview/domains/player/info.domain.logic.js
import { DOMAIN_STATE } from '../preview.state'

const isPlaceholderPhone = (v) => {
  const s = String(v || '').trim()
  if (!s) return true
  return s === '000-000000' || s === '0000000000' || s === '000000000'
}

export const resolveInfoDomain = (player) => {
  const p = player || {}

  const hasBirth = !!String(p.birth || '').trim() || !!String(p.birthDay || '').trim()
  const hasBirthDay = !!String(p.birthDay || '').trim()
  const hasPhone = !isPlaceholderPhone(p.phone)
  const hasActive = typeof p.active === 'boolean'
  const hasAnyMetric = (Array.isArray(p.height) && p.height.length) ||
    (Array.isArray(p.weight) && p.weight.length) ||
    (Array.isArray(p.bodyFat) && p.bodyFat.length)

  // count: כמה “בלוקים” קיימים (Snapshot)
  const count =
    (hasBirth ? 1 : 0) +
    (hasPhone ? 1 : 0) +
    (hasActive ? 1 : 0) +
    (hasAnyMetric ? 1 : 0)

  // state: החלטת מוצר
  let state = DOMAIN_STATE.EMPTY
  if (count === 0) state = DOMAIN_STATE.EMPTY
  else if (hasBirth && hasPhone && hasActive && hasBirthDay) state = DOMAIN_STATE.OK
  else state = DOMAIN_STATE.PARTIAL

  return { count, state }
}
