// src/features/playersDatabase/domain/contracts/teamSeason.contract.js

import { createEmptyCompleteness } from './completeness.contract.js'
import { createLifecycle } from './lifecycle.contract.js'
import { createEmptyTeamScout } from './teamScout.contract.js'

export const createEmptyTeamSeason = () => ({
  identity: { teamId: '', teamDocumentId: '', clubId: '', displayName: '', teamSlot: 1 },
  season: { seasonId: '', seasonKey: '', birthYear: null },
  lifecycle: createLifecycle('current'),
  league: { leagueId: '', leagueLevel: null, ageGroupId: '', ageGroupLabel: '', region: '', leagueGames: null },
  stats: {
    actual: { gamesPlayed: 0, points: 0, goalsFor: 0, goalsAgainst: 0, goalsForPerGame: null, goalsAgainstPerGame: null },
    projected: null,
  },
  ranking: { tableRank: null, attackRank: null, defenseRank: null },
  performance: createEmptyTeamScout(),
  scoutProfilesSummary: { total: 0, profileCounts: {} },
  playersCount: 0,
  completeness: createEmptyCompleteness(),
  metadata: { teamUrl: '', seasonUrl: '', sourceCollection: '', sourceDocumentId: '', sourceTarget: '', updatedAt: null },
  calculation: { mode: 'projected', engineVersion: '', calculatedAt: null },
})
