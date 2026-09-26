import {
  doc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { buildLeagueCanonicalState } from '../../../../domain/builders/leagueCanonical.builder.js'
import { buildLeagueTeamPerformanceContext } from '../../../../domain/projections/leagueTeamPerformanceContext.projection.js'
import { cleanValue } from '../../../../model/shared/value.model.js'

export async function writeLeagueV2({
  league = {},
  season = {},
  target = 'current',
  rows = [],
} = {}) {
  const leagueId = cleanValue(league.id || league.leagueId || season.leagueId)
  const seasonId = cleanValue(season.seasonId)

  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId) throw new Error('Missing season id')
  if (!Array.isArray(rows)) throw new Error('League rows must be an array')

  const createdAt = serverTimestamp()
  const updatedAt = new Date().toISOString()

  return trackedRunTransaction(db, async transaction => {
    const reference = doc(
      db,
      PLAYERS_DATABASE_COLLECTIONS.leagues,
      leagueId
    )
    const snapshot = await transaction.get(reference)
    const currentData = snapshot.exists()
      ? snapshot.data() || {}
      : {}
    const baseCanonical = buildLeagueCanonicalState({
      league: {
        ...league,
        id: leagueId,
      },
      season: {
        ...season,
        seasonId,
      },
      target,
      rows,
      currentData,
      createdAt,
      updatedAt,
    })
    const teamPerformanceContext = buildLeagueTeamPerformanceContext({
      league: baseCanonical.nextData,
      season: {
        ...baseCanonical.canonicalSeason,
        updatedAt,
      },
      rows: baseCanonical.tableRank,
    })
    const canonical = buildLeagueCanonicalState({
      league: {
        ...league,
        id: leagueId,
      },
      season: {
        ...season,
        seasonId,
      },
      target,
      rows,
      currentData,
      teamPerformanceContext,
      createdAt,
      updatedAt,
    })

    transaction.set(reference, canonical.nextData, { merge: true })

    return {
      leagueId: canonical.leagueId,
      seasonId: canonical.seasonId,
      seasonKey: canonical.seasonKey,
      target: canonical.target,
      rowsCount: canonical.tableRank.length,
      createdLeague: !snapshot.exists(),
      seasonDocument: canonical.canonicalSeason,
    }
  }, {
    feature: 'playersDatabase',
    action: 'league-v2-write-canonical',
    collection: PLAYERS_DATABASE_COLLECTIONS.leagues,
  })
}

