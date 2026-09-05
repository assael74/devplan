// src/features/playersDatabase/domain/adapters/teamScoutEngine.adapter.js

import { SCOUTING_MODEL_VERSION } from '../../../../shared/scouting/scouting.version.js'
import { normalizeTeamScout } from '../contracts/teamScout.contract.js'
import { cleanDomainValue } from '../contracts/domainValue.contract.js'

export const adaptTeamScoutEngineRow = ({ row = {}, source = {} } = {}) => normalizeTeamScout({
  offense: row.offense || {},
  defense: row.defense || {},
  normalization: source.normalization || {},
  context: {
    leagueLevel: source.leagueLevel,
    leagueGames: source.leagueGames,
    tableRank: row.rank || row.tableRank,
  },
  scoutContext: row.scoutContext || null,
  needs: row.needs || [],
  recruitmentOpportunity: row.recruitmentOpportunity || {},
  source: {
    engineVersion: cleanDomainValue(source.engineVersion) || SCOUTING_MODEL_VERSION,
    calculatedAt: source.calculatedAt || null,
  },
})
