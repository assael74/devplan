import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const normalizeKey = value => clean(value).replace(/[^0-9a-zA-Z]+/g, '_')

export const createTeamRosterProjectionRevision = () => (
  `${Date.now()}-${Math.random().toString(36).slice(2)}`
)

export const buildTeamRosterProjectionJobId = ({ teamId = '', seasonKey = '' } = {}) => (
  `${clean(teamId)}__${normalizeKey(seasonKey)}`
)

const serializeCounterpartRequests = requests => (Array.isArray(requests) ? requests : [])
  .map(request => ({
    movementId: clean(request?.movementId),
    playerId: clean(request?.playerId),
    seasonKey: clean(request?.seasonKey),
    counterpartSeasonKey: clean(request?.counterpartSeasonKey || request?.seasonKey),
    counterpartBirthTeamDocumentId: clean(request?.counterpartBirthTeamDocumentId || request?.sourceBirthTeamDocumentId),
    counterpartRosterProjectionRevision: clean(request?.counterpartRosterProjectionRevision),
    counterpartMovementProjectionRevision: clean(request?.counterpartMovementProjectionRevision),
    side: request?.incoming ? 'transfersIn' : request?.outgoing ? 'transfersOut' : '',
  }))
  .filter(request => request.movementId && request.playerId && request.seasonKey && request.counterpartSeasonKey && request.counterpartBirthTeamDocumentId && request.side)

export async function queueTeamRosterProjectionJob({
  league = {}, season = {}, team = {}, teamSeasonDocumentId = '', sourceRevision = '',
  counterpartRequests = [], approvedSyncPayload = null, writeActionId = '',
} = {}) {
  const teamId = clean(team.birthTeamDocumentId || team.teamDocumentId || team.birthTeamId || team.teamId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey || seasonId)
  const revision = clean(sourceRevision) || createTeamRosterProjectionRevision()
  if (!teamId) throw new Error('Missing team id for roster projection job')
  if (!seasonKey) throw new Error('Missing season key for roster projection job')

  const id = `${buildTeamRosterProjectionJobId({ teamId, seasonKey })}__${normalizeKey(revision)}`
  await setDoc(doc(db, PLAYERS_DATABASE_COLLECTIONS.teamRosterProjectionJobs, id), {
    id, jobType: 'team_roster_projection_sync', schemaVersion: 1, status: 'preparing',
    teamId, teamSeasonDocumentId: clean(teamSeasonDocumentId) || id, seasonId, seasonKey,
    target: clean(season.seasonStatus) === 'completed' ? 'history' : 'current',
    sourceRevision: revision, writeActionId: clean(writeActionId) || null,
    source: {
      league: { id: clean(league.id || league.leagueId || season.leagueId) },
      season: { seasonId, seasonKey, seasonStatus: clean(season.seasonStatus) || 'active' },
      team: { id: teamId, birthTeamDocumentId: teamId },
    },
    counterpartRequests: serializeCounterpartRequests(counterpartRequests),
    approvedSyncPayload: approvedSyncPayload && typeof approvedSyncPayload === 'object'
      ? approvedSyncPayload
      : null,
    stages: {
      canonicalSource: 'pending', playerIndexes: 'pending',
      teamAndLeagueIndexes: 'pending', clubProjection: 'pending', transfers: 'pending',
    },
    attempts: 0, attemptToken: null, leaseExpiresAt: null,
    requestedAt: serverTimestamp(), updatedAt: serverTimestamp(), startedAt: null,
    completedAt: null, failedAt: null, error: null,
  })
  return { id, jobType: 'team_roster_projection_sync', teamId, seasonId, seasonKey, sourceRevision: revision }
}

export async function activateTeamRosterProjectionJob({ id = '', sourceRevision = '' } = {}) {
  const jobId = clean(id)
  if (!jobId) throw new Error('Missing roster projection job id')
  await updateDoc(doc(db, PLAYERS_DATABASE_COLLECTIONS.teamRosterProjectionJobs, jobId), {
    status: 'queued', activatedAt: serverTimestamp(), updatedAt: serverTimestamp(), sourceRevision: clean(sourceRevision),
  })
}
