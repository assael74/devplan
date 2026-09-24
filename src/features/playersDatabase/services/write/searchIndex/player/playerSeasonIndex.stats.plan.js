import {
  collection,
  query,
  where,
} from 'firebase/firestore'
import { trackedGetDocs } from '../../../../../../services/firestore/usage/index.js'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { normalizeComparableValue } from '../../../shared/valueComparison.js'
import {
  buildSeasonKey,
  clean,
} from '../../leagues/leagueDoc.js'
import { buildPlayerSeasonScope } from '../../shared/playerSeasonScope.js'
import {
  buildPlayerSeasonIndexLookup,
  buildPlayerSeasonIndexScope,
  findExistingPlayerSeasonIndexDoc,
  hasCompletePlayerSeasonIndexIdentity,
  isSamePlayerSeasonIndexContext,
} from './playerSeasonIndex.identity.js'
import {
  buildPlayerSeasonStatsDuplicate,
  buildPlayerSeasonStatsFailure,
  buildPlayerSeasonStatsMutation,
} from './playerSeasonIndex.stats.model.js'

const PROTECTED_PLAYER_SEASON_INDEX_FIELDS = new Set([
  'aliases',
  'notes',
  'playerUrl',
  'updatedAt',
])

const readSearchIndexes = queryRef => trackedGetDocs(queryRef, {
  feature: 'playersDatabase',
  collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
  action: 'playerSeasonIndex-stats-plan',
  operationSubtype: 'planning-query',
})

const isMutationDataUnchanged = ({
  existingData = {},
  mutationData = {},
} = {}) => (
  Object.keys(mutationData).every(key => (
    JSON.stringify(normalizeComparableValue(existingData[key])) ===
    JSON.stringify(normalizeComparableValue(mutationData[key]))
  ))
)

const buildOwnedPatch = mutationData => Object.fromEntries(
  Object.entries(mutationData || {}).filter(([key]) => (
    !PROTECTED_PLAYER_SEASON_INDEX_FIELDS.has(key)
  ))
)

export async function preparePlayerSeasonSearchIndexStatsPlan({
  league = {},
  season = {},
  team = {},
  target = 'current',
  players = [],
  sourceRevision = '',
} = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const normalizedSeason = {
    ...season,
    seasonId,
    seasonKey,
    leagueId,
  }
  const teamScope = buildPlayerSeasonScope({
    season: normalizedSeason,
    team,
  })
  const indexScope = buildPlayerSeasonIndexScope({
    league,
    season: normalizedSeason,
    team,
  })
  const teamId = teamScope.birthTeamId

  if (!teamId || !seasonKey) {
    return {
      planType: 'playerSeasonSearchIndexStatsPlan',
      planVersion: 1,
      sourceRevision: clean(sourceRevision),
      operations: [],
      failures: [],
      duplicates: [],
      snapshotRows: [],
      expectedDocumentIds: [],
      expectedCount: 0,
    }
  }

  const safePlayers = (Array.isArray(players) ? players : [])
    .filter(player => clean(
      player.fullName ||
      player.matchedPlayerName ||
      player.externalPlayerId ||
      player.playerId
    ))
  const rowsQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('birthTeamId', '==', teamId),
    where('seasonKey', '==', seasonKey),
    where('entityType', '==', 'playerSeason')
  )
  const snapshot = await readSearchIndexes(rowsQuery)
  const existingDocs = snapshot.docs.filter(playerDoc => (
    isSamePlayerSeasonIndexContext(playerDoc.data() || {}, indexScope)
  ))
  const existingLookup = buildPlayerSeasonIndexLookup(existingDocs)
  const operations = []
  const failures = []
  const duplicates = []
  const snapshotRows = []

  safePlayers.forEach(player => {
    const match = findExistingPlayerSeasonIndexDoc({
      lookup: existingLookup,
      player,
      season: normalizedSeason,
      team,
    })
    const existingDoc = match.snapshot

    if (!hasCompletePlayerSeasonIndexIdentity(match.identity)) {
      failures.push(buildPlayerSeasonStatsFailure({
        identity: match.identity,
        player,
      }))
      return
    }

    if (match.duplicateSnapshots.length) {
      duplicates.push(buildPlayerSeasonStatsDuplicate({
        identity: match.identity,
        existingDoc,
        duplicateSnapshots: match.duplicateSnapshots,
      }))
    }

    const mutation = buildPlayerSeasonStatsMutation({
      league,
      season: normalizedSeason,
      team,
      target,
      player,
      existingDoc,
      teamScope,
      leagueId,
      seasonId,
      seasonKey,
    })

    if (mutation.type === 'skip') return
    if (mutation.snapshotAudit) snapshotRows.push(mutation.snapshotAudit)

    const documentId = clean(mutation.ref?.id || mutation.id)
    if (!documentId) return

    if (mutation.type === 'delete') {
      operations.push({
        operationType: 'playerSeasonIndex',
        operationId: `playerSeasonIndex__${documentId}__${clean(sourceRevision)}`,
        sourceRevision: clean(sourceRevision),
        documentId,
        action: 'delete',
        created: false,
        changed: true,
        patch: {},
      })
      return
    }

    const patch = buildOwnedPatch(mutation.data)
    const existingData = existingDoc?.data?.() || {}
    const changed = !existingDoc || !isMutationDataUnchanged({
      existingData,
      mutationData: patch,
    })

    operations.push({
      operationType: 'playerSeasonIndex',
      operationId: `playerSeasonIndex__${documentId}__${clean(sourceRevision)}`,
      sourceRevision: clean(sourceRevision),
      documentId,
      action: 'set',
      created: !existingDoc,
      changed,
      patch,
    })
  })

  const expectedDocumentIds = operations
    .filter(operation => operation.action === 'set')
    .map(operation => clean(operation.documentId))
    .filter(Boolean)

  return {
    planType: 'playerSeasonSearchIndexStatsPlan',
    planVersion: 1,
    sourceRevision: clean(sourceRevision),
    teamId,
    seasonKey,
    operations,
    failures,
    duplicates,
    snapshotRows,
    expectedDocumentIds,
    expectedCount: expectedDocumentIds.length,
    protectedFields: [...PROTECTED_PLAYER_SEASON_INDEX_FIELDS],
  }
}
