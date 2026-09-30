// src/features/playersDatabase/services/auditV2/system/scouting/index.js

import { readStatsCanonicalV2 } from '../../stats/readCanonical.js'
import { evaluateScoutingIntegrityV2 } from './evaluate.js'

export async function auditScoutingIntegrityV2({
  birthTeamDocumentId = '',
  seasonKey = '',
} = {}) {
  const canonical = await readStatsCanonicalV2({
    birthTeamDocumentId,
    seasonKey,
  })

  return evaluateScoutingIntegrityV2({ canonical })
}

export { evaluateScoutingIntegrityV2 } from './evaluate.js'
export {
  SCOUTING_INTEGRITY_V2_FINDING,
  SCOUTING_INTEGRITY_V2_RESULT,
} from './contract.js'
