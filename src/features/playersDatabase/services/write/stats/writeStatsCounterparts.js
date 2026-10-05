// src/features/playersDatabase/services/write/stats/writeStatsCounterparts.js

import {
  writeRosterCounterparts,
  writeRosterParticipation,
} from '../roster/index.js'

export const writeStatsCounterparts = async ({ approvedState = {} } = {}) => {
  const local = await writeRosterParticipation({ patch: approvedState.rosterParticipationPatch || null })
  const counterparts = await writeRosterCounterparts({
    approvedState: {
      counterparts: Array.isArray(approvedState.counterpartPatches)
        ? approvedState.counterpartPatches
        : [],
    },
  })
  return {
    local,
    counterparts,
  }
}

export default writeStatsCounterparts
