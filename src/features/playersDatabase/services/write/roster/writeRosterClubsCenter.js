// src/features/playersDatabase/services/write/roster/writeRosterClubsCenter.js

import { writeClubsCenter } from '../league/writeClubsCenter.js'

export const writeRosterClubsCenter = async ({ approvedState = {} } = {}) => {
  const projections = [
    approvedState.clubsCenterProjection,
    ...(Array.isArray(approvedState.counterpartClubsCenterProjections)
      ? approvedState.counterpartClubsCenterProjections
      : []),
  ].filter(Boolean)
  const results = []

  for (const clubsCenterProjection of projections) {
    results.push(await writeClubsCenter({
      approvedState: { clubsCenterProjection },
    }))
  }

  return {
    written: results.some(result => result && result.written),
    projectionsCount: results.length,
    results,
  }
}

export default writeRosterClubsCenter
