// src/features/playersDatabase/catalog/firestoreDocuments/birthTeamDocument.catalog.js

// Firestore source of truth: multi-season birth-team document.
// The complete Team Player scout shape is kept here so this document can be read in one place.


const TEAM_BALANCE_TOP_SHARE_METRIC_GENERIC_OBJECT = {
  count: 0,
  actualCount: 0,
  isCompleteRosterSlice: false,
  hasFullTopN: false,
  coversAllKnownPlayers: false,
  minutes: 0,
  amount: 0,
  share: null,
}

const TEAM_BALANCE_COMPARISON_GENERIC_OBJECT = {
  value: null,
  band: null,
  comparisonAvailability: 'unavailable',
  actualCount: 0,
  hasFullTopN: false,
  coversAllKnownPlayers: false,
  teamMinutesConsistent: true,
  note: null,
}

const TEAM_BALANCE_KNOWN_METRIC_GENERIC_OBJECT = {
  availability: 'unavailable',
  knownCount: 0,
  unknownCount: 0,
  coverage: 0,
  total: 0,
  activePlayersCount: 0,
  topShares: {
    5: TEAM_BALANCE_TOP_SHARE_METRIC_GENERIC_OBJECT,
    10: TEAM_BALANCE_TOP_SHARE_METRIC_GENERIC_OBJECT,
    14: TEAM_BALANCE_TOP_SHARE_METRIC_GENERIC_OBJECT,
  },
}

