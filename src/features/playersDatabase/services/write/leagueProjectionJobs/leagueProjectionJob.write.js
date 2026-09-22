// src/features/playersDatabase/services/write/leagueProjectionJobs/leagueProjectionJob.write.js

import {
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

const JOB_STATUS = 'queued'

const JOB_STAGES = [
  'teamSeasonProjections',
  'teamIndexes',
]

const DEFERRED_STAGES = [
  'playerDocuments',
  'playerIndexes',
  'leagueScoutSummaries',
  'leaguesMaster',
]

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const buildJobId = ({ leagueId = '', seasonKey = '', sourceRevision = '', retryKey = '' } = {}) => (
  [
    clean(leagueId),
    clean(seasonKey).replace(/[^0-9a-zA-Z]+/g, '_'),
    clean(sourceRevision).replace(/[^0-9a-zA-Z]+/g, '_'),
    clean(retryKey).replace(/[^0-9a-zA-Z]+/g, '_'),
  ].filter(Boolean).join('__')
)

const buildStageState = () => Object.fromEntries(
  JOB_STAGES.map(stage => [stage, 'pending'])
)

const createSourceRevision = () => (
  `${Date.now()}-${Math.random().toString(36).slice(2)}`
)

export async function queueLeagueProjectionJob({
  league = {},
  season = {},
  target = 'current',
  sourceRevision = '',
  writeActionId = '',
  retryKey = '',
  retryOfJobId = '',
} = {}) {
  const leagueId = clean(league.id || league.leagueId || season.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey || seasonId)
  if (!leagueId) throw new Error('Missing league id for projection job')
  if (!seasonKey) throw new Error('Missing season key for projection job')

  const resolvedSourceRevision = clean(sourceRevision) || createSourceRevision()
  const id = buildJobId({ leagueId, seasonKey, sourceRevision: resolvedSourceRevision, retryKey })
  await setDoc(
    doc(db, PLAYERS_DATABASE_COLLECTIONS.leagueProjectionJobs, id),
    {
      id,
      jobType: 'league_projection_sync',
      schemaVersion: 3,
      status: JOB_STATUS,
      leagueId,
      seasonId,
      seasonKey,
      target: clean(target) || 'current',
      sourceRevision: resolvedSourceRevision,
      writeActionId: clean(writeActionId) || null,
      retryOfJobId: clean(retryOfJobId) || null,
      source: {
        // Job payload is identity metadata only. The worker always reloads
        // the canonical League Season before it calculates projections.
        league: { id: leagueId },
        season: { seasonId, seasonKey },
        target: clean(target) || 'current',
      },
      stages: buildStageState(),
      deferredStages: DEFERRED_STAGES,
      attempts: 0,
      attemptToken: null,
      leaseExpiresAt: null,
      requestedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      startedAt: null,
      completedAt: null,
      failedAt: null,
      error: null,
    }
  )

  return { id, jobType: 'league_projection_sync', leagueId, seasonId, seasonKey, sourceRevision: resolvedSourceRevision }
}
