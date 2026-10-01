// src/features/playersDatabase/catalog/firestoreDocuments/clubProfile.catalog.js
// Canonical Club profile: stable/manual club identity only.
// No seasons, teams, performance, roster, stats, transfers, task signals or competition projections.

export const CLUB_PROFILE_DOCUMENT_CATALOG = {
  docType: 'club_profile',

  // Repeated inside the document as an integrity check against the Firestore document ID.
  clubId: '',
  externalClubId: '',
  clubUrl: '',

  names: {
    official: '',
    source: '',
    display: '',
    short: '',
  },

  aliases: [],
  searchAliases: [],

  clubLevel: null,
  clubStrengthLevel: null,

  createdAt: null,
  updatedAt: null,
}
