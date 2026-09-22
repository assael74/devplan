import {
  doc,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { trackedGetDoc } from '../../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { queueLeagueProjectionJob } from '../../leagueProjectionJobs/leagueProjectionJob.write.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const resolveCanonicalSeason = ({ league = {}, seasonKey = '', target = 'current' } = {}) => {
  if (target === 'history') {
    return (Array.isArray(league.history) ? league.history : []).find(season => (
      clean(season?.seasonKey || season?.seasonId) === clean(seasonKey)
    )) || null
  }

  const current = league.current || null
  return clean(current?.seasonKey || current?.seasonId) === clean(seasonKey)
    ? current
    : null
}

// This is deliberately a new job, not a requeue of a failed one: it binds the
// attempt to the latest canonical League Season and its persisted revision.
export async function retryLeagueProjectionSyncFlow({
  leagueId = '',
  seasonKey = '',
  target = 'current',
  writeActionId = '',
  retryOfJobId = '',
} = {}) {
  const resolvedLeagueId = clean(leagueId)
  const resolvedSeasonKey = clean(seasonKey)
  const resolvedTarget = clean(target) || 'current'
  if (!resolvedLeagueId) throw new Error('Missing league id for league projection retry')
  if (!resolvedSeasonKey) throw new Error('Missing season key for league projection retry')
  if (!clean(writeActionId)) throw new Error('Missing original write action for league projection retry')
  if (!clean(retryOfJobId)) throw new Error('Missing failed projection job for league projection retry')
  if (!['current', 'history'].includes(resolvedTarget)) throw new Error('Invalid league projection retry target')

  const retrySnapshot = await trackedGetDoc(
    doc(db, PLAYERS_DATABASE_COLLECTIONS.leagueProjectionJobs, clean(retryOfJobId)),
    {
      feature: 'playersDatabase',
      action: 'league-projection-retry-read',
      collection: PLAYERS_DATABASE_COLLECTIONS.leagueProjectionJobs,
    }
  )
  const failedJob = retrySnapshot.exists() ? retrySnapshot.data() || {} : null
  if (!failedJob || clean(failedJob.status) !== 'failed') {
    throw new Error('League projection retry requires a failed job')
  }
  if (
    clean(failedJob.writeActionId) !== clean(writeActionId) ||
    clean(failedJob.leagueId) !== resolvedLeagueId ||
    clean(failedJob.seasonKey) !== resolvedSeasonKey
  ) {
    throw new Error('Failed projection job does not match the original league write')
  }

  const snapshot = await trackedGetDoc(
    doc(db, PLAYERS_DATABASE_COLLECTIONS.leagues, resolvedLeagueId),
    {
      feature: 'playersDatabase',
      action: 'league-projection-retry-read',
      collection: PLAYERS_DATABASE_COLLECTIONS.leagues,
    }
  )
  if (!snapshot.exists()) throw new Error('Canonical league document was not found')

  const league = { id: snapshot.id, ...snapshot.data() }
  const season = resolveCanonicalSeason({
    league,
    seasonKey: resolvedSeasonKey,
    target: resolvedTarget,
  })
  const sourceRevision = clean(season?.sourceRevision)
  if (!season) throw new Error('Canonical league season was not found')
  if (!sourceRevision) throw new Error('Canonical league season has no source revision')

  const projectionJob = await queueLeagueProjectionJob({
    league: { id: resolvedLeagueId },
    season,
    target: resolvedTarget,
    sourceRevision,
    writeActionId,
    retryKey: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    retryOfJobId,
  })

  return {
    projectionJob,
    leagueResult: {
      leagueId: resolvedLeagueId,
      seasonKey: resolvedSeasonKey,
      sourceRevision,
    },
    backgroundSyncPending: true,
    completed: false,
    recoveryRequired: false,
    syncStatus: 'background_sync_pending',
  }
}