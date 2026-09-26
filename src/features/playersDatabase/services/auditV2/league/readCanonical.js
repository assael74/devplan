import { doc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDoc } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { cleanValue } from '../../../model/shared/value.model.js'

const clean = cleanValue

const resolveLeagueSeason = ({ league = {}, seasonKey = '' } = {}) => {
  const safeSeasonKey = clean(seasonKey)
  const current = league?.current && typeof league.current === 'object' ? league.current : null

  if (current && clean(current.seasonKey || current.seasonId) === safeSeasonKey) {
    return { target: 'current', season: current }
  }

  const historicalSeason = (Array.isArray(league?.history) ? league.history : [])
    .find(item => clean(item?.seasonKey || item?.seasonId) === safeSeasonKey)

  return historicalSeason ? { target: 'history', season: historicalSeason } : null
}

export async function readLeagueCanonicalV2({ leagueId = '', seasonKey = '' } = {}) {
  const safeLeagueId = clean(leagueId)
  const safeSeasonKey = clean(seasonKey)
  if (!safeLeagueId) throw new Error('Missing league id')
  if (!safeSeasonKey) throw new Error('Missing season key')

  const snapshot = await trackedGetDoc(
    doc(db, PLAYERS_DATABASE_COLLECTIONS.leagues, safeLeagueId),
    {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.leagues,
      action: 'audit-v2-league-read-canonical',
      operationSubtype: 'audit-getDoc',
    }
  )
  if (!snapshot.exists()) throw new Error(`League canonical document not found: ${safeLeagueId}`)

  const league = { ...(snapshot.data() || {}), id: safeLeagueId }
  const resolvedSeason = resolveLeagueSeason({ league, seasonKey: safeSeasonKey })
  if (!resolvedSeason) {
    throw new Error(`League canonical season not found: ${safeLeagueId} / ${safeSeasonKey}`)
  }

  return { league, season: resolvedSeason.season, target: resolvedSeason.target }
}
