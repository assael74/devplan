// src/features/playersDatabase/services/writeV2/roster/clear/prepareClearRoster.js

import { buildClearRosterPlan } from '../../../../domain/rosterV2/clear/clearRosterPlan.builder.js'
import { freezeClearRosterProposal } from '../../../../domain/rosterV2/clear/clearRosterApprovedState.builder.js'
import { readClearRosterSources } from './readClearRoster.js'

export const prepareClearRoster = async target => {
  return freezeClearRosterProposal(buildClearRosterPlan(await readClearRosterSources(target)))
}
