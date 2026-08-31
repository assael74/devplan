// src/features/playersDatabase/catalog/firestoreDocuments/playerDocument.catalog.js

// Firestore source of truth: tracked player document.
// Player Seasons persist only the compact V3 scout snapshot. The full scouting
// engine result remains runtime/domain state and rich V2 fields are not part of
// canonical Player persistence.

export const PLAYER_SCOUT_NULLABLE_STRUCTURED_FIELDS = [
  'scoutOpportunity',
  'scoutProfileProgression',
  'scoutProfileHierarchy',
  'scoutPlayerInterest',
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
  scoutOpportunity: {
    effectiveActionStatus: '',
    exposureLevel: '',
    netScore: null,
    reasons: [],
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
    reasons: [],
    limitingFactors: [],
  },
  scoutEngineVersion: 'scouting-v2',
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
      scoutCombinationIds: [],
      ...PLAYER_SCOUT_STATE_GENERIC_OBJECT,
      updatedAt: null,
    },
  ],

  updatedAt: null,
};
