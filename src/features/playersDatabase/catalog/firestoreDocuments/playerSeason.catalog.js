// src/features/playersDatabase/catalog/firestoreDocuments/playerSeason.catalog.js
// Canonical document contract.

export const PLAYER_SEASON_DOCUMENT = {
  collection: 'dbPlayerSeasons',
  documentId: 'playerSeason__{playerId}__{seasonId}',

  purpose: 'Rebuildable Player season projection for Player Page, keyed by team contexts within one season.',

  identity: {
    playerSeasonDocumentId: '',
    playerId: '',

    seasonId: '',   // Technical id in YYYY_YYYY form.
    seasonKey: '',  // Business/display value.
    seasonStatus: '',
  },

  teamsById: {
    '<teamId>': {
      teamSeasonDocumentId: '',

      clubId: '',
      leagueId: '',
      ageGroupId: '',
      teamSlot: null,

      roster: {
        rosterStatus: '',
        isYoungerAgeGroup: false,
        isOlderAgeGroup: false,
        numShirt: null,
      },

      stats: {
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
      },

      // Projection copied from canonical seasonal scouting in Team Season.
      scouting: {
        updatedAt: null,
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
        combinationIds: [],

        scoutEffectiveImmediacyStatus: '',
        scoutPlayerInterestLevel: '',

        // Copied evidence for the current seasonal scouting result.
        // Team Season remains canonical.
        evidence: {
          capturedAt: null,
          statsSnapshotKey: '',
          engineVersion: '',

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
      },

      // Projection from Team Season manual state.
      manual: {
        playerUrl: '',
        goalDistribution: {},
      },

      // Compact movement projection copied from canonical Team Season movement maps.
      movementsById: {
        '<movementId>': {
          movementId: '',

          // Relation of this movement to this Player Season team context.
          direction: '', // in | out

          scope: '', // external | internal
          levelDirection: '', // up | lateral | down | unknown
          timing: '',

          fromTeamId: '',
          fromTeamSeasonDocumentId: '',
          fromClubId: '',

          toTeamId: '',
          toTeamSeasonDocumentId: '',
          toClubId: '',

          effectiveAt: null,
          updatedAt: null,
        },
      },

      updatedAt: null,
    },
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
    canonicalSource: 'Player Root + Team Season',
    playerSeason: 'Rebuildable Player Page / season-history projection',
  },

  writeModel: [
    'Player Season is a projection and is never the canonical source for team-season facts.',
    'Build identity/long-lived player data from Player Root and team-season facts from Team Season.',
    'Update only teamsById.{teamId} for the affected team context.',
    'Do not rewrite all teamsById when one team context changes.',
    'Projection writes are deterministic after Approved State.',
    'Read-before-write is not a default requirement for this projection.',
    'Scouting evidence is copied from Team Season and must not be recomputed with a newer scouting engine.',
    'Movement is copied from Team Season movement maps so Player Page can render season history without resolving movement from another collection.',
  ],

  invariants: [
    'current/history are removed.',
    'Player Season can be fully rebuilt from Player Root and Team Season.',
    'primaryPosition and positionLayer are not duplicated here; Player Root is canonical.',
    'manualImmediacyDecision is not duplicated here; Player Root is canonical.',
    'notes are not duplicated here; Player Root is canonical.',
    'playerReview is intentionally not persisted here as a second manual source.',
    'playerUrl and goalDistribution are canonical in Team Season manual state and only projected here.',
    'Seasonal scouting and scouting evidence are canonical in Team Season and only projected here.',
    'Movement facts are canonical in Team Season and only projected here.',
    'seasonId uses YYYY_YYYY form and is never built from seasonKey.',
    'playerSeasonDocumentId equals playerSeason__{playerId}__{seasonId}.',
    'playerId equals player__{birthYear}__{externalPlayerId}; externalPlayerId is required.',
  ],
};

export default PLAYER_SEASON_DOCUMENT;
