// src/features/playersDatabase/services/write/readiness/firestoreFirstWrite.contract.js

export const PLAYERS_DATABASE_FIRST_WRITE_SCENARIOS = {
  rosterFirst: {
    action: 'pasteTeamPlayers',
    required: {
      teamDocument: [
        'birthTeamId',
        'current/history season row',
        'teamPlayers',
        'playersCount',
        'scoutProfilesSummary',
        'compact teamBalance summary snapshot',
      ],
      teamSearchIndex: [
        'entityType',
        'birthTeamId',
        'seasonId',
        'seasonKey',
        'playersCount',
        'teamBalance projection when available',
      ],
      playerSearchIndex: [
        'identity/context for every eligible roster row',
      ],
    },
    deferred: [
      'Team Performance projection until League projection runs.',
      'Player Document until tracking/profile eligibility exists.',
    ],
  },
  statsFirst: {
    action: 'pasteTeamPlayerStats',
    required: {
      teamDocument: [
        'birthTeamId',
        'current/history season row',
        'teamPlayers with stats',
        'playersCount',
        'scoutProfilesSummary',
        'compact teamBalance summary snapshot',
      ],
      teamSearchIndex: [
        'entityType',
        'birthTeamId',
        'seasonId',
        'seasonKey',
        'playersCount',
        'scoutProfilesSummary',
        'teamBalance projection',
      ],
      playerSearchIndex: [
        'identity/context/stats projection for every eligible player row',
      ],
      playerDocument: [
        'Only players eligible for persisted tracking/profile state.',
      ],
    },
    deferred: [
      'Team Performance projection until League projection runs.',
    ],
  },
  leagueFirst: {
    action: 'pasteLeagueTable',
    required: {
      leagueDocument: [
        'canonical root metadata',
        'season tableRank',
      ],
      teamSearchIndex: [
        'identity/league/season context',
        'raw/projected team statistics',
        'Team Performance V5 projection',
      ],
    },
    deferred: [
      'playersCount/scoutProfilesSummary/Team Balance until Team-side flow runs.',
      'Team Document until roster/stats/team-side write runs.',
      'Player Documents/SearchIndexes until player-side data exists.',
    ],
  },
}

export const PLAYERS_DATABASE_FIRST_WRITE_INVARIANTS = [
  'No flow may require another first-write scenario to have run previously in order to complete successfully.',
  'A SearchIndex row may be projection-partial across ownership domains, but missing fields must be treated as unknown rather than fabricated values.',
  'League Document remains the source of truth for league/team performance statistics.',
  'Team Document remains the source of truth for teamPlayers and Team Balance inputs.',
  'Player Document is created only when the player satisfies the active persistence/tracking policy.',
  'SearchIndex writers may merge ownership domains but must not overwrite fields owned by another domain.',
  'No optimization may add a Firestore read solely to avoid a write unless the read has an independent correctness purpose.',
]
