// src/features/playersDatabase/catalog/firestoreDocuments/clubsDirectory.catalog.js
// Canonical document contract.

export const CLUBS_DIRECTORY_DOCUMENT = {
  collection: 'dbClubsDirectory',
  documentId: 'all',

  purpose: 'Global compact club directory loaded once into the PlayersDatabase Read Store.',

  clubsById: {
    '<clubId>': {
      names: {
        official: '',
        display: '',
        short: '',
      },

      aliases: [],
      searchAliases: [],

      clubUrl: '',

      clubLevel: null,
      clubStrengthLevel: null,

      updatedAt: null,
    },
  },

  updatedAt: null,

  writeModel: [
    'This document is a global read projection and not the canonical Club source of truth.',
    'ClubProfile is the canonical owner of club names, aliases, URL and manual club levels.',
    'A single club entry is updated by direct field path: clubsById.{clubId}.',
    'Do not read-modify-write the full clubsById map when one ClubProfile changes.',
    'The document is loaded once into the central Read Store and reused across PlayersDatabase pages.',
    'The projection is fully rebuildable from ClubProfile documents during migration or repair.',
  ],

  invariants: [
    'clubId is the clubsById map key and is not duplicated inside the club value.',
    'externalClubId is intentionally not persisted in this global directory.',
    'No seasons, teams, birth years, league relations or competition paths are stored here.',
    'No roster, stats, scouting, transfers, task signals or performance data are stored here.',
    'No current/history structure is stored here.',
    'aliases and searchAliases are compact identity/search values only.',
    'clubLevel and clubStrengthLevel are compact snapshots from ClubProfile.',
    'Changing this projection never changes canonical ClubProfile data.',
  ],
};

export default CLUBS_DIRECTORY_DOCUMENT;
