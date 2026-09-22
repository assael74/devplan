import { doc, serverTimestamp, setDoc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

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
} = {}) => {
  const teamId = clean(team.birthTeamDocumentId || team.teamDocumentId || team.birthTeamId || team.teamId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey || seasonId)
  const revision = clean(sourceRevision) || createTeamStatsProjectionRevision()
  if (!teamId) throw new Error('Missing team id for stats projection job')
  if (!seasonKey) throw new Error('Missing season key for stats projection job')
  if (!clean(writeActionId)) throw new Error('Missing write action id for stats projection job')

  const id = `${buildTeamStatsProjectionJobId({ teamId, seasonKey })}__${normalizeKey(revision)}`
  return {
    id,
    jobType: 'team_stats_projection_sync',
    teamId,
    seasonId,
    seasonKey,
    sourceRevision: revision,
    document: {
      id, jobType: 'team_stats_projection_sync', schemaVersion: 1, status: 'queued',
      teamId, teamSeasonDocumentId: clean(teamSeasonDocumentId) || id, seasonId, seasonKey,
      target: clean(season.seasonStatus) === 'completed' ? 'history' : 'current',
      sourceRevision: revision,
      writeActionId: clean(writeActionId),
      source: {
        league: { id: clean(league.id || league.leagueId || season.leagueId) },
        season: { seasonId, seasonKey, seasonStatus: clean(season.seasonStatus) || 'active' },
        team: { id: teamId, birthTeamDocumentId: teamId },
      },
      stages: {
        canonicalSource: 'pending', playerDocuments: 'pending', playerIndexes: 'pending',
        teamAndLeagueIndexes: 'pending', clubProjection: 'pending',
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