const TEAM_BALANCE_GENERIC_OBJECT = {
  version: '',
  outputContractVersion: '',
  persistenceContractVersion: '',
  dependencyKey: '',
  source: {
    collection: 'birthTeams',
    teamDocumentId: '',
    seasonId: '',
    seasonKey: '',
    seasonTarget: null,
    sourceType: 'teamDocumentStats',
    inputHash: '',
    updatedAt: null,
  },
  reliability: {
    reliability: 'insufficient',
    rosterCount: 0,
    loadedCount: 0,
    observedLoadedCount: 0,
    ambiguousZeroLoadedCount: 0,
    sufficientBlockedByAmbiguousZeros: false,
    missingCount: 0,
    loadedCoverage: 0,
    observedCoverage: 0,
    knownMinutesCount: 0,
    unknownMinutesCount: 0,
    minutesFieldCoverage: 0,
    positiveTeamMinutesCount: 0,
    missingTeamMinutesCount: 0,
    teamMinutesCoverage: 0,
    teamMinutesConsistent: true,
    teamMinutesValuesCount: 0,
    teamMinutesRange: null,
    totalLoadedMinutes: 0,
    availability: {
      minutesDistribution: 'unavailable',
      possibleMinutesUsage: 'unavailable',
    },
  },
  metrics: {
    minutesDistribution: {
      family: 'minutesDistribution',
      availability: 'unavailable',
      knownCount: 0,
      unknownCount: 0,
      coverage: 0,
      rosterKnownCoverage: 0,
      totalMinutes: 0,
      topShares: {
        5: TEAM_BALANCE_TOP_SHARE_METRIC_GENERIC_OBJECT,
        10: TEAM_BALANCE_TOP_SHARE_METRIC_GENERIC_OBJECT,
        14: TEAM_BALANCE_TOP_SHARE_METRIC_GENERIC_OBJECT,
      },
      possibleMinutesUsage: {
        availability: 'unavailable',
        knownCount: 0,
        unknownCount: 0,
        coverage: 0,
        rosterKnownCoverage: 0,
        teamMinutesConsistent: true,
        teamMinutesValuesCount: 0,
        teamMinutesRange: null,
        thresholdCounts: {
          70: 0,
          50: 0,
          30: 0,
          10: 0,
        },
      },
    },
    productionDistribution: {
      family: 'productionDistribution',
      availability: 'unavailable',
      knownCount: 0,
      unknownCount: 0,
      coverage: 0,
      goalsKnownCoverage: 0,
      knownGoalsCount: 0,
      unknownGoalsCount: 0,
      rosterKnownCoverage: 0,
      totalGoals: 0,
      concentration: {
        top1Share: null,
        top3Share: null,
      },
      breadth: {
        uniqueScorers: 0,
        scorers3Plus: 0,
        scorers5Plus: 0,
      },
    },
    rotationDistribution: {
      family: 'rotationDistribution',
      availability: 'unavailable',
      rosterKnownCoverage: 0,
      starts: TEAM_BALANCE_KNOWN_METRIC_GENERIC_OBJECT,
      substituteIn: TEAM_BALANCE_KNOWN_METRIC_GENERIC_OBJECT,
      usageTypes: {
        availability: 'unavailable',
        knownCount: 0,
        unknownCount: 0,
        coverage: 0,
        startersOnlyCount: 0,
        substitutesOnlyCount: 0,
        mixedUsageCount: 0,
        noStartOrSubCount: 0,
      },
    },
  },
  benchmarkVersions: {
    minutesDistribution: '',
    productionDistribution: '',
    rotationDistribution: '',
  },
  benchmarks: {
    minutesDistribution: {
      family: 'minutesDistributionBenchmark',
      benchmarkVersion: '',
      availability: 'unavailable',
      reliability: null,
      reliabilityContext: {
        loadedCoverage: null,
        observedCoverage: null,
        ambiguousZeroLoadedCount: 0,
        sufficientBlockedByAmbiguousZeros: false,
        teamMinutesConsistent: true,
      },
      topShares: {
        5: TEAM_BALANCE_COMPARISON_GENERIC_OBJECT,
        10: TEAM_BALANCE_COMPARISON_GENERIC_OBJECT,
        14: TEAM_BALANCE_COMPARISON_GENERIC_OBJECT,
      },
      possibleMinutesUsage: {
        availability: 'unavailable',
        counts: {
          70: TEAM_BALANCE_COMPARISON_GENERIC_OBJECT,
          50: TEAM_BALANCE_COMPARISON_GENERIC_OBJECT,
          30: TEAM_BALANCE_COMPARISON_GENERIC_OBJECT,
          10: TEAM_BALANCE_COMPARISON_GENERIC_OBJECT,
        },
      },
    },
    productionDistribution: {
      family: 'productionDistributionBenchmark',
      benchmarkVersion: '',
      availability: 'unavailable',
      coverage: null,
      totalGoals: null,
      concentration: {
        top1Share: TEAM_BALANCE_COMPARISON_GENERIC_OBJECT,
        top3Share: TEAM_BALANCE_COMPARISON_GENERIC_OBJECT,
      },
      breadth: {
        validatedForBand: false,
        bandPolicy: 'disabled_until_goals_volume_adjustment',
        uniqueScorers: TEAM_BALANCE_COMPARISON_GENERIC_OBJECT,
        scorers3Plus: TEAM_BALANCE_COMPARISON_GENERIC_OBJECT,
        scorers5Plus: TEAM_BALANCE_COMPARISON_GENERIC_OBJECT,
      },
    },
    rotationDistribution: {
      family: 'rotationDistributionBenchmark',
      benchmarkVersion: '',
      availability: 'unavailable',
      starts: {
        availability: 'unavailable',
        coverage: null,
        topShares: {
          5: TEAM_BALANCE_COMPARISON_GENERIC_OBJECT,
          10: TEAM_BALANCE_COMPARISON_GENERIC_OBJECT,
          14: TEAM_BALANCE_COMPARISON_GENERIC_OBJECT,
        },
      },
      substituteIn: {
        availability: 'unavailable',
        coverage: null,
        topShares: {
          5: TEAM_BALANCE_COMPARISON_GENERIC_OBJECT,
          10: TEAM_BALANCE_COMPARISON_GENERIC_OBJECT,
          14: TEAM_BALANCE_COMPARISON_GENERIC_OBJECT,
        },
      },
      usageTypes: {
        availability: 'unavailable',
        coverage: null,
        bandPolicy: 'descriptive_only_v1',
      },
    },
  },
  updatedAt: null,
}

