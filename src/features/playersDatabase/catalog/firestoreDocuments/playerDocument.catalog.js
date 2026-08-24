// src/features/playersDatabase/catalog/firestoreDocuments/playerDocument.catalog.js

// Firestore source of truth: tracked player document.
// The complete player scout shape is kept here so this document can be read in one place.

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

const PLAYER_SCOUT_PROFILE_GENERIC_OBJECT = {
  profileId: '',
  profileLabel: '',
  profileShortLabel: '',
  profileIdentity: '',
  classificationState: '',
  sourcePreliminaryProfileId: '',
  reclassifiedToProfileId: '',
  reclassificationReason: '',
  perspective: '',
  searchLevels: [],
  teamFilter: '',
  positionContext: '',
  interestLevel: '',
  profileDepth: {
    depth: 0,
    depthPct: 0,
    measurableRuleCount: 0,
    rules: [
      {
        metric: '',
        reason: '',
        depth: 0,
        depthPct: 0,
      },
    ],
  },
  profileStrength: {
    depth: 0,
    depthPct: 0,
    measurableRuleCount: 0,
  },
  profileConfidence: {
    level: 'unknown',
    reason: '',
  },
  warnings: [],
  score: null,
  reasons: [],
  requiredReview: [],
  matchEvidence: [
    {
      metric: '',
      actual: null,
      op: '',
      threshold: null,
      reason: '',
      matched: false,
    },
  ],
  scoutContext: {
    team: {
      classification: '',
      relevantSide: '',
      attack: {
        classification: '',
        priorityLevel: '',
        score: null,
      },
      defense: {
        classification: '',
        priorityLevel: '',
        score: null,
      },
      legacyFilter: '',
    },
    competition: {
      classification: '',
      clubLevel: null,
      clubStrengthLevel: null,
      leagueLevel: null,
      levelGap: null,
    },
    position: {
      evidence: '',
      requiredContext: '',
      positionValue: '',
    },
    teamGate: {
      passed: false,
      mode: '',
      reason: '',
      legacyFilterPassed: null,
      clubStrengthLevel: null,
      leagueLevel: null,
    },
  },
  spotlights: [
    {
      id: '',
      confidence: '',
      effect: '',
      evidence: [],
      details: {},
    },
  ],
};

const PLAYER_MANUAL_REVIEW_BASE_GENERIC_OBJECT = {
  note: '',
  updatedAt: null,
  seasonKey: '',
};

const PLAYER_MANUAL_REVIEW_GENERIC_OBJECT = {
  position: {
    ...PLAYER_MANUAL_REVIEW_BASE_GENERIC_OBJECT,
    value: '',
    status: 'unknown',
  },
  agent_status: {
    ...PLAYER_MANUAL_REVIEW_BASE_GENERIC_OBJECT,
    value: 'unknown',
  },
  transfer_history: {
    ...PLAYER_MANUAL_REVIEW_BASE_GENERIC_OBJECT,
    status: 'unknown',
    transfers: [],
  },
  goal_distribution: {
    ...PLAYER_MANUAL_REVIEW_BASE_GENERIC_OBJECT,
    status: 'unknown',
  },
  minutes_distribution: {
    ...PLAYER_MANUAL_REVIEW_BASE_GENERIC_OBJECT,
    status: 'unknown',
  },
  visual_review: {
    ...PLAYER_MANUAL_REVIEW_BASE_GENERIC_OBJECT,
    status: 'unknown',
  },
  agent_path_fit: {
    ...PLAYER_MANUAL_REVIEW_BASE_GENERIC_OBJECT,
    value: 'unknown',
  },
  scout_path_fit: {
    ...PLAYER_MANUAL_REVIEW_BASE_GENERIC_OBJECT,
    value: 'unknown',
  },
};

const PLAYER_MANUAL_IMMEDIACY_DECISION_GENERIC_OBJECT = {
  actionStatus: '',
  reason: '',
  note: '',
  decidedAt: null,
  seasonKey: '',
  profileIds: [],
};

const PLAYER_MANUAL_IMMEDIACY_HISTORY_GENERIC_OBJECT = {
  ...PLAYER_MANUAL_IMMEDIACY_DECISION_GENERIC_OBJECT,
};

