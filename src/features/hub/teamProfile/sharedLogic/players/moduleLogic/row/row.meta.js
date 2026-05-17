// teamProfile/sharedLogic/players/moduleLogic/row/row.meta.js

import {
  countList,
} from './row.helpers.js'

export const buildMetaCounts = (player, row, level) => {
  const games = countList(row?.games || player?.games)
  const meetings = countList(row?.meetings || player?.meetings)
  const payments = countList(row?.payments || player?.payments)
  const abilities = countList(row?.abilities || player?.abilities)
  const normalizedLevel = Number(level) || 0

  const hasUsage =
    games + meetings + payments + abilities > 0 ||
    normalizedLevel > 0

  return {
    games,
    meetings,
    payments,
    abilities,
    level: normalizedLevel,
    hasUsage,
  }
}
