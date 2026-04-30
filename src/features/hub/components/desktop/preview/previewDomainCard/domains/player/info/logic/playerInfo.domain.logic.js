// preview/previewDomainCard/domains/player/info/logic/playerInfo.domain.logic.js

import { DOMAIN_STATE } from '../../../../../preview.state'
import { formatPhoneNumber } from '../../../../../../../../../../shared/format/contactUtiles.js'

export const toStr = (value) => {
  return value == null ? '' : String(value)
}

export const isPlaceholderPhone = (value) => {
  const str = toStr(value).trim()

  if (!str) return true

  return (
    str === '000-000000' ||
    str === '0000000000' ||
    str === '000000000'
  )
}

export const formatPlayerPhone = (phone) => {
  if (isPlaceholderPhone(phone)) return '—'

  return formatPhoneNumber(phone) || toStr(phone).trim() || '—'
}

export const resolveInfoDomain = (player) => {
  const p = player || {}

  const hasBirth = Boolean(
    toStr(p.birth).trim() || toStr(p.birthDay).trim()
  )

  const hasBirthDay = Boolean(toStr(p.birthDay).trim())
  const hasPhone = !isPlaceholderPhone(p.phone)
  const hasActive = typeof p.active === 'boolean'

  const count =
    (hasBirth ? 1 : 0) +
    (hasPhone ? 1 : 0) +
    (hasActive ? 1 : 0)

  let state = DOMAIN_STATE.EMPTY

  if (count === 0) {
    state = DOMAIN_STATE.EMPTY
  } else if (hasBirth && hasPhone && hasActive && hasBirthDay) {
    state = DOMAIN_STATE.OK
  } else {
    state = DOMAIN_STATE.PARTIAL
  }

  return { count, state }
}
