// teamProfile/sharedLogic/players/moduleLogic/row/row.role.js

import {
  SQUAD_ROLE_OPTIONS,
} from '../../../../../../../shared/players/players.constants.js'

import {
  norm,
} from './row.helpers.js'

export const getSquadRole = (player, row) => {
  return norm(row?.squadRole || player?.squadRole)
}

export const isKeyBySquadRole = (squadRole) => {
  return squadRole === 'key'
}

export const getSquadRoleLabel = (squadRole) => {
  const option = SQUAD_ROLE_OPTIONS.find((item) => {
    return item.value === squadRole
  })

  return option?.label || 'לא הוגדר מעמד'
}
