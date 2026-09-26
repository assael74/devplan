import {
  doc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../../services/firestore/usage/index.js'
import {
  buildClubSeasonIdentityIndexDocumentId,
  CLUB_SEASON_IDENTITY_INDEX_DOCUMENT_CATALOG,
  CLUB_SEASON_IDENTITY_INDEX_PROJECTION_VERSION,
} from '../../../../catalog/firestoreDocuments/clubSeasonIdentityIndex.catalog.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import {
  buildLeagueClubSeasonIdentityEntries,
  buildNextClubSeasonIdentityEntries,
} from '../../../../domain/projections/clubSeasonIdentityIndex.projection.js'
import { cleanValue } from '../../../../model/shared/value.model.js'

export async function syncLeagueIdentityV2({
  league = {},
  season = {},
  rows = [],
} = {}) {
  const seasonKey = cleanValue(season.seasonKey || season.seasonId)
  const birthYear = Number(season.birthYear) || 0
  const leagueId = cleanValue(league.id || league.leagueId || season.leagueId)
  const documentId = buildClubSeasonIdentityIndexDocumentId({ seasonKey, birthYear })

  if (!documentId) throw new Error('Missing Club Season Identity Index scope')
  if (!leagueId) throw new Error('Missing league id')
  if (!Array.isArray(rows)) throw new Error('League rows must be an array')

  const leagueEntries = buildLeagueClubSeasonIdentityEntries({
    league,
    season,
    rows,
  })

  return trackedRunTransaction(db, async transaction => {
    const reference = doc(
      db,
      PLAYERS_DATABASE_COLLECTIONS.clubsMaster,
      documentId
    )
    const snapshot = await transaction.get(reference)
    const existing = snapshot.exists()
      ? snapshot.data() || {}
      : CLUB_SEASON_IDENTITY_INDEX_DOCUMENT_CATALOG
    const existingEntries = Array.isArray(existing.entries)
      ? existing.entries
      : []
    const next = buildNextClubSeasonIdentityEntries({
      existingEntries,
      leagueEntries,
      leagueId,
    })
    const changed = !snapshot.exists() ||
      JSON.stringify(existingEntries) !== JSON.stringify(next.entries)

    if (changed) {
      transaction.set(reference, {
        documentType: 'clubSeasonIdentityIndex',
        projectionVersion: CLUB_SEASON_IDENTITY_INDEX_PROJECTION_VERSION,
        seasonKey,
        birthYear,
        entries: next.entries,
        updatedAt: serverTimestamp(),
      })
    }

    return {
      documentId,
      changed,
      entriesCount: next.entries.length,
      removedEntries: next.removedEntries,
    }
  }, {
    feature: 'playersDatabase',
    action: 'league-v2-sync-identity',
    collection: PLAYERS_DATABASE_COLLECTIONS.clubsMaster,
  })
}

