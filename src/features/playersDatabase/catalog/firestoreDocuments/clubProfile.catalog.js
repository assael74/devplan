// src/features/playersDatabase/catalog/firestoreDocuments/clubProfile.catalog.js
// Canonical document contract.

export const CLUB_PROFILE_DOCUMENT = {
  collection: 'dbClubs',
  documentId: '{clubId}',

  purpose: 'Canonical Club profile with stable identity and long-lived manual club metadata.',

  clubId: '',

  externalClubId: '',
  clubUrl: '',

  names: {
    official: '',
    display: '',
    short: '',
    source: '',
  },

  aliases: [],
  searchAliases: [],

  clubLevel: null,
  clubStrengthLevel: null,

  timestamps: {
    createdAt: null,
    updatedAt: null,
  },

  writeModel: [
    'ClubProfile is the canonical source for club identity, names, aliases, URL and manual club levels.',
    'ClubsDirectory and ClubsCenter are projections rebuilt from ClubProfile plus seasonal canonical sources.',
    'A ClubProfile write must not write seasonal teams, League facts, roster, stats, scouting, movement or competition paths.',
    'Projection updates may follow a successful ClubProfile write but must not change ClubProfile ownership.',
  ],

  invariants: [
    'clubId is the Firestore document id.',
    'externalClubId may be stored canonically here even though it is intentionally omitted from ClubsDirectory.',
    'names.official/display/short and aliases/searchAliases are canonical here.',
    'clubUrl is canonical here.',
    'clubLevel and clubStrengthLevel are canonical manual club-level facts here.',
    'No seasons, teams, birth years or league relations are stored here.',
    'No roster, stats, scouting, task signals, transfers or performance data are stored here.',
    'No competitionPaths are stored here.',
    'No current/history structure is stored here.',
    'Persistence timestamps are Firestore Timestamps.',
  ],
};

export default CLUB_PROFILE_DOCUMENT;
