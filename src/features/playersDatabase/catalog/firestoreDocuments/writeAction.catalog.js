// src/features/playersDatabase/catalog/firestoreDocuments/writeAction.catalog.js

export const WRITE_ACTION_DOCUMENT = {
  collection: 'dbWriteActions',
  documentId: 'writeActionId',

  purpose: 'Small operational receipt for one PlayersDatabase write action, with durable UI identity and minimal progress evidence.',

  writeActionId: '',
  actionType: '',
  targetKey: '',

  status: 'open', // open | closed
  executionStatus: 'running', // running | failed | succeeded
  recoveryRequired: false,

  // pending | confirmed | failed_or_unknown
  canonicalOutcome: 'pending',

  target: {
    domain: '', // clubs | league | roster | stats

    leagueId: '',
    clubId: '',
    teamId: '',
    seasonId: '',

    // Used only when the action itself targets one specific player.
    playerId: '',
  },

  // Historical UI snapshot.
  // These values are intentionally not synchronized after receipt creation.
  display: {
    actionLabel: '',
    receiptLabel: '',
    targetLabel: '',

    leagueName: '',
    clubName: '',
    teamName: '',

    seasonKey: '',
    birthYear: null,

    playerName: '',
    playersCount: null,
    playerNamesPreview: [],
  },

  // Only successfully completed stages are persisted.
  // Pending stages are derived from actionType.
  progress: {
    completedByStage: {},

    failed: {
      stageId: '',
      failedAt: null,
      errorCode: '',
      targetType: '',
      documentId: '',
    },
  },

  audit: {
    ranAt: null,
    coverage: '', // partial | complete
    findingsCount: null,
    checkedDomains: [],
  },

  timestamps: {
    createdAt: null,
    updatedAt: null,
    completedAt: null,
  },

  // Target-architecture stage ids only.
  // These are UI/diagnostic progress boundaries, not recovery cursors.
  stageContracts: {
    leagueOpen: [
      'canonical',
      'teamSeasonCompetitionSnapshots',
      'leaguesCenter',
      'clubsCenter',
      'audit',
    ],

    leagueLoad: [
      'canonical',
      'teamSeasonCompetitionSnapshots',
      'leaguesCenter',
      'clubsCenter',
      'audit',
    ],

    leagueTeamsClear: [
      'canonical',
      'teamSeasonCompetitionSnapshots',
      'leaguesCenter',
      'clubsCenter',
      'audit',
    ],

    leagueSeasonDelete: [
      'canonical',
      'teamSeasonCompetitionSnapshots',
      'leaguesCenter',
      'clubsCenter',
      'audit',
    ],

    rosterLoad: [
      'canonical',
      'counterparts',
      'playerSeasons',
      'playerSearchIndexes',
      'leagueProjection',
      'leaguesCenter',
      'clubsCenter',
      'audit',
    ],

    rosterClear: [
      'canonical',
      'playerSeasons',
      'playerSearchIndexes',
      'leagueProjection',
      'leaguesCenter',
      'clubsCenter',
      'audit',
    ],

    statsLoad: [
      'canonical',
      'counterparts',
      'playerRoots',
      'playerSeasons',
      'playerSearchIndexes',
      'leagueProjection',
      'leaguesCenter',
      'clubsCenter',
      'audit',
    ],

    statsClear: [
      'canonical',
      'playerRoots',
      'playerSeasons',
      'playerSearchIndexes',
      'leagueProjection',
      'leaguesCenter',
      'clubsCenter',
      'audit',
    ],

    clubsBootstrap: [
      'clubProfilesAndDirectory',
      'audit',
    ],
  },

  writeModel: [
    'League Load validates every required ClubProfile during VALIDATE/BUILD before receipt creation; a missing ClubProfile blocks Approved State.',
    'League never creates a partial ClubProfile and never uses ClubsDirectory as a canonical fallback.',
    'teamSeasonCompetitionSnapshots updates only competitionSnapshot on Team Seasons that already exist; League never creates Team Root or Team Season for this projection.',
    'The receipt must be created before the business write starts.',
    'If receipt creation fails, the business write must not start.',
    'The receipt is operational traceability and UI history, never a source of business truth.',
    'Approved State and current canonical state determine what retry is allowed to write.',
    'Writers must not reconstruct business decisions from receipt progress.',
    'The receipt stays small and must not contain full approved payloads, full canonical snapshots or full execution logs.',
    'target stores canonical ids; display stores historical UI labels and names as snapshots.',
    'completedByStage contains only stages that completed successfully.',
    'Pending stages are derived from the actionType stage contract and are not persisted in the receipt.',
    'Retry re-reads canonical sources, rebuilds Approved State and re-runs required idempotent stages using the same logical receipt.',
    'After canonical state is confirmed as written, failure keeps the receipt open and recoveryRequired remains true until a complete clean audit closes it.',
    'When a post-receipt stage throws, the surfaced error should include receiptId whenever that id is known so the UI can expose the recovery action.',
    'Closed receipts may be hard-deleted only when recoveryRequired is false.',
  ],

  invariants: [
    'actionType is canonical; labels are display snapshots only.',
    'targetKey is deterministic for the logical action target and uses technical seasonId, never seasonKey.',
    'Only one open receipt for the same protected domain/target is allowed by the write flow.',
    'canonicalOutcome is not inferred from timestamps.',
    'completedByStage is evidence for UI and diagnosis only; it is not a recovery cursor.',
    'A failed stage may have partially written data; only canonical/projection reads and Audit determine the actual state.',
    'currentStage is intentionally not persisted.',
    'Skipped stages are intentionally not persisted.',
    'Retry/attempt history is intentionally not persisted.',
    'Team-wide Roster/Stats receipts do not store full playerIds or playerNames arrays.',
    'playerNamesPreview is limited to a small UI preview such as 3-5 names.',
    'A single-player action may store target.playerId and display.playerName.',
    'recoveryRequired may return to false only after a complete clean Audit and receipt close.',
    'No stage id refers to Team SearchIndex, ClubSeasonIdentityIndex, LeaguesMaster or ClubsMaster.',
    'The receipt does not store locks, leases, queues, background jobs, attempt tokens or concurrency metadata.',
    'Persistence timestamps are Firestore Timestamps.',
  ],
};

export default WRITE_ACTION_DOCUMENT;
