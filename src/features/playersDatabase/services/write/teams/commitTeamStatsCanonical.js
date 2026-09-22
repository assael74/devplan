import { doc, serverTimestamp } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { resolveTeamLookupKey } from '../../../model/team/teamIdentity.model.js'
import { buildSeasonKey, clean } from '../leagues/leagueDoc.js'
import { buildQueuedTeamStatsProjectionJob } from '../teamStatsProjectionJobs/index.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { teamDocRef } from './teamDoc.js'
import { teamSeasonDocRef } from './teamSeasonDoc.js'
import { buildTeamStatsCanonicalCommit } from './teamSeasonStats.js'
import { compareSeasonKeys } from '../../../domain/movement/index.js'

const resolvePreviousSeasonEntry = ({ seasons = [], seasonKey = '' } = {}) => (
  (Array.isArray(seasons) ? seasons : [])
    .filter(entry => compareSeasonKeys(entry?.seasonKey, seasonKey) < 0)
    .sort((left, right) => compareSeasonKeys(right?.seasonKey, left?.seasonKey))[0] || null
)

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
// One transaction for the canonical Stats source, Root navigation index, durable
// projection intent and its already-created write-action receipt linkage.
export async function commitTeamStatsCanonical({
  league = {}, season = {}, team = {}, players = [], teamPerformance = null,
  teamPoints = null, reconcileMovement = null, statsProjectionRevision = '', writeActionId = '',
} = {}) {
  const teamId = resolveTeamLookupKey(team)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  if (!teamId) throw new Error('Missing birth team id')
  if (!seasonId) throw new Error('Missing season id')
  if (!clean(writeActionId)) throw new Error('Missing write action id for canonical stats commit')

  const seasonRef = teamSeasonDocRef({ birthTeamDocumentId: teamId, seasonKey })
  const rootRef = teamDocRef(teamId)
  const actionRef = doc(db, PLAYERS_DATABASE_COLLECTIONS.writeActions, clean(writeActionId))

  return trackedRunTransaction(db, async transaction => {
    const [rootSnapshot, seasonSnapshot, actionSnapshot] = await Promise.all([
      transaction.get(rootRef), transaction.get(seasonRef), transaction.get(actionRef),
    ])
    if (!actionSnapshot.exists()) throw new Error('Write action receipt was not found')
    assertStatsWriteActionLinkable({
      receipt: actionSnapshot.data() || {},
      writeActionId,
    })

    const existingRoot = rootSnapshot.exists() ? rootSnapshot.data() || {} : null
    const existingSeason = seasonSnapshot.exists() ? seasonSnapshot.data() || {} : null
    const previousEntry = resolvePreviousSeasonEntry({ seasons: existingRoot?.seasons || [], seasonKey })
    const previousRef = previousEntry?.seasonKey
      ? teamSeasonDocRef({ birthTeamDocumentId: teamId, seasonKey: previousEntry.seasonKey })
      : null
    const previousSnapshot = previousRef ? await transaction.get(previousRef) : null
    const previousSeason = previousSnapshot?.exists() ? previousSnapshot.data() || {} : null
    const commit = buildTeamStatsCanonicalCommit({
      season, team, players, teamPerformance, teamPoints, reconcileMovement,
      statsProjectionRevision, existingSeason, existingRoot, previousSeason,
    })
    const projectionJob = buildQueuedTeamStatsProjectionJob({
      league, season: { ...season, seasonKey: commit.seasonKey },
      team: { ...team, birthTeamDocumentId: commit.birthTeamDocumentId },
      teamSeasonDocumentId: commit.teamSeasonDocumentId,
      sourceRevision: statsProjectionRevision,
      writeActionId,
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