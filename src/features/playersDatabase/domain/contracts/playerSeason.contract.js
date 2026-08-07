// src/features/playersDatabase/domain/contracts/playerSeason.contract.js

import { createEmptyCompleteness } from './completeness.contract.js'
import { createLifecycle } from './lifecycle.contract.js'
import { createEmptyPlayerScout } from './playerScout.contract.js'
import { createEmptyTeamScout } from './teamScout.contract.js'
import { PLAYER_STATS_STATUS } from '../../model/playerStats.model.js'

const createEmptyPlayerStats = () => ({
  games: 0,
  starts: 0,
  minutes: 0,
  goals: 0,
  yellowCards: 0,
  substituteIn: 0,
  substitutedOut: 0,
})

export const createEmptyPlayerSeason = () => ({
  identity: { playerId: '', playerDocumentId: '', externalPlayerId: '', displayName: '', normalizedName: '', aliases: [] },
  season: { seasonId: '', seasonKey: '', birthYear: null },
  lifecycle: createLifecycle('current'),
  team: { teamId: '', teamDocumentId: '', clubId: '', leagueId: '', leagueLevel: null, ageGroupId: '', ageGroupLabel: '', birthTeamSlot: null, displayName: '' },
  position: { layer: '', primary: '', shirtNumber: '' },
  statsStatus: PLAYER_STATS_STATUS.MISSING,
  stats: {
    actual: createEmptyPlayerStats(),
    projected: null,
    context: { teamMinutes: null, teamGames: null, teamRank: null, teamGoalsFor: null, teamGoalsAgainst: null },
    rates: { minutesPerGame: null, goalsPer90: null },
  },
  scout: createEmptyPlayerScout(),
  teamPerformance: createEmptyTeamScout(),
  completeness: createEmptyCompleteness(),
  metadata: { notes: '', playerUrl: '', teamUrl: '', seasonUrl: '', rosterStatus: '', sourceCollection: '', sourceDocumentId: '', sourceTarget: '', updatedAt: null },
  calculation: { mode: 'projected', engineVersion: '', calculatedAt: null },
})
