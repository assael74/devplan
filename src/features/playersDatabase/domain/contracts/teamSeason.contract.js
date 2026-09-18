// features/playersDatabase/domain/contracts/teamSeason.contract.js

import { createEmptyCompleteness } from './completeness.contract.js'
import { createLifecycle } from './lifecycle.contract.js'
import { createEmptyTeamScout } from './teamScout.contract.js'

// teamPlayers are Season Participants. Roster membership and current-team
// projections are scoped only to `regular`; Movement facts remain separate.
export const TEAM_SEASON_ROSTER_STATUS_CONTRACT = Object.freeze({
  values: Object.freeze(['regular', 'left', 'youngerAgeGroup']),
  currentRosterStatus: 'regular',
  teamPlayersMeaning: 'season_participants',
  movementSource: 'transfersIn/transfersOut',
})

export const createEmptyTeamSeason = () => ({
  identity: {
    teamId: '',
    teamDocumentId: '',
    clubId: '',
    displayName: '',
    teamSlot: 1,
  },
  season: {
    seasonId: '',
    seasonKey: '',
    birthYear: null,
  },
  lifecycle: createLifecycle('current'),
  league: {
    leagueId: '',
    leagueLevel: null,
    ageGroupId: '',
    ageGroupLabel: '',
    region: '',
    leagueGames: null,
  },
  stats: {
    actual: {
      gamesPlayed: 0,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalsForPerGame: null,
      goalsAgainstPerGame: null,
    },
    projected: null,
  },
  ranking: {
    tableRank: null,
    attackRank: null,
    defenseRank: null,
  },
  performance: createEmptyTeamScout(),
  scoutProfilesSummary: {
    total: 0,
    profileCounts: {},
  },
  rosterImport: {
    mode: 'AUTHORITATIVE_SNAPSHOT',
    sourceSnapshotKey: '',
    contentHash: '',
    effectiveAt: null,
  },
  transfersIn: [],
  transfersOut: [],
  pendingPlayers: [],
  teamTaskSignals: {
    offense: false,
    defense: false,
    updatedAt: null,
  },
  playersCount: 0,
  completeness: createEmptyCompleteness(),
  metadata: {
    teamUrl: '',
    seasonUrl: '',
    sourceCollection: '',
    sourceDocumentId: '',
    sourceTarget: '',
    updatedAt: null,
  },
  calculation: {
    mode: 'projected',
    engineVersion: '',
    calculatedAt: null,
  },
})
