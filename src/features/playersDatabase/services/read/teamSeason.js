// src/features/playersDatabase/services/read/teamSeason.js

import {
  collection,
  doc,
  query,
  where,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import {
  trackedGetDoc,
  trackedGetDocs,
} from '../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import { buildTeamSeasonDocumentId } from '../../model/teamIdentity.model.js'
import {
  buildTeamSeasonDocumentCacheKey,
  readWithDocumentCache,
} from '../cache/index.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const teamSeasonCollectionRef = () =>
  collection(db, PLAYERS_DATABASE_COLLECTIONS.teamSeasons)

export const teamSeasonDocRefById = teamSeasonDocumentId =>
  doc(
    db,
    PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
    clean(teamSeasonDocumentId)
  )

export const teamSeasonDocRef = ({ birthTeamDocumentId, seasonKey } = {}) => {
  const teamSeasonDocumentId = buildTeamSeasonDocumentId(
    birthTeamDocumentId,
    seasonKey
  )

  if (!teamSeasonDocumentId) return null

  return teamSeasonDocRefById(teamSeasonDocumentId)
}

export async function getTeamSeason({ birthTeamDocumentId, seasonKey } = {}) {
  const ref = teamSeasonDocRef({ birthTeamDocumentId, seasonKey })
  if (!ref) return null

  return readWithDocumentCache({
    key: buildTeamSeasonDocumentCacheKey(ref.id),
    read: async () => {
      const snapshot = await trackedGetDoc(ref, {
        feature: 'playersDatabase',
        action: 'team-season-read',
        collection: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
      })
      if (!snapshot.exists()) return null

      return {
        id: snapshot.id,
        ...snapshot.data(),
      }
    },
  })
}

export async function listTeamSeasons(birthTeamDocumentId) {
  const safeBirthTeamDocumentId = clean(birthTeamDocumentId)
  if (!safeBirthTeamDocumentId) return []

  const snapshot = await trackedGetDocs(query(
    teamSeasonCollectionRef(),
    where('birthTeamDocumentId', '==', safeBirthTeamDocumentId)
  ), {
    feature: 'playersDatabase',
    action: 'team-seasons-list',
    collection: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
  })

  return snapshot.docs.map(row => ({
    id: row.id,
    ...row.data(),
  }))
}
