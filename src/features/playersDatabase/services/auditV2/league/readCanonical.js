// src/features/playersDatabase/services/auditV2/league/readCanonical.js

import { doc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDocFromServer } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { cleanValue } from '../../../model/shared/value.model.js'
import { selectLeagueSeason } from '../../../domain/leagueV2/clear/leagueTeamsClearedState.builder.js'

const clean = cleanValue

export async function readLeagueCanonicalV2({ leagueId = '', seasonKey = '' } = {}) {
  const safeLeagueId = clean(leagueId)
  const safeSeasonKey = clean(seasonKey)
  if (!safeLeagueId) throw new Error('Missing league id')
  if (!safeSeasonKey) throw new Error('Missing season key')

  const snapshot = await trackedGetDocFromServer(
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
  const selected = selectLeagueSeason(league, safeSeasonKey)
  const resolvedSeason = { target: selected.field, season: selected.season }
  if (!resolvedSeason) {
    throw new Error(`League canonical season not found: ${safeLeagueId} / ${safeSeasonKey}`)
  }

  return { league, season: resolvedSeason.season, target: resolvedSeason.target }
}
