// src/shared/players/player.squadRole.utils.js

import { SQUAD_ROLE_OPTIONS } from './players.constants.js'

export function getSquadRoleMeta(obj, c) {
  const value = String(obj?.squadRole || '').trim()

  const option = SQUAD_ROLE_OPTIONS.find((item) => item.value === value)

  if (!option) {
    return {
      value: '',
      label: 'לא הוגדר מעמד',
      color: '#9E9E9E',
      iconId: '',
      isKey: false,
      icon: null,
    }
  }

  const isKey = value === 'key'
  const color = option.color || (isKey ? c?.accent : '#9E9E9E')

  return {
    value,
    label: option.label,
    color,
    iconId: option.idIcon || '',
    isKey,
  }
}
