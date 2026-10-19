// src/features/playersDatabase/catalog/firestoreDocuments/playerSearchIndex.catalog.js
// Canonical document contract.

export const PLAYER_SEARCH_INDEX_DOCUMENT = {
  collection: 'dbSearchIndexes',
  documentId: 'playerSeason__{playerId}__{teamSeasonDocumentId}',

  purpose: 'Rebuildable Player Season search projection. Query fields stay flat; display and scouting evidence may be nested.',

  // ---------------------------------------------------------------------------
  // Firestore query fields
  // Keep only fields used directly by Player Search queries at top level.
  // ---------------------------------------------------------------------------

  seasonId: '',
  birthYear: null,

  leagueId: '',
  leagueLevel: null,

  playerId: '',

  expectedLevelDelta: null,

  scoutEffectiveImmediacyStatus: '',

  scoutProfileIds: [],
  scoutCombinationIds: [],
  scoutProfileSearchIds: [],

  // ---------------------------------------------------------------------------
  // Stable references / navigation
  // These are not Firestore query fields in the new architecture.
  // ---------------------------------------------------------------------------

  references: {
    playerSeasonDocumentId: '',
    teamSeasonDocumentId: '',
  },

  identity: {
    externalPlayerId: '',
    displayName: '',
    normalizedDisplayName: '',
    aliases: [],
  },

  season: {
    seasonKey: '',
    seasonStatus: '',
  },

  team: {
    teamId: '',
    clubId: '',
    clubLevel: null,
    clubStrengthLevel: null,

    teamSlot: null,

    ageGroupId: '',
    ageGroupLabel: '',

    region: '',

  },

  player: {
    playerUrl: '',

    primaryPosition: '',
    positionLayer: '',
    numShirt: '',

    rosterStatus: '',
    statsStatus: '',

    isYoungerAgeGroup: false,
    isOlderAgeGroup: false,

    notes: '',
  },

  // ---------------------------------------------------------------------------
  // Search result statistics
  // Numeric filters are applied client-side after the Firestore result set is
  // loaded, so these values do not need to remain flat.
  // ---------------------------------------------------------------------------

  stats: {
    actual: {
      games: null,
      goals: null,
      yellowCards: null,
      minutes: null,
      starts: null,
      substituteIn: null,
      substitutedOut: null,
    },

    projected: {
      games: null,
      goals: null,
      minutes: null,
      starts: null,
    },
  },

  // ---------------------------------------------------------------------------
  // Scouting display projection
  // Query arrays/status remain flat above. Rich display fields stay nested.
  // ---------------------------------------------------------------------------

  scout: {
    primary: {
      profileId: '',
      strengthDepthPct: null,
      score: null,
      reliabilityLevel: '',
      warnings: [],
    },

    secondary: {
      profileId: '',
      strengthDepthPct: null,
      score: null,
      reliabilityLevel: '',
      warnings: [],
    },

    playerInterestLevel: '',
  },

  // ---------------------------------------------------------------------------
  // Evidence for the current scouting result
  // Snapshot of the professional state used to calculate the current profile.
  // ---------------------------------------------------------------------------

  scoutEvidence: {
    capturedAt: null,
    statsSnapshotKey: '',
    engineVersion: '',

    profileResult: {
      primaryProfileId: '',
      secondaryProfileId: '',
      profileIds: [],
      combinationIds: [],
    },

    actual: {
      games: null,
      goals: null,
      yellowCards: null,
      minutes: null,
      starts: null,
      substituteIn: null,
      substitutedOut: null,
    },

    projected: {
      games: null,
      goals: null,
      minutes: null,
      starts: null,
    },

    calculationContext: {
      seasonStatus: '',
      gameDurationMinutes: null,
      leagueTotalRound: null,

      teamGamePlayed: null,
      remainingTeamGames: null,
      teamMinutesPlayed: null,
      minutesShareRate: null,

      normalizationStatus: '',
      normalizationVersion: null,

      clubLevel: null,
      clubStrengthLevel: null,
      leagueLevel: null,

      teamTableRank: null,
      teamGoalsFor: null,
      teamGoalsAgainst: null,
    },

    primary: {
      teamGateMode: '',
    },

    progression: {
      profileId: '',
      distancePct: null,
      trend: '',
    },
  },

  updatedAt: null,

  writeModel: [
    'This document is a projection and never the source of truth.',
    'The document id is deterministic and equals playerSeason__{playerId}__{teamSeasonDocumentId}.',
    'Only active Player Search Firestore query fields remain flat.',
    'seasonKey, teamId and teamSeasonDocumentId are explicit nested references/navigation fields and are not query fields.',
    'Legacy scope queries by seasonKey/teamId are not part of the target architecture.',
    'Roster and clear flows derive expected Player SearchIndex document ids from the canonical Team Season roster.',
    'The current scout profile and scoutEvidence are rebuilt together from the same approved stats/scouting state.',
    'Blind replace/update/delete by deterministic document id is preferred over projection discovery reads.',
    'The projection is rebuildable from Player Root, Team Season, League Season and ClubProfile.',
    'scoutEvidence is copied from Team Season canonical seasonal scouting evidence and is never recomputed by this projection.',
  ],

  invariants: [
    'team.seasonUrl and team.teamUrl are not part of the active projection and are not written or synchronized. Legacy values may remain and are ignored; no migration or cleanup is required.',
    'entityType is intentionally not persisted.',
    'playerId equals player__{birthYear}__{externalPlayerId}; externalPlayerId is required and Player Root uses the same id.',
    'teamSeasonDocumentId equals {teamId}__{seasonId} and is based on technical seasonId, never seasonKey.',
    'The same player in two teams in one season produces two different search documents because teamSeasonDocumentId differs.',
    'Changing player name, URL, league metadata, club level or scout profile does not change the search document id.',
    'playerDocumentId is intentionally not persisted because playerId is also the Player Root document id.',
    'searchGames/searchGoals/searchMinutes/searchStarts are intentionally not persisted.',
    'projectedGamesRaw/projectedGoalsRaw/projectedMinutesRaw/projectedStartsRaw are intentionally not persisted.',
    'statsSnapshots.previous/current are intentionally not persisted.',
    'secondary scout profile remains because the current Search UI consumes it.',
    'near profile is not a query/display field; optional progression evidence belongs under scoutEvidence.progression.',
    'scoutEvidence must be copied from Team Season and describe the same scouting result represented by the current flat scout query fields.',
  ],
};

export default PLAYER_SEARCH_INDEX_DOCUMENT;