export const PLAYER_SCOUT_NULLABLE_STRUCTURED_FIELDS = [
  'scoutOpportunity',
  'scoutVerification',
  'scoutProfileProgression',
  'scoutProfileHierarchy',
  'scoutProfileCaseStrength',
  'scoutPlayerInterest',
  'scoutTrajectory',
  'scoutTransferContext',
]

const PLAYER_SCOUT_NARRATIVE_SNAPSHOT_GENERIC_OBJECT = {
  version: 2,
  inputHash: '',
  scope: '',
  seasonKeys: [],
  profileRefs: [
    {
      seasonKey: '',
      birthTeamId: '',
      birthTeamDocumentId: '',
      birthTeamSlot: 0,
      profileId: '',
    },
  ],
  revision: 0,
  generatedAt: null,
  approvedAt: null,
  source: 'ai',
  generator: {
    model: '',
    promptVersion: '',
  },
  content: {
    title: '',
    summary: '',
    conclusion: null,
    whyInteresting: '',
    professionalContext: '',
    strengths: [],
    unknowns: [],
    action: null,
    evidenceRefs: [],
  },
}

const PLAYER_SCOUT_NARRATIVE_GENERIC_OBJECT = {
  version: 2,
  seasons: [
    {
      seasonId: '',
      seasonKey: '',
      approved: PLAYER_SCOUT_NARRATIVE_SNAPSHOT_GENERIC_OBJECT,
    },
  ],
  career: PLAYER_SCOUT_NARRATIVE_SNAPSHOT_GENERIC_OBJECT,
}

const PLAYER_SCOUT_STATE_GENERIC_OBJECT = {
  scoutCandidateSignals: [
    {
      id: 'near_profile',
      profileId: '',
      profileLabel: '',
      profileShortLabel: '',
      distance: null,
      distancePct: null,
      status: '',
      trend: '',
      distanceDelta: null,
      distanceDeltaPct: null,
    },
  ],
  scoutEvidence: [
    {
      id: '',
      category: '',
      metric: '',
      value: null,
      op: '',
      threshold: null,
    },
  ],
  scoutSpotlights: [
    {
      id: '',
      confidence: '',
      effect: '',
      evidence: [],
      details: {},
    },
  ],
  scoutOpportunity: {
    effectiveActionStatus: '',
    baseActionStatus: 'watch',
    automaticActionStatus: 'watch',
    manualActionStatus: '',
    hasManualDecision: false,
    profilesRemoved: false,
    manualDecision: {
      hasDecision: false,
      actionStatus: '',
      reason: '',
      note: '',
      decidedAt: null,
      seasonKey: '',
      profileIds: [],
    },
    source: '',
    boostScore: 0,
    reductionScore: 0,
    netScore: 0,
    boosts: [
      {
        id: '',
        points: 0,
        details: {},
      },
    ],
    reductions: [
      {
        id: '',
        points: 0,
        details: {},
      },
    ],
    evaluations: [
      {
        id: '',
        result: '',
        points: 0,
        reason: '',
        profileId: '',
        details: {},
      },
    ],
    signalPersistence: {
      profileRepeat: {
        profileId: '',
        seasons: 0,
      },
      combinationRepeat: {
        combinationId: '',
        profileIds: [],
        seasons: 0,
      },
      decay: {
        seasonsWithoutSignal: 0,
        profileIds: [],
        lastSignalSeasonKey: '',
        currentSeasonKey: '',
        currentSeasonCounted: false,
      },
      reasons: [],
    },
    exposureLevel: '',
    reasons: [],
    profileIds: [],
    candidateProfileIds: [],
    bestProfileId: '',
  },
  scoutVerification: {
    checks: [],
    answeredChecks: [],
    missingChecks: [],
    nextBestCheck: null,
    dimensions: {},
    completion: {
      answered: 0,
      total: 0,
      complete: false,
    },
  },
  scoutProfileProgression: {
    distances: [],
    nearProfiles: [],
    nearestProfile: null,
  },
  scoutProfileHierarchy: {
    primaryProfileId: '',
    primarySignal: null,
    supportingProfileIds: [],
    supportingSignals: [],
    orderedProfileIds: [],
    suppressedProfileIds: [],
    exclusiveFamilyWinners: {
      goal_output: '',
    },
  },
  scoutProfileCaseStrength: {
    primaryProfileId: '',
    primaryProfileStrength: {
      depth: 0,
      depthPct: 0,
      measurableRuleCount: 0,
    },
    profileCount: 0,
    profileIds: [],
    supportingProfileIds: [],
    hasDefinedCombination: false,
    combinationCount: 0,
    combinationIds: [],
  },
  scoutPlayerInterest: {
    assessmentScope: 'player_career',
    interestLevel: '',
    profileInterestLevel: '',
    combinationInterestLevel: '',
    primaryProfileId: '',
    reasons: [],
    limitingFactors: [],
    upgradeConditions: [],
  },
  scoutTrajectory: {
    direction: '',
    confidence: '',
    evidence: [],
    stintsCount: 0,
    seasonsCount: 0,
    latestTransfer: null,
    transferEvents: [],
  },
  futureCompetitionPath: null,
  scoutTransferContext: null,
  scoutEngineVersion: 'scouting-v2',
};

export const PLAYER_SCOUT_STATS_LOAD_MEASUREMENT_GENERIC_OBJECT = {
  snapshotKey: '',
  capturedAt: '',
  engineVersion: 'scouting-v2',
  primaryProfileId: '',
  profileIds: [],
  profileStates: [
    {
      profileId: '',
      matched: false,
      depth: null,
      distance: null,
    },
  ],
};

const PLAYER_SCOUT_STATS_LOAD_MEASUREMENTS_GENERIC_OBJECT = {
  previous: null,
  current: null,
};

// Canonical operational Team Season document.
// Source of truth for roster/stats and the season-level computed scout state.

export const BIRTH_TEAMS_DATABASE_GENERIC_OBJECTS_CATALOG = {
  id: '',
  clubId: '',
  birthTeamId: '',
  birthYear: 0,
  birthTeamSlot: 1,
  displayName: '',
  teamId: '',
  createdAt: null,

  current: [
    {
      seasonId: '',
      ageGroupId: '',
      seasonStatus: '',
      leagueId: '',
      teamUrl: '',
      birthYear: 0,
      leagueTotalRound: 0,
      leagueLevel: 0,
      expectedLevelDelta: null,
      seasonKey: '',
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
            teamAttackPerformance: null,
            teamDefensePerformance: null,
            minutesPerGame: 0,
            goalsPer90: 0,
          },

          scoutProfiles: [],
          scoutCombinations: [],
          ...PLAYER_SCOUT_STATE_GENERIC_OBJECT,
          scoutStatsLoadMeasurements: PLAYER_SCOUT_STATS_LOAD_MEASUREMENTS_GENERIC_OBJECT,
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
      updatedAt: null,
    },
  ],

  history: [
    {
      seasonId: '',
      ageGroupId: '',
      seasonStatus: '',
      seasonKey: '',
      leagueId: '',
      teamUrl: '',
      birthYear: 0,
      leagueTotalRound: 0,
      leagueLevel: 0,
      expectedLevelDelta: null,
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
            teamAttackPerformance: null,
            teamDefensePerformance: null,
            minutesPerGame: 0,
            goalsPer90: 0,
          },

          scoutProfiles: [],
          scoutCombinations: [],
          ...PLAYER_SCOUT_STATE_GENERIC_OBJECT,
          scoutStatsLoadMeasurements: PLAYER_SCOUT_STATS_LOAD_MEASUREMENTS_GENERIC_OBJECT,
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
      updatedAt: null,
    },
  ],

  updatedAt: null,
};

