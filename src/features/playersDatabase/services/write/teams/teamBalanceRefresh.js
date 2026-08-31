import { collection, doc, limit, query, serverTimestamp, where } from 'firebase/firestore'
import { createTrackedWriteBatch, trackedGetDocs, trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { buildTeamSeasonDocumentId } from '../../../model/teamIdentity.model.js'
import { clean } from '../leagues/leagueDoc.js'
import { buildTeamBalanceSearchIndexProjection } from '../searchIndex/team/teamSeasonIndex.balance.js'
import { commitBatchWhenNeeded } from '../searchIndex/shared/searchIndexBatch.write.js'
import { inspectTeamBalanceFreshness, withTeamBalanceSnapshot } from './teamBalanceSnapshot.js'
import { buildTeamSeasonDocumentData, teamSeasonDocRef } from './teamSeasonDoc.js'

const DEFAULT_REFRESH_LIMIT = 100
const MAX_REFRESH_LIMIT = 400
const toSafeLimit = value => Math.min(MAX_REFRESH_LIMIT, Math.max(1, Number(value) || DEFAULT_REFRESH_LIMIT))
const equal = (left, right) => JSON.stringify(left || null) === JSON.stringify(right || null)

const staleRows = snapshot => snapshot.docs
  .map(item => ({ id: item.id, ...(item.data() || {}) }))
  .filter(row => clean(row.entityType) === 'birthTeamSeason')

const refreshOne = async indexRow => {
  const teamId = clean(indexRow.birthTeamDocumentId || indexRow.teamDocumentId || indexRow.birthTeamId || indexRow.teamId)
  const seasonKey = clean(indexRow.seasonKey || indexRow.seasonId)
  const teamSeasonDocumentId = buildTeamSeasonDocumentId(teamId, seasonKey)
  if (!teamSeasonDocumentId) return { skipped: { id: indexRow.id, reason: 'teamSeasonIdentityMissing' } }
  const ref = teamSeasonDocRef({ birthTeamDocumentId: teamId, seasonKey })
  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) return { skipped: { id: indexRow.id, reason: 'teamSeasonMissing' } }
    const current = snapshot.data() || {}
    const freshness = inspectTeamBalanceFreshness({ seasonDoc: current })
    const next = freshness.fresh ? current : withTeamBalanceSnapshot({
      seasonDoc: current,
      teamRoot: { id: teamId, birthTeamDocumentId: teamId },
    })
    const changed = !equal(current.teamBalance, next.teamBalance)
    const persisted = changed
      ? buildTeamSeasonDocumentData({ team: { birthTeamDocumentId: teamId }, season: current, seasonDoc: next, existingData: current })
      : current
    if (changed) transaction.set(ref, persisted)
    const balanceProjection = buildTeamBalanceSearchIndexProjection(persisted.teamBalance || null)
    return {
      teamSeasonDocumentId,
      teamUpdated: changed,
      recomputed: !freshness.fresh,
      indexPatch: {
        id: indexRow.id,
        teamSeasonDocumentId,
        sourceTarget: clean(persisted.seasonStatus) === 'completed' ? 'history' : 'current',
        balanceProjection,
      },
      skipped: null,
    }
  })
}

export async function refreshTeamBalancesByDependency({ fromDependencyKey = '', maxRows = DEFAULT_REFRESH_LIMIT } = {}) {
  const dependencyKey = clean(fromDependencyKey)
  if (!dependencyKey) throw new Error('Missing source Team Balance dependency key')
  const batchLimit = toSafeLimit(maxRows)
  const snapshot = await trackedGetDocs(query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('balanceDependencyKey', '==', dependencyKey), limit(batchLimit)
  ), { feature: 'playersDatabase', collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes, action: 'teamBalance-refresh-find-stale', operationSubtype: 'maintenance-query' })
  const rows = staleRows(snapshot)
  const results = []
  for (const row of rows) results.push(await refreshOne(row))
  const patches = results.map(result => result.indexPatch).filter(Boolean)
  const batch = createTrackedWriteBatch(db, { feature: 'playersDatabase', collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes, action: 'teamBalance-refresh-index', operationSubtype: 'maintenance-batch' })
  patches.forEach(item => batch.set(doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, item.id), { ...item.balanceProjection, teamSeasonDocumentId: item.teamSeasonDocumentId, sourceTarget: item.sourceTarget, updatedAt: serverTimestamp() }, { merge: true }))
  await commitBatchWhenNeeded({ batch, operationsCount: patches.length })
  const skippedRows = results.map(result => result.skipped).filter(Boolean)
  return {
    fromDependencyKey: dependencyKey, queriedRowsCount: snapshot.size, staleRowsCount: rows.length,
    teamDocumentsReadCount: rows.length, teamDocumentsRecomputedCount: results.filter(result => result.recomputed).length,
    teamDocumentsUpdatedCount: results.filter(result => result.teamUpdated).length,
    searchIndexRowsUpdatedCount: patches.length, skippedRowsCount: skippedRows.length, skippedRows,
    batchLimit, hasMore: snapshot.size >= batchLimit,
  }
}
