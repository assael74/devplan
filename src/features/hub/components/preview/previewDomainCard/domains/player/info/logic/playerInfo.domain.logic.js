// preview/previewDomainCard/domains/player/info/logic/playerInfo.domain.logic.js

import { DOMAIN_STATE } from '../../../../../preview.state'
import { formatPhoneNumber } from '../../../../../../../../../shared/format/contactUtiles.js'

export const isPlaceholderPhone = (v) => {
  const s = String(v || '').trim()
  if (!s) return true
  return s === '000-000000' || s === '0000000000' || s === '000000000'
}

export const toStr = (v) => (v == null ? '' : String(v))

export const buildPlayerName = (player) => {
  const first = toStr(player?.playerFirstName).trim()
  const last = toStr(player?.playerLastName).trim()
  const short = toStr(player?.playerShortName).trim()
  return `${first} ${last}`.trim() || short || 'שחקן'
}

export const buildInitialForm = (player) => ({
  playerFirstName: toStr(player?.playerFirstName),
  playerLastName: toStr(player?.playerLastName),
  playerShortName: toStr(player?.playerShortName),
  birth: toStr(player?.birth),
  birthDay: toStr(player?.birthDay),
  phone: toStr(player?.phone),
  active: !!player?.active,
  squadRole: toStr(player?.squadRole),
  projectStatus: player?.projectStatus ?? null,
})

export const buildComparableForm = (form) => ({
  playerFirstName: String(form?.playerFirstName || '').trim() || null,
  playerLastName: String(form?.playerLastName || '').trim() || null,
  playerShortName: String(form?.playerShortName || '').trim() || null,
  birth: String(form?.birth || '').trim() || null,
  birthDay: String(form?.birthDay || '').trim() || null,
  phone: String(form?.phone || '').trim() || null,
  active: !!form?.active,
  squadRole: String(form?.squadRole || '').trim() || null,
  projectStatus: form?.projectStatus ?? null,
})

export const pickPatch = (next, initial) => {
  const patch = {}
  for (const key of Object.keys(next || {})) {
    if (next[key] !== initial[key]) patch[key] = next[key]
  }
  return patch
}

export const formatPlayerPhone = (phone) => {
  if (isPlaceholderPhone(phone)) return '—'
  return formatPhoneNumber(phone) || String(phone || '').trim() || '—'
}

export const resolveInfoDomain = (player) => {
  const p = player || {}

  const hasBirth = !!String(p.birth || '').trim() || !!String(p.birthDay || '').trim()
  const hasBirthDay = !!String(p.birthDay || '').trim()
  const hasPhone = !isPlaceholderPhone(p.phone)
  const hasActive = typeof p.active === 'boolean'

  const count =
    (hasBirth ? 1 : 0) +
    (hasPhone ? 1 : 0) +
    (hasActive ? 1 : 0)

  let state = DOMAIN_STATE.EMPTY
  if (count === 0) state = DOMAIN_STATE.EMPTY
  else if (hasBirth && hasPhone && hasActive && hasBirthDay) state = DOMAIN_STATE.OK
  else state = DOMAIN_STATE.PARTIAL

  return { count, state }
}
