import { updateShortItemsById } from '../../../../services/firestore/shorts/shortsUpdate.js'
import { debugLog } from '../../../../services/firestore/shorts/shortsDebug.utils.js'
import { SHORTS_DEBUG } from '../../../../services/firestore/shorts/shortsDebug.config.js'

const ACTIVE_KEYS = {
  player: ['players.playersInfo'],
  team: ['teams.teamsInfo'],
  club: ['clubs.clubsInfo'],
  staff: ['roles.rolesInfo'],
}

const run = async ({ entityType, id, active }) => {
  const shortKeys = ACTIVE_KEYS[entityType] || []
  if (!shortKeys.length) throw new Error(`No archive keys for entityType "${entityType}"`)

  if (SHORTS_DEBUG.enabled) debugLog(`UI_ARCHIVE:${entityType}:start`, { id, active, shortKeys })

  return updateShortItemsById({
    shortKeys,
    id,
    patch: { active },
    requireAnyFound: true,
    requireAllFound: false,
  })
}

export const archiveActions = {
  archive: async ({ entityType, id }) => run({ entityType, id, active: false }),
  restore: async ({ entityType, id }) => run({ entityType, id, active: true }),
}
