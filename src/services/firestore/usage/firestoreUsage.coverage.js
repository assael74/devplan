// src/services/firestore/usage/firestoreUsage.coverage.js

const operation = ({
  id,
  feature,
  collection,
  type,
  instrumented = false,
  source,
}) => ({
  id,
  feature,
  collection,
  type,
  instrumented,
  source,
})

export const FIRESTORE_USAGE_COVERAGE = [
  operation({ id: 'coreData.shorts.listeners', feature: 'coreData', collection: '*Shorts', type: 'listener', instrumented: true, source: 'services/firestore/shorts/shorts.subscribe.js' }),
  operation({ id: 'coreData.shorts.ensure', feature: 'coreData', collection: 'playersShorts/abilitiesShorts', type: 'transaction', instrumented: true, source: 'services/firestore/shorts/shortsEnsure.js' }),
  operation({ id: 'hub.gameStats.read', feature: 'hub', collection: 'gameStatsShorts', type: 'document-read', instrumented: true, source: 'services/firestore/shorts/gameStats/getGameStatsDoc.js' }),
  operation({ id: 'hub.gameStats.transactions', feature: 'hub', collection: 'gameStatsShorts/*Shorts', type: 'transaction', instrumented: true, source: 'services/firestore/shorts/gameStats' }),
  operation({ id: 'hub.trainings.transactions', feature: 'hub', collection: 'teamsShorts', type: 'transaction', instrumented: true, source: 'services/firestore/shorts/trainings' }),
  operation({ id: 'hub.abilities.transactions', feature: 'hub', collection: 'abilitiesShorts', type: 'transaction', instrumented: true, source: 'services/firestore/shorts/abilities/abilitiesUpsertHistory.js' }),

  operation({ id: 'playersDatabase.search.count', feature: 'playersDatabase', collection: 'dbSearchIndexes', type: 'aggregation', instrumented: true, source: 'features/playersDatabase/services/read/searchPage.read.js' }),
  operation({ id: 'playersDatabase.search.rows', feature: 'playersDatabase', collection: 'dbSearchIndexes', type: 'query', instrumented: true, source: 'features/playersDatabase/services/read/searchPage.read.js' }),
  operation({ id: 'playersDatabase.leagues.list', feature: 'playersDatabase', collection: 'dbLeagues', type: 'query', instrumented: true, source: 'features/playersDatabase/services/read/league.js' }),
  operation({ id: 'playersDatabase.league.read', feature: 'playersDatabase', collection: 'dbLeagues', type: 'document-read', instrumented: true, source: 'features/playersDatabase/services/read/league.js' }),
  operation({ id: 'playersDatabase.team.read', feature: 'playersDatabase', collection: 'dbBirthTeams', type: 'document-read', instrumented: true, source: 'features/playersDatabase/services/read/team.js' }),
  operation({ id: 'playersDatabase.player.read', feature: 'playersDatabase', collection: 'dbPlayers', type: 'document-read', instrumented: true, source: 'features/playersDatabase/services/read/playerPage.read.js' }),
  operation({ id: 'playersDatabase.player.fallback', feature: 'playersDatabase', collection: 'dbBirthTeams', type: 'query', instrumented: true, source: 'features/playersDatabase/services/read/playerPage.read.js' }),
  operation({ id: 'playersDatabase.leaguesMaster.read', feature: 'playersDatabase', collection: 'dbLeaguesMaster', type: 'document-read', instrumented: true, source: 'features/playersDatabase/services/read/leaguesMaster.read.js' }),
  operation({ id: 'playersDatabase.favorites.read', feature: 'playersDatabase', collection: 'dbFavorites', type: 'document-read', instrumented: true, source: 'features/playersDatabase/services/read/favorites.read.js' }),

  operation({ id: 'playersDatabase.maintenance', feature: 'playersDatabase', collection: 'dbSearchIndexes', type: 'read-write', instrumented: true, source: 'features/playersDatabase/services/write/searchIndex' }),
  operation({ id: 'playersDatabase.entities.write', feature: 'playersDatabase', collection: 'dbPlayers/dbBirthTeams/dbLeagues', type: 'transaction', instrumented: true, source: 'features/playersDatabase/services/write' }),
  operation({ id: 'playersDatabase.favorites.write', feature: 'playersDatabase', collection: 'dbFavorites', type: 'transaction', instrumented: true, source: 'features/playersDatabase/services/write/favorites' }),
  operation({ id: 'reports.public', feature: 'reports', collection: 'publicReports', type: 'read-write', instrumented: true, source: 'features/reports/service/firestore' }),
  operation({ id: 'reports.versions', feature: 'reports', collection: 'publicReports/versions', type: 'query-read-write', instrumented: true, source: 'features/reports/service/firestore' }),
  operation({ id: 'reports.index', feature: 'reports', collection: 'publicReportsIndexByType', type: 'query-transaction', instrumented: true, source: 'features/reports/service/firestore/publicReportIndex.firestore.js' }),
  operation({ id: 'notifications.user', feature: 'notifications', collection: 'users/*/notifications', type: 'listener-read-write', instrumented: true, source: 'services/firestore/notifications.firestore.js' }),
]

export function getFirestoreUsageCoverage() {
  const total = FIRESTORE_USAGE_COVERAGE.length
  const instrumented = FIRESTORE_USAGE_COVERAGE.filter(item => item.instrumented).length

  return {
    total,
    instrumented,
    missing: total - instrumented,
    rate: total ? Math.round((instrumented / total) * 100) : 0,
    scope: 'registered-processes',
    isDiscoveryComplete: false,
    items: FIRESTORE_USAGE_COVERAGE,
  }
}
