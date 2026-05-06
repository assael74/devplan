// shared/games/insights/player/common/playerRole.js

import { SQUAD_ROLE_OPTIONS } from '../../../../players/players.constants.js'

const ROLE_FALLBACK = {
  value: '',
  label: 'לא הוגדר מעמד',
  idIcon: '',
  color: '#9E9E9E',
  weight: 0,
}

export function normalizePlayerRoleId(value) {
  return String(value || '').trim()
}

export function getPlayerRoleMeta(roleId) {
  const id = normalizePlayerRoleId(roleId)

  return (
    SQUAD_ROLE_OPTIONS.find((item) => item.value === id) ||
    ROLE_FALLBACK
  )
}

export function resolvePlayerRole(player = {}) {
  const roleId = normalizePlayerRoleId(player?.squadRole)
  const meta = getPlayerRoleMeta(roleId)

  return {
    id: meta.value || '',
    value: meta.value || '',
    label: meta.label || ROLE_FALLBACK.label,
    idIcon: meta.idIcon || '',
    color: meta.color || ROLE_FALLBACK.color,
    weight: meta.weight || 0,
    isDefined: Boolean(meta.value),
    isKey: meta.value === 'key',
    isCore: meta.value === 'core',
    isRotation: meta.value === 'rotation',
    isFringe: meta.value === 'fringe',
  }
}
