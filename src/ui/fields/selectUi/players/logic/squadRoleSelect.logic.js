// ui/fields/selectUi/players/logic/squadRoleSelect.logic.js

import { SQUAD_ROLE_OPTIONS } from '../../../../../shared/players/players.constants.js'

const clean = (v) => String(v ?? '').trim()

export function buildSquadRoleOptions(options = SQUAD_ROLE_OPTIONS) {
  return (Array.isArray(options) ? options : [])
    .map((item) => ({
      value: clean(item?.value),
      label: clean(item?.label),
      idIcon: clean(item?.idIcon),
      color: clean(item?.color),
      raw: item,
    }))
    .filter((item) => item.value && item.label)
}

export function findSquadRoleOption(value, options = SQUAD_ROLE_OPTIONS) {
  const normalizedValue = clean(value)
  if (!normalizedValue) return null

  const normalizedOptions = buildSquadRoleOptions(options)
  return normalizedOptions.find((item) => item.value === normalizedValue) || null
}
