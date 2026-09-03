// src/features/playersDatabase/catalog/firestoreDocuments/birthTeamSeasonDocument.catalog.js

// Firestore source of truth: one birth-team season document.
// Owns roster, statistics, performance, balance and compact scouting projections
// for exactly one team + season identity.

const TEAM_BALANCE_GENERIC_OBJECT = {
  snapshotFormat: 'team-balance-summary-v14',
  version: '',
  outputContractVersion: '',
  persistenceContractVersion: '',
  dependencyKey: '',
  source: {
    inputHash: '',
  },
  lineClassificationCoverage: {
    playersClassified: 0,
    playersTotal: 0,
    playersRate: 0,
    minutesClassified: 0,
    minutesTotal: 0,
    minutesRate: 0,
  },
  lineStructure: {
    minimumGames: 8,
    relevantPlayersCount: 0,
    loadedRelevantPlayersCount: 0,
    goalkeeperPlayersCount: 0,
    eligiblePlayersCount: 0,
    classifiedPlayersCount: 0,
    unclassifiedSufficientSamplePlayersCount: 0,
    insufficientSamplePlayersCount: 0,
    positions: {
      fullback: {
        playersCount: 0,
      },
      attackingMidfielder: {
        playersCount: 0,
      },
    },
    lines: {
      defense: {
        playersCount: 0,
      },
      midfield: {
        playersCount: 0,
      },
      attack: {
        playersCount: 0,
      },
    },
    composition: {
      midfieldCorePlayersCount: 0,
    },
  },
  balanceAvailability: {
    availability: '',
    availabilityReason: null,
  },
  lineupBenchmark: {
    definitionId: '',
    definitionVersion: '',
    availability: '',
    availabilityReason: null,
    metrics: {
      goalkeeper: { actual: 0, reference: 0, delta: null, state: '' },
      defense: { actual: 0, reference: 0, delta: null, state: '' },
      midfieldCore: { actual: 0, reference: 0, delta: null, state: '' },
      attackingMidfielder: { actual: 0, reference: 0, delta: null, state: '' },
      attack: { actual: 0, reference: 0, delta: null, state: '' },
    },
  },
  classificationCoverageBenchmark: {
    definitionId: '',
    definitionVersion: '',
    availability: '',
    availabilityReason: null,
    actual: 0,
    typicalRange: { min: 0, max: 0 },
    state: '',
  },
  scoutInterpretation: {
    modelVersion: '',
    availability: '',
    availabilityReason: null,
    offense: {
      performanceLevel: '',
      performanceBand: '',
      benchmarkState: '',
      finding: null,
    },
    defense: {
      performanceLevel: '',
      performanceBand: '',
      benchmarkState: '',
      finding: null,
    },
    teamInterest: {
      isInteresting: false,
      lines: {
        offense: { isInteresting: false, reason: null },
        defense: { isInteresting: false, reason: null },
      },
      squad: { isInteresting: false, reason: null },
    },
  },
  updatedAt: null,
}

const TEAM_PLAYER_SCOUT_PROJECTION_GENERIC_OBJECT = {
  primaryScoutProfileId: '',
  primaryScoutProfileStrengthDepthPct: null,
  professionalScoutProfileIds: [],
  preliminaryScoutProfileIds: [],
  scoutEffectiveImmediacyStatus: '',
  scoutPlayerInterestLevel: '',
  scoutEngineVersion: 'scouting-v2',
}

export const BIRTH_TEAM_SEASON_DOCUMENT_OPTIONAL_SCHEMA_PATHS = Object.freeze([])

export const BIRTH_TEAM_SEASONS_DATABASE_GENERIC_OBJECTS_CATALOG = {
  id: '',
  birthTeamId: '',
  birthTeamDocumentId: '',
  seasonId: '',
  seasonKey: '',
  seasonStatus: '',
  ageGroupId: '',
  leagueId: '',
  teamUrl: '',
  birthYear: 0,
  leagueTotalRound: 0,
  leagueLevel: 0,
  expectedLevelDelta: null,
  tableRank: null,
  tableAttackRank: null,
  tableDefenseRank: null,
  goalsForPerGame: 0,
  goalsAgainstPerGame: 0,
  teamAttackPerformance: null,
  teamDefensePerformance: null,
  playersCount: 0,
  scoutProfilesSummary: {
    total: 0,
    profileCounts: {},
  },
  teamPlayers: [
    {
      playerId: '',
      externalPlayerId: '',
      playerDocumentId: '',
      identityKey: '',
      fullName: '',
      normalizedName: '',
      aliases: [],
      playerUrl: '',
      notes: '',
      numShirt: '',
      statsStatus: 'missing',
      rosterStatus: 'regular',
      manualTransferDirection: '',
      isYoungerAgeGroup: false,
      primaryPosition: '',
      positionLayer: '',
      lineClassification: {
        line: '',
        position: null,
        source: '',
        evidenceLevel: '',
        modelVersion: 'player-line-v7',
      },
      playerStats: {
        games: 0,
        goals: 0,
        yellowCards: 0,
        minutes: 0,
        starts: 0,
        substituteIn: 0,
        substitutedOut: 0,
        teamMinutes: 0,
        teamGames: 0,
        teamRank: null,
        teamGoalsFor: 0,
        teamGoalsAgainst: 0,
        minutesPerGame: 0,
        goalsPer90: 0,
      },
      ...TEAM_PLAYER_SCOUT_PROJECTION_GENERIC_OBJECT,
      updatedAt: null,
    },
  ],
  teamStats: {
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    teamGamePlayed: 0,
  },
  teamBalance: TEAM_BALANCE_GENERIC_OBJECT,
  createdAt: null,
  updatedAt: null,
}
