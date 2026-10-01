// src/features/playersDatabase/catalog/firestoreDocuments/teamRoot.catalog.js

export const TEAM_ROOT_DOCUMENT = {
  collection: 'dbBirthTeams',
  documentId: 'teamId',

  purpose: 'Canonical multi-season identity for one club birth-year team slot.',

  identity: {
    teamId: '',
    clubId: '',
    birthYear: null,
    teamSlot: null,
  },

  notes: '',

  // Keyed by technical seasonId, e.g. 2025_2026.
  seasonRefsById: {
    '<seasonId>': {
      seasonKey: '', // Display/business value, e.g. 25/26.
      teamSeasonDocumentId: '',
      leagueId: '',
      ageGroupId: '',
      seasonStatus: '',
    },
  },

  timestamps: {
    createdAt: null,
    updatedAt: null,
  },

  invariants: [
    'teamId is the canonical Team Root document id.',
    'Team Root identity is stable across seasons.',
    'clubId + birthYear + teamSlot define the logical team identity.',
    'Season-specific URL, externalTeamId, league and age-group details belong to Team Season.',
    'notes are multi-season notes for the birth-year team.',
    'seasonRefsById keys are technical seasonId values and are safe Firestore map keys.',
  ],
};

export default TEAM_ROOT_DOCUMENT;
