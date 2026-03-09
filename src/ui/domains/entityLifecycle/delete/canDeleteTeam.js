// src/ui/entityLifecycle/delete/canDeleteTeam.js
import { debugLog } from '../../../../services/firestore/shorts/shortsDebug.utils.js'
import { SHORTS_DEBUG } from '../../../../services/firestore/shorts/shortsDebug.config.js'

const pickShortDoc = (shortsBundle, shortKey) => {
  const ps = shortsBundle?.playersShorts
  if (ps && typeof ps === 'object') {
    // אם זה map לפי shortKey
    if (ps[shortKey]) return ps[shortKey]
    // אם זה array של docs
    if (Array.isArray(ps)) return ps.find((d) => d?.shortKey === shortKey || d?.key === shortKey) || null
  }
  return null
}

export async function canDeleteTeam({ teamId, entityName, shorts }) {
  const doc = pickShortDoc(shorts, 'players.playersTeam')
  const list = Array.isArray(doc?.list) ? doc.list : []

  console.log('[canDeleteTeam] input', {
    teamId,
    entityName,
    shorts,
  })

  const usedCount = list.filter((x) => x?.teamId === teamId).length

  const policy =
    usedCount > 0
      ? { canDelete: false, reason: 'TEAM_HAS_PLAYERS', usedCount }
      : { canDelete: true, reason: null, usedCount: 0 }

  if (SHORTS_DEBUG.enabled) {
    debugLog('CAN_DELETE:team', { teamId, entityName, usedCount, policy })
  }

  return policy
}
