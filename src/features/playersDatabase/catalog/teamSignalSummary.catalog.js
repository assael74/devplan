// src/features/playersDatabase/catalog/teamSignalSummary.catalog.js

// Shared embedded shape; this is not a Firestore collection or document.
export const TEAM_SIGNAL_SUMMARY_SCHEMA = {
  modelVersion: 'team-signals-v1',
  calibrationVersion: 'team-signals-calibration-v1',
  computedAt: null,
  familiesById: {
    performance: { level: null, availability: 'unavailable' },
    'roster-balance': { level: null, availability: 'unavailable' },
    'year-movements': { level: null, availability: 'unavailable' },
    'future-competition': { level: null, availability: 'unavailable' },
    'club-gap': { level: null, availability: 'unavailable' },
  },
}
