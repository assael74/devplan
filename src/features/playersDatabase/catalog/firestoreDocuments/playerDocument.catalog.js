// src/features/playersDatabase/catalog/firestoreDocuments/playerDocument.catalog.js

// Firestore source of truth: tracked player document.
// Player Seasons persist a compact scout snapshot, including the canonical
// immediacy evaluation trace needed to explain each season's decision.

import { SCOUTING_MODEL_VERSION, TEAM_LINE_CLASSIFICATION_VERSION } from '../../../../shared/scouting/scouting.version.js'
export const PLAYER_SCOUT_NULLABLE_STRUCTURED_FIELDS = [
  'scoutOpportunity',
  'scoutProfileProgression',
  'scoutProfileHierarchy',
  'scoutPlayerInterest',
]

const PLAYER_SCOUT_STATE_GENERIC_OBJECT = {
  scoutOpportunity: {
    effectiveActionStatus: '',
    baseActionStatus: '',
    automaticActionStatus: '',
    manualActionStatus: '',
    hasManualDecision: false,
    profilesRemoved: false,
    manualDecision: null,
    source: '',
    exposureLevel: '',
    boostScore: 0,
    reductionScore: 0,
    netScore: null,
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
      profileRepeat: {},
      combinationRepeat: {},
      attackingOutputUpgrade: {},
      decay: {},
      reasons: [],
    },
  },
  scoutProfileProgression: {
    distances: [
      {
        profileId: '',
        distancePct: null,
        status: '',
        matched: false,
      },
    ],
  },
  scoutProfileHierarchy: {
    primaryProfileId: '',
    primaryPreliminaryProfileId: '',
    primaryProfileIdentity: '',
    professionalProfileIds: [],
    supportingProfileIds: [],
    supportingEvidenceProfileIds: [],
    opportunityProfileIds: [],
    preliminaryProfileIds: [],
    orderedProfileIds: [],
    suppressedProfileIds: [],
    exclusiveFamilyWinners: {
      goal_output: '',
    },
  },
  scoutPlayerInterest: {
    interestLevel: '',
    score: 0,
    maxScore: 8,
    factors: [],
    reasons: [],
    limitingFactors: [],
  },
  scoutEngineVersion: SCOUTING_MODEL_VERSION,
};

const PLAYER_SCOUT_STATS_LOAD_MEASUREMENTS_GENERIC_OBJECT = {
  previous: null,
  current: null,
};

// Canonical operational Team Season document.
// Source of truth for roster/stats and the season-level computed scout state.

const PLAYER_SCOUT_PROFILE_GENERIC_OBJECT = {
  profileId: '',
  profileIdentity: '',
  strength: {
    depthPct: null,
    baseDepthPct: null,
    contextAdjustmentPct: null,
  },
  confidence: {
    level: '',
    reason: '',
  },
  reasons: [],
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

  agent: {
    status: 'unknown',
    phones: '',
    updatedAt: null,
  },

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
      detectedAt: null,
    },
  ],

  createdAt: null,
  updatedAt: null,
  lastWriteAction: '',
  lastWriteAt: null,

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
      goalDistribution: {
        scoringGames: null,
        distributionPct: null,
        updatedAt: null,
      },
      primaryPosition: '',
      positionLayer: '',
      lineClassification: {
        line: '',
        position: null,
        source: '',
        evidenceLevel: '',
        modelVersion: TEAM_LINE_CLASSIFICATION_VERSION,
      },
      numShirt: '',
      rosterStatus: 'regular',
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
      scoutCombinationIds: [],
      ...PLAYER_SCOUT_STATE_GENERIC_OBJECT,
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
      goalDistribution: {
        scoringGames: null,
        distributionPct: null,
        updatedAt: null,
      },
      primaryPosition: '',
      positionLayer: '',
      lineClassification: {
        line: '',
        position: null,
        source: '',
        evidenceLevel: '',
        modelVersion: TEAM_LINE_CLASSIFICATION_VERSION,
      },
      numShirt: '',
      rosterStatus: 'regular',
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
      scoutCombinationIds: [],
      ...PLAYER_SCOUT_STATE_GENERIC_OBJECT,
      updatedAt: null,
    },
  ],

  updatedAt: null,
};
