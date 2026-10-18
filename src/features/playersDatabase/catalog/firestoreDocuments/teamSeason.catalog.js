// src/features/playersDatabase/catalog/firestoreDocuments/teamSeason.catalog.js
// Canonical document contract.

export const TEAM_SEASON_DOCUMENT = {
  collection: 'dbBirthTeamSeasons',
  documentId: '{teamId}__{seasonId}',

  purpose: 'Canonical state for one Team Root in one season, partitioned by ownership.',

  identity: {
    teamSeasonDocumentId: '',
    teamId: '',

    seasonId: '',   // Technical id in YYYY_YYYY form.
    seasonKey: '',  // Business/display value, e.g. 25/26.
    seasonStatus: '',

    clubId: '',
    birthYear: null,
    teamSlot: null,

    externalTeamId: '',
    leagueId: '',
    ageGroupId: '',
  },

  // Snapshot of League/Club-owned facts required by Team Page and scouting.
  // These values are not canonical here and must not be independently edited.
  competitionSnapshot: {
    teamUrl: '',
    clubLevel: null,
    clubStrengthLevel: null,

    officialTable: {
      rank: null,
      points: null,
      goalsFor: null,
      goalsAgainst: null,
      teamGamePlayed: null,
    },

    updatedAt: null,
  },

  roster: {
    // Keyed by canonical playerId.
    // Players without externalPlayerId are not accepted in the current product contract.
    playersById: {
      '<playerId>': {
        externalPlayerId: '',
        identityKey: '',
        fullName: '',
        normalizedName: '',
        aliases: [],

        rosterStatus: '',
        isYoungerAgeGroup: false,
        isOlderAgeGroup: false,
        numShirt: null,

        updatedAt: null,
      },
    },

    // Unresolved roster reconciliation state. This is not a resolved movement.
    pendingById: {
      '<playerId>': {
        playerId: '',
        externalPlayerId: '',
        identityKey: '',
        fullName: '',

        previousSeasonId: '',
        previousTeamId: '',
        previousTeamSeasonDocumentId: '',

        identitySnapshot: {},

        updatedAt: null,
      },
    },

    // Last Roster Load time; Stats participation updates preserve it.
    rosterImport: { loadedAt: null },
    updatedAt: null,
  },

  stats: {
    playersById: {
      '<playerId>': {
        statsStatus: '',

        playerStats: {
          games: null,
          goals: null,
          yellowCards: null,
          minutes: null,
          starts: null,
          substituteIn: null,
          substitutedOut: null,
          teamMinutes: null,
          teamGamePlayed: null,
        },

        lineClassification: {
          line: '',
        },

        updatedAt: null,
      },
    },

    // Rich Team Balance remains Stats-owned.
    // teamTaskSignals/teamTaskAvailability are stored separately and are not duplicated here.
    teamBalance: {},

    statsLoadState: {
      status: '', // missing | loaded
      updatedAt: null,
    },

    updatedAt: null,
  },

  // Seasonal Movement ownership.
  // transfersInById is canonical on the destination Team Season.
  // transfersOutById is a counterpart projection written only when the source Team Season exists.
  // Player Season and ClubsCenter movement views are rebuilt from the canonical incoming fact plus available counterpart projections.
  movement: {
    // Rebuildable arrival context for new transfers. Older transfers may have no entry.
    arrivalHistoryById: {
      '<movementId>': {
        movementId: '',
        playerId: '',
        sourceTeamSeasonDocumentId: '',
        sourceSeasonId: '',
        sourceUpdatedAt: null,
        sourceStatus: '', // available | missing
        scoutStatus: '', // available | none | unknown
        primaryProfileId: '',
        primaryProfileDepthPct: null,
        professionalProfileIds: [],
        preliminaryProfileIds: [],
        profileDepthsById: {},
        lineStatus: '', // available | none | unknown
        line: '',
        updatedAt: null,
      },
    },
    transfersInById: {
      '<movementId>': {
        movementId: '',
        playerId: '',

        fromTeamId: '',
        fromTeamSeasonDocumentId: '',
        fromClubId: '',

        toTeamId: '',
        toTeamSeasonDocumentId: '',
        toClubId: '',

        scope: '', // external | internal
        levelDirection: '', // up | lateral | down | unknown
        timing: '',
        effectiveAt: null,

        updatedAt: null,
      },
    },

    transfersOutById: {
      '<movementId>': {
        movementId: '',
        playerId: '',

        fromTeamId: '',
        fromTeamSeasonDocumentId: '',
        fromClubId: '',

        toTeamId: '',
        toTeamSeasonDocumentId: '',
        toClubId: '',

        scope: '', // external | internal
        levelDirection: '', // up | lateral | down | unknown
        timing: '',
        effectiveAt: null,

        updatedAt: null,
      },
    },

    updatedAt: null,
  },

  // Canonical source for seasonal, Stats-derived scouting results.
  // Player Root remains canonical for long-lived/manual player state such as
  // primaryPosition, positionLayer and manualImmediacyDecision.
  scouting: {
    playersById: {
      '<playerId>': {
        // Team Page snapshots from Player Root.
        primaryPosition: '',
        positionLayer: '',

        primary: {
          profileId: '',
          strengthDepthPct: null,
          score: null,
          reliabilityLevel: '',
          warnings: [],
          teamGateMode: '',
        },

        secondary: {
          profileId: '',
          strengthDepthPct: null,
          score: null,
          reliabilityLevel: '',
          warnings: [],
        },

        professionalProfileIds: [],
        preliminaryProfileIds: [],
        profileDepthsById: {},
        combinationIds: [],

        scoutEffectiveImmediacyStatus: '',
        scoutPlayerInterestLevel: '',

        // Historical evidence for the current seasonal scouting result.
        evidence: {
          capturedAt: null,
          statsSnapshotKey: '',
          engineVersion: '',
          indicators: [],

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

          progression: {
            profileId: '',
            distancePct: null,
            trend: '',
          },
        },

        updatedAt: null,
      },
    },

    scoutProfilesSummary: {},
    updatedAt: null,
  },

  // Canonical seasonal manual values that belong to this Player + Team Season context.
  manual: {
    playersById: {
      '<playerId>': {
        playerUrl: '',

        // Seasonal manual distribution used by Player Season/UI when present.
        goalDistribution: {},

        updatedAt: null,
      },
    },

    updatedAt: null,
  },

  // Automatically derived system signals. These are not personal Tasks.
  teamTaskSignals: {
    offense: false,
    defense: false,
    updatedAt: null,
  },

  teamTaskAvailability: {
    availability: '',
    reason: '',
  },

  timestamps: {
    createdAt: null,
    updatedAt: null,
  },

  derivedFieldsNotPersisted: [
    'minutesPerGame',
    'goalsPer90',
  ],

  ownership: {
    identity: 'Team/season identity',
    competitionSnapshot: 'Projection from League + ClubProfile',
    roster: 'Roster flow',
    stats: 'Stats flow',
    movement: 'Roster/Movement flow',
    scouting: 'Stats-derived seasonal scouting canonical state',
    manual: 'Seasonal manual edit flow',
    teamTaskSignals: 'Automatically derived team logic',
    teamTaskAvailability: 'Automatically derived team logic',
  },

  writeModel: [
    'Projection targets are written by known ids without reading the projection first.',
    'Read-before-write is not a default requirement.',
    'Prepare reads canonical sources only when the current action needs an actual business decision.',
    'Roster history/previous season is read only when reconciliation, pending or movement decisions require it.',
    'After Approval, writes are deterministic field-path writes followed by fresh Audit.',
    'Movement uses movementId-keyed maps to make upsert/delete and retry deterministic.',
    'Player SearchIndex copies seasonal scouting evidence from Team Season; it must not recompute historical evidence with a newer engine.',
    'competitionSnapshot is refreshed only from its canonical owners and is never independently edited by Team flows.',
    'League Load refreshes competitionSnapshot only when the Team Season already exists.',
    'League Teams Clear and League Season Delete reset competitionSnapshot to its empty contract only on Team Seasons that already exist and were affected by the removed League table/season.',
    'Clearing competitionSnapshot must not modify roster, stats, movement, scouting, manual fields or Team Root state.',
  ],

  invariants: [
    'teamSeasonDocumentId equals {teamId}__{seasonId}.',
    'seasonId uses YYYY_YYYY form and is never derived ad hoc from seasonKey.',
    'playerId equals player__{birthYear}__{externalPlayerId}; externalPlayerId is required.',
    'playerDocumentId is intentionally not persisted because playerId is also the Player Root document id.',
    'primaryPosition and positionLayer are canonical on Player Root; Team Season stores Team Page snapshots only.',
    'Seasonal Stats-derived scouting results and their evidence are canonical in Team Season.',
    'Player SearchIndex and Player Season must copy/rebuild scouting views from Team Season rather than recompute them.',
    'Official table facts are canonical in League and appear here only under competitionSnapshot.',
    'teamUrl, clubLevel and clubStrengthLevel are snapshots and are not canonical in Team Season.',
    'lineClassification is derived from Stats and persists line only.',
    'pendingById is unresolved roster state and is not a resolved movement.',
    'transfersInById is the canonical Movement fact on the destination Team Season.',
    'arrivalHistoryById is a rebuildable view of the previous source Team Season, separate from the Movement fact and current-team scouting.',
    'An absent source Team Season permits sourceStatus missing; older transfers without arrivalHistoryById are not lifecycle errors.',
    'transfersOutById is a mirrored counterpart projection and must match the canonical transfersInById payload when the source Team Season exists.',
    'A missing source Team Season makes a missing transfersOut counterpart legal; writers must not create a Team Root or Team Season only to complete the counterpart.',
    'If canonical transfersIn and an existing transfersOut counterpart disagree, Audit reports the mismatch and the incoming fact wins for rebuild/migration.',
    'Player Season and ClubsCenter movement projections rebuild from the canonical incoming fact; counterpart rows are verification/navigation aids, not a second source of truth.',
    'teamTaskSignals and teamTaskAvailability are stored once at Team Season level.',
    'Personal Tasks are owned by the separate internal Tasks system and are not embedded here.',
    'notes are multi-season and belong to Team Root, not Team Season.',
  ],
};

export default TEAM_SEASON_DOCUMENT;
