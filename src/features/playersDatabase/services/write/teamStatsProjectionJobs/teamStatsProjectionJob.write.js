import { doc, serverTimestamp, setDoc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const normalizeKey = value => clean(value).replace(/[^0-9a-zA-Z]+/g, '_')

export const createTeamStatsProjectionRevision = () => (
  `${Date.now()}-${Math.random().toString(36).slice(2)}`
)

export const buildTeamStatsProjectionJobId = ({ teamId = '', seasonKey = '' } = {}) => (
  `${clean(teamId)}__${normalizeKey(seasonKey)}`
)

// The canonical transaction owns this document. Kept separate so the legacy
// direct queue helper and the transaction share one job contract.
export const buildQueuedTeamStatsProjectionJob = ({
  league = {}, season = {}, team = {}, teamSeasonDocumentId = '', sourceRevision = '', writeActionId = '',
  projectionManifest = null,
} = {}) => {
  const teamId = clean(team.birthTeamDocumentId || team.teamDocumentId || team.birthTeamId || team.teamId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey || seasonId)
  const revision = clean(sourceRevision) || createTeamStatsProjectionRevision()
  if (!teamId) throw new Error('Missing team id for stats projection job')
  if (!seasonKey) throw new Error('Missing season key for stats projection job')
  if (!clean(writeActionId)) throw new Error('Missing write action id for stats projection job')

  const manifest = projectionManifest && typeof projectionManifest === 'object'
    ? projectionManifest
    : null
  if (manifest && clean(manifest.sourceRevision) !== revision) {
    throw new Error('Stats projection manifest revision does not match job revision')
  }

  const id = `${buildTeamStatsProjectionJobId({ teamId, seasonKey })}__${normalizeKey(revision)}`
  return {
    id,
    jobType: 'team_stats_projection_sync',
    teamId,
    seasonId,
    seasonKey,
    sourceRevision: revision,
    document: {
      id, jobType: 'team_stats_projection_sync', schemaVersion: manifest ? 2 : 1,
      status: manifest ? 'waiting_for_client' : 'queued',
      teamId, teamSeasonDocumentId: clean(teamSeasonDocumentId) || id, seasonId, seasonKey,
      target: clean(season.seasonStatus) === 'completed' ? 'history' : 'current',
      sourceRevision: revision,
      writeActionId: clean(writeActionId),
      ...(manifest ? { projectionManifest: manifest } : {}),
      source: {
        league: { id: clean(league.id || league.leagueId || season.leagueId) },
        season: { seasonId, seasonKey, seasonStatus: clean(season.seasonStatus) || 'active' },
        team: { id: teamId, birthTeamDocumentId: teamId },
      },
      stages: {
        canonicalSource: 'pending',
        counterpartMovement: 'pending',
        playerDocuments: 'pending',
        teamScout: 'pending',
        playerIndexes: 'pending',
        teamAndLeagueIndexes: 'pending',
        clubProjection: 'pending',
      },
      attempts: 0, attemptToken: null, leaseExpiresAt: null,
      requestedAt: serverTimestamp(), activatedAt: serverTimestamp(), updatedAt: serverTimestamp(), startedAt: null,
      completedAt: null, failedAt: null, error: null,
    },
  }
}

export async function queueTeamStatsProjectionJob(input = {}) {
  const job = buildQueuedTeamStatsProjectionJob(input)
  await setDoc(doc(db, PLAYERS_DATABASE_COLLECTIONS.teamStatsProjectionJobs, job.id), job.document)
  return {
    id: job.id, jobType: job.jobType, teamId: job.teamId,
    seasonId: job.seasonId, seasonKey: job.seasonKey, sourceRevision: job.sourceRevision,
  }
}


export async function activateTeamStatsProjectionJob({
  jobId = '',
  sourceRevision = '',
} = {}) {
  const id = clean(jobId)
  const revision = clean(sourceRevision)
  if (!id) throw new Error('Missing stats projection job id')
  if (!revision) throw new Error('Missing stats projection source revision')

  const ref = doc(db, PLAYERS_DATABASE_COLLECTIONS.teamStatsProjectionJobs, id)
  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) throw new Error('Stats projection job was not found')

    const job = snapshot.data() || {}
    if (clean(job.sourceRevision) !== revision) {
      const error = new Error('Stats projection job revision changed before client handoff')
      error.code = 'STATS_PROJECTION_JOB_STALE'
      throw error
    }
    if (clean(job.status) !== 'waiting_for_client') {
      return { id, sourceRevision: revision, activated: false, status: clean(job.status) }
    }

    transaction.update(ref, {
      status: 'queued',
      clientProjectionStatus: 'completed',
      clientProjectionCompletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return { id, sourceRevision: revision, activated: true, status: 'queued' }
  })
}

export async function failTeamStatsProjectionJobFromClient({
  jobId = '',
  sourceRevision = '',
  failedStage = '',
  error = null,
} = {}) {
  const id = clean(jobId)
  const revision = clean(sourceRevision)
  if (!id || !revision) return { applied: false, reason: 'jobIdentityMissing' }

  const ref = doc(db, PLAYERS_DATABASE_COLLECTIONS.teamStatsProjectionJobs, id)
  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) return { applied: false, reason: 'jobNotFound' }

    const job = snapshot.data() || {}
    if (clean(job.sourceRevision) !== revision) {
      return { applied: false, reason: 'staleRevision' }
    }
    if (clean(job.status) !== 'waiting_for_client') {
      return { applied: false, reason: 'jobNotWaitingForClient', status: clean(job.status) }
    }

    transaction.update(ref, {
      status: 'failed',
      clientProjectionStatus: 'failed',
      clientProjectionFailedAt: serverTimestamp(),
      failedAt: serverTimestamp(),
      failedStage: clean(failedStage) || 'clientProjection',
      error: {
        message: clean(error?.message) || 'Client projection synchronization failed',
        code: clean(error?.code),
      },
      updatedAt: serverTimestamp(),
    })

    return { applied: true, id, sourceRevision: revision, status: 'failed' }
  })
}