// Canonical tracked Player document.
// Source of truth for multi-season scout history, manual review and manual immediacy.
export const PLAYERS_DATABASE_GENERIC_OBJECTS_CATALOG = {
  id: '',
  externalPlayerId: '',
  fullName: '',
  normalizedName: '',
  birthYear: null,
  birthDate: null,
  status: '',
  favorite: false,
  notes: '',
  primaryPosition: '',
  positionLayer: '',
  numShirt: '',

  tracking: {
    favorite: false,
    watchlist: false,
    firstTrackedAt: null,
    trackingReasons: [],
  },

  playerReview: PLAYER_MANUAL_REVIEW_GENERIC_OBJECT,
  manualImmediacyDecision: PLAYER_MANUAL_IMMEDIACY_DECISION_GENERIC_OBJECT,
  manualImmediacyHistory: [PLAYER_MANUAL_IMMEDIACY_HISTORY_GENERIC_OBJECT],

  verification: {
    mode: 'manual',
    answers: [
      {
        questionId: '',
        answer: 'unknown',
        sourceType: '',
        sourceLabel: '',
        answeredAt: null,
        reviewAfter: null,
      },
    ],
    updatedAt: null,
  },

  events: [
    {
      eventKey: '',
      type: '',
      seasonId: '',
      seasonKey: '',
      clubId: '',
      birthTeamId: '',
      profileId: '',
      fromClubId: '',
      fromClubName: '',
      toClubId: '',
      toClubName: '',
      fromBirthTeamId: '',
      fromBirthTeamDocumentId: '',
      toBirthTeamId: '',
      toBirthTeamDocumentId: '',
      moveType: '',
      direction: '',
      fromClubStrengthLevel: null,
      toClubStrengthLevel: null,
      fromLeagueLevel: null,
      toLeagueLevel: null,
      detectedAt: null,
    },
  ],

  scoutNarrative: PLAYER_SCOUT_NARRATIVE_GENERIC_OBJECT,

  createdAt: null,
  updatedAt: null,

  current: [
    {
      seasonId: '',
      seasonKey: '',
      seasonStatus: '',
      leagueId: '',
      leagueName: '',
      ageGroupId: '',
      ageGroupLabel: '',
      clubId: '',
      clubName: '',
      clubLevel: 0,
      clubStrengthLevel: 0,
      leagueLevel: 0,
      expectedLevelDelta: null,
      teamName: '',
      birthTeamId: '',
      birthTeamDocumentId: '',
      birthTeamSlot: 1,
      teamId: '',
      birthYear: null,
      playerUrl: '',
      notes: '',
      primaryPosition: '',
      positionLayer: '',
      numShirt: '',
      rosterStatus: 'regular',
      manualTransferDirection: '',
      isYoungerAgeGroup: false,
      statsStatus: 'missing',
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
      },
      scoutProfiles: [PLAYER_SCOUT_PROFILE_GENERIC_OBJECT],
      scoutCombinations: [],
      ...PLAYER_SCOUT_STATE_GENERIC_OBJECT,
      scoutStatsLoadMeasurementHistory: [PLAYER_SCOUT_STATS_LOAD_MEASUREMENT_GENERIC_OBJECT],
      updatedAt: null,
    },
  ],

  history: [
    {
      seasonId: '',
      seasonKey: '',
      seasonStatus: '',
      leagueId: '',
      leagueName: '',
      ageGroupId: '',
      ageGroupLabel: '',
      clubId: '',
      clubName: '',
      clubLevel: 0,
      clubStrengthLevel: 0,
      leagueLevel: 0,
      expectedLevelDelta: null,
      teamName: '',
      birthTeamId: '',
      birthTeamDocumentId: '',
      birthTeamSlot: 1,
      teamId: '',
      birthYear: null,
      playerUrl: '',
      notes: '',
      primaryPosition: '',
      positionLayer: '',
      numShirt: '',
      rosterStatus: 'regular',
      manualTransferDirection: '',
      isYoungerAgeGroup: false,
      statsStatus: 'missing',
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
      },
      scoutProfiles: [PLAYER_SCOUT_PROFILE_GENERIC_OBJECT],
      scoutCombinations: [],
      ...PLAYER_SCOUT_STATE_GENERIC_OBJECT,
      scoutStatsLoadMeasurementHistory: [PLAYER_SCOUT_STATS_LOAD_MEASUREMENT_GENERIC_OBJECT],
      updatedAt: null,
    },
  ],

  updatedAt: null,
};

