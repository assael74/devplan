import { safeArr, safeId, normalizeIds } from '../../utils/data.utils.js'
import { pushToMapArray } from '../../utils/map.utils.js'

export const buildPaymentIdsByPlayerId = (paymentsBase = []) => {
  const map = new Map()

  for (const payment of safeArr(paymentsBase)) {
    const paymentId = safeId(payment?.id)
    if (!paymentId) continue

    const playerIds = [
      ...normalizeIds(payment?.playerId),
      ...normalizeIds(payment?.playersId),
    ]

    for (const playerId of playerIds) pushToMapArray(map, playerId, paymentId)
  }

  for (const [playerId, ids] of map.entries()) {
    map.set(playerId, Array.from(new Set(ids)))
  }

  return map
}
