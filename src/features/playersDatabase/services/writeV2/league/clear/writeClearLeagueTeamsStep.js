// src/features/playersDatabase/services/writeV2/league/clear/writeClearLeagueTeamsStep.js

import { doc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../../services/firestore/usage/index.js'
import { assertClearLeagueApprovedState } from '../../../../domain/leagueV2/clear/clearLeagueTeamsApprovedState.builder.js'
import { sameValue, failClearLeague } from '../../../../domain/leagueV2/clear/leagueTeamsClearedState.builder.js'
import { CLEAR_LEAGUE_COLLECTIONS, readClearLeagueDocument } from './readClearLeagueTeams.js'
import { invalidateLeagueImportCacheV2 } from '../invalidateLeagueImportCache.js'

const afterPatch = (before, patch) => ({ ...before, ...patch })
const withoutTime = value => value && Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'updatedAt'))
const matches = (left, right) => sameValue(withoutTime(left), withoutTime(right))

const writeClearLeagueTeamPair = async operation => trackedRunTransaction(db, async transaction => {
  const seasonRef = doc(db, CLEAR_LEAGUE_COLLECTIONS.team, operation.docId)
  const rootRef = doc(db, CLEAR_LEAGUE_COLLECTIONS.root, operation.rootId)
  const season = await transaction.get(seasonRef)
  const root = await transaction.get(rootRef)
  if (!root.exists()) failClearLeague('CLEAR_LEAGUE_CHANGED', 'Root disappeared')
  const expectedRoot = afterPatch(operation.rootBefore, operation.rootPatch)
  if (!season.exists() && matches(root.data(), expectedRoot)) return 'skipped'
  if (!season.exists() || !matches(season.data(), operation.before) || !matches(root.data(), operation.rootBefore)) {
    failClearLeague('CLEAR_LEAGUE_CHANGED', 'Team sources changed; prepare again')
  }
  transaction.delete(seasonRef)
  transaction.update(rootRef, { ...operation.rootPatch, updatedAt: serverTimestamp() })
  return 'written'
}, {
  feature: 'playersDatabase', action: 'clear-league-team-pair', collection: CLEAR_LEAGUE_COLLECTIONS.team,
})

export const writeClearLeagueTeamsStep = async ({ approvedState, step, onProgress }) => {
  assertClearLeagueApprovedState(approvedState)
  const counts = { written: 0, skipped: 0, failed: 0 }
  for (const operation of approvedState.operations.filter(item => item.kind === step)) {
    try {
      if (step === 'team') {
        counts[await writeClearLeagueTeamPair(operation)] += 1
      } else {
        const actual = await readClearLeagueDocument(step, operation.docId)
        const expected = operation.patch === null ? null : afterPatch(operation.before, operation.patch)
        if (matches(actual, expected)) {
          counts.skipped += 1
        } else {
          if (!matches(actual, operation.before)) failClearLeague('CLEAR_LEAGUE_CHANGED', 'Source changed; prepare again')
          const reference = doc(db, CLEAR_LEAGUE_COLLECTIONS[step], operation.docId)
          if (operation.patch === null) await deleteDoc(reference)
          else await updateDoc(reference, { ...operation.patch, updatedAt: serverTimestamp() })
          counts.written += 1
        }
      }
      onProgress?.({ ...counts })
    } catch (error) {
      counts.failed += 1
      onProgress?.({ ...counts })
      error.failedTarget = { targetType: step, documentId: operation.docId }
      throw error
    } finally {
      // A rejected write may have reached the server. Invalidate on both paths,
      // before Receipt reporting or Audit can fail.
      invalidateLeagueImportCacheV2({
        ...approvedState.identity,
        rows: approvedState.operations.filter(item => item.kind === 'team')
          .map(item => ({ birthTeamDocumentId: item.rootId })),
      })
    }
  }
  return counts
}
