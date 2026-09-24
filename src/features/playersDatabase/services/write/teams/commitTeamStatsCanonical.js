import { doc, serverTimestamp } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { clean } from '../leagues/leagueDoc.js'
import { buildQueuedTeamStatsProjectionJob } from '../teamStatsProjectionJobs/index.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { teamDocRef } from './teamDoc.js'
import { teamSeasonDocRef } from './teamSeasonDoc.js'
import { buildStatsSourceFingerprint } from './statsPlanFingerprint.js'

const STATS_WRITE_ACTION_TYPE = 'pasteTeamPlayerStats'

const throwReceiptGuardError = (message, code) => {
  const error = new Error(message)
  error.code = code
  throw error
}

const assertStatsWriteActionLinkable = ({ receipt = {}, writeActionId = '' } = {}) => {
  if (clean(receipt.writeActionId) !== clean(writeActionId)) {
    throwReceiptGuardError('Write action receipt identity does not match', 'WRITE_ACTION_NOT_LINKABLE')
  }
  if (clean(receipt.actionType) !== STATS_WRITE_ACTION_TYPE) {
    throwReceiptGuardError('Write action receipt is not a stats import action', 'WRITE_ACTION_NOT_LINKABLE')
  }
  if (clean(receipt.status) !== 'in_progress') {
    throwReceiptGuardError('Write action receipt is not in progress', 'WRITE_ACTION_NOT_LINKABLE')
  }
  if (clean(receipt.projectionJobId) || clean(receipt.sourceRevision) || clean(receipt.projectionJobType)) {
    throwReceiptGuardError('Write action receipt is already linked to a projection job', 'WRITE_ACTION_ALREADY_LINKED')
  }
}

const throwStalePlan = source => {
  const error = new Error(`Approved stats plan is stale: ${source}`)
  error.code = 'STATS_IMPORT_PLAN_STALE'
  error.source = source
  throw error
}

const assertFingerprint = ({ expected = '', actual = null, source = '' } = {}) => {
  if (String(expected || '') === buildStatsSourceFingerprint(actual)) return
  throwStalePlan(source)
}

// Commits a canonical result that was already calculated by the CLIENT planner.
// The transaction validates the snapshots used by the plan; it does not rerun
// Stats, Movement, Balance or other business rules.
export async function commitTeamStatsCanonical({
  approvedPlan = null,
  projectionManifest = null,
  writeActionId = '',
} = {}) {
  const plan = approvedPlan || {}
  const commit = plan.canonicalCommit || null
  const teamId = clean(plan.birthTeamDocumentId || commit?.birthTeamDocumentId)
  const seasonKey = clean(plan.seasonKey || commit?.seasonKey)
  const sourceRevision = clean(plan.statsProjectionRevision)

  if (!commit || plan.planType !== 'approvedStatsCanonicalPlan') {
    throw new Error('Missing approved stats canonical plan')
  }
  if (!teamId) throw new Error('Missing birth team id')
  if (!seasonKey) throw new Error('Missing season key')
  if (!sourceRevision) throw new Error('Missing stats projection revision')
  if (!projectionManifest || typeof projectionManifest !== 'object') {
    throw new Error('Missing stats projection manifest')
  }
  if (clean(projectionManifest.sourceRevision) !== sourceRevision) {
    throw new Error('Stats projection manifest revision does not match canonical plan')
  }
  if (!clean(writeActionId)) throw new Error('Missing write action id for canonical stats commit')

  const seasonRef = teamSeasonDocRef({ birthTeamDocumentId: teamId, seasonKey })
  const rootRef = teamDocRef(teamId)
  const actionRef = doc(db, PLAYERS_DATABASE_COLLECTIONS.writeActions, clean(writeActionId))
  const previousSeasonKey = clean(plan.sourceFingerprints?.previousSeasonKey)
  const previousRef = previousSeasonKey
    ? teamSeasonDocRef({ birthTeamDocumentId: teamId, seasonKey: previousSeasonKey })
    : null

  return trackedRunTransaction(db, async transaction => {
    const [rootSnapshot, seasonSnapshot, actionSnapshot] = await Promise.all([
      transaction.get(rootRef),
      transaction.get(seasonRef),
      transaction.get(actionRef),
    ])
    if (!actionSnapshot.exists()) throw new Error('Write action receipt was not found')
    assertStatsWriteActionLinkable({
      receipt: actionSnapshot.data() || {},
      writeActionId,
    })

    const currentRoot = rootSnapshot.exists() ? rootSnapshot.data() || {} : null
    const currentSeason = seasonSnapshot.exists() ? seasonSnapshot.data() || {} : null
    const previousSnapshot = previousRef ? await transaction.get(previousRef) : null
    const previousSeason = previousSnapshot?.exists() ? previousSnapshot.data() || {} : null

    assertFingerprint({
      expected: plan.sourceFingerprints?.teamRoot,
      actual: currentRoot,
      source: 'teamRoot',
    })
    assertFingerprint({
      expected: plan.sourceFingerprints?.currentSeason,
      actual: currentSeason,
      source: 'currentSeason',
    })
    assertFingerprint({
      expected: plan.sourceFingerprints?.previousSeason,
      actual: previousSeason,
      source: 'previousSeason',
    })

    const projectionJob = buildQueuedTeamStatsProjectionJob({
      league: plan.league || {},
      season: { ...(plan.season || {}), seasonKey: commit.seasonKey },
      team: { ...(plan.team || {}), birthTeamDocumentId: commit.birthTeamDocumentId },
      teamSeasonDocumentId: commit.teamSeasonDocumentId,
      sourceRevision,
      writeActionId,
      projectionManifest,
    })
    const jobRef = doc(db, PLAYERS_DATABASE_COLLECTIONS.teamStatsProjectionJobs, projectionJob.id)

    if (!commit.writeSkipped) transaction.set(seasonRef, commit.seasonData, { merge: true })
    transaction.set(rootRef, commit.rootData)
    transaction.set(jobRef, projectionJob.document)
    transaction.update(actionRef, {
      status: 'in_progress',
      teamId: commit.birthTeamDocumentId,
      teamSeasonDocumentId: commit.teamSeasonDocumentId,
      seasonKey: commit.seasonKey,
      sourceRevision: projectionJob.sourceRevision,
      projectionJobId: projectionJob.id,
      projectionJobType: projectionJob.jobType,
      updatedAt: serverTimestamp(),
    })

    return {
      ...commit,
      projectionJob: {
        id: projectionJob.id,
        jobType: projectionJob.jobType,
        teamId: projectionJob.teamId,
        seasonId: projectionJob.seasonId,
        seasonKey: projectionJob.seasonKey,
        sourceRevision: projectionJob.sourceRevision,
      },
      writeActionId: clean(writeActionId),
      writeActionLinkedInCanonicalCommit: true,
    }
  })
}
