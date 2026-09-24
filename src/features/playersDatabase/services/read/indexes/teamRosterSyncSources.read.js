import { collection, query, where } from 'firebase/firestore'
import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDocs } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

export const readPlayerSeasonIndexScopeRows = async ({ birthTeamId = '', seasonKey = '' } = {}) => {
  const teamId = clean(birthTeamId)
  const key = clean(seasonKey)
  if (!teamId || !key) return []

  const snapshot = await trackedGetDocs(query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('birthTeamId', '==', teamId),
    where('seasonKey', '==', key),
    where('entityType', '==', 'playerSeason')
  ), {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    action: 'roster-sync-plan-player-index-read',
    operationSubtype: 'planning-query',
  })

  return snapshot.docs.map(row => ({ id: row.id, data: row.data() || {} }))
}

