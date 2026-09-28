// src/features/playersDatabase/services/writeV2/league/deleteSeason/prepareDeleteLeagueSeason.js

import { readClearLeagueSources } from '../clear/readClearLeagueTeams.js'
import { prepareDeleteSeasonProposal } from '../../../../domain/leagueV2/deleteSeason/deleteLeagueSeasonApprovedState.builder.js'

// Full canonical League collection plus integrity-only dependencies, all server reads.
// Receipts deliberately do not participate in Domain availability.
export const prepareDeleteLeagueSeason = async target =>
  prepareDeleteSeasonProposal(await readClearLeagueSources(), target, new Date().toISOString())
