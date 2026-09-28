// src/features/playersDatabase/services/writeV2/league/clear/prepareClearLeagueTeams.js

import { prepareClearLeagueProposal } from '../../../../domain/leagueV2/clear/clearLeagueTeamsApprovedState.builder.js'
import { readClearLeagueSources } from './readClearLeagueTeams.js'

export const prepareClearLeagueTeams = async target => {
  const sources = await readClearLeagueSources()
  return prepareClearLeagueProposal(sources, target, new Date().toISOString())
}
