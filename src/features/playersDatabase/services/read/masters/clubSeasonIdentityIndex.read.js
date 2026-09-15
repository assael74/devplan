import { doc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDoc } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import {
  buildClubSeasonIdentityIndexDocumentId,
  CLUB_SEASON_IDENTITY_INDEX_DOCUMENT_CATALOG,
} from '../../../catalog/firestoreDocuments/clubSeasonIdentityIndex.catalog.js'
import {
  buildClubSeasonIdentityIndexCacheKey,
  readWithDocumentCache,
} from '../../cache/index.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const toIdentityScope = ({ seasonKey = '', birthYear = 0 } = {}) => ({
  seasonKey: clean(seasonKey),
  birthYear: Number(birthYear) || 0,
})

export const buildClubSeasonIdentityScopesFromLeaguesMaster = ({
  leaguesMasterDoc = {},
} = {}) => {
  const scopes = new Map()

  ;(Array.isArray(leaguesMasterDoc?.leagues) ? leaguesMasterDoc.leagues : [])
    .forEach(league => {
      ;(Array.isArray(league?.seasons) ? league.seasons : []).forEach(season => {
        const scope = toIdentityScope({
          seasonKey: season?.seasonKey || season?.seasonId,
          birthYear: season?.birthYear,
        })
        if (!scope.seasonKey || !scope.birthYear) return

        scopes.set(`${scope.seasonKey}::${scope.birthYear}`, scope)
      })
    })

  return [...scopes.values()]
}

export async function readClubSeasonIdentityIndex({ seasonKey = '', birthYear = 0 } = {}) {
  const scope = toIdentityScope({ seasonKey, birthYear })
  const id = buildClubSeasonIdentityIndexDocumentId(scope)
  if (!id) return null

  return readWithDocumentCache({
    key: buildClubSeasonIdentityIndexCacheKey(scope),
    read: async () => {
      const snapshot = await trackedGetDoc(
        doc(db, PLAYERS_DATABASE_COLLECTIONS.clubsMaster, id),
        {
          feature: 'playersDatabase',
          action: 'club-season-identity-index-read',
          collection: PLAYERS_DATABASE_COLLECTIONS.clubsMaster,
        }
      )

      return snapshot.exists()
        ? { id: snapshot.id, documentExists: true, ...snapshot.data() }
        : {
            id,
            documentExists: false,
            ...CLUB_SEASON_IDENTITY_INDEX_DOCUMENT_CATALOG,
            seasonKey: scope.seasonKey,
            birthYear: scope.birthYear,
            entries: [],
          }
    },
  })
}

export async function readClubSeasonIdentityIndexes({ scopes = [] } = {}) {
  const uniqueScopes = new Map()

  ;(Array.isArray(scopes) ? scopes : []).forEach(value => {
    const scope = toIdentityScope(value)
    if (!scope.seasonKey || !scope.birthYear) return
    uniqueScopes.set(`${scope.seasonKey}::${scope.birthYear}`, scope)
  })

  const documents = await Promise.all(
    [...uniqueScopes.values()].map(readClubSeasonIdentityIndex)
  )

  return documents.filter(Boolean)
}
