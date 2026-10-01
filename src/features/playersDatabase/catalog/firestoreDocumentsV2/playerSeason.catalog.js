// src/features/playersDatabase/catalog/firestoreDocuments/playerSeason.catalog.js

export const PLAYER_SEASON_DOCUMENT = {
  collection: 'dbPlayerSeasons',
  documentId: 'playerSeasonDocumentId',

  purpose: 'Rebuildable season projection for Player Page, keyed by team contexts within one season.',

  identity: {
    playerSeasonDocumentId: '',
    playerId: '',
    seasonId: '',
    seasonKey: '',
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
        playerStats: {},
        lineClassification: {
          line: '',
        },
      },

      scouting: {
        primaryScoutProfileId: '',
        primaryScoutProfileStrengthDepthPct: null,
        professionalScoutProfileIds: [],
        preliminaryScoutProfileIds: [],
        scoutEffectiveImmediacyStatus: '',
        scoutPlayerInterestLevel: '',
      },

      manual: {
        playerUrl: '',
        goalDistribution: null,
        review: {},
      },

      movementsById: {
        '<movementId>': {
          direction: '',
          timing: '',
          fromTeamId: '',
          toTeamId: '',
          fromClubId: '',
          toClubId: '',
          effectiveAt: null,
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
    playerSeason: 'Projection for Player Page and season history',
  },

  writeModel: [
    'Player Season is a projection and is never the canonical source for team-season facts.',
    'Update only teamsById.{teamId} for the affected team context.',
    'Do not rewrite all teamsById when one team context changes.',
    'Projection writes should be deterministic after Approved State.',
    'Read-before-write is not a default requirement for this projection.',
  ],

  invariants: [
    'current/history are removed.',
    'Player Season can be rebuilt from Player Root and Team Season sources.',
    'primaryPosition and positionLayer are not duplicated here; Player Root is the source.',
    'manualImmediacyDecision is not duplicated here; Player Root is the source.',
    'notes are not duplicated here; Player Root is the source.',
    'playerUrl and goalDistribution are season/team scoped.',
    'movementIds alone are not used because they are not independently resolvable without another canonical collection.',
    'movement snapshots keep Player Page independent from Team Season reads.',
    'seasonId is technical and must not be built ad hoc from seasonKey.',
  ],
};

export default PLAYER_SEASON_DOCUMENT;
