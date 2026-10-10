// src/features/playersDatabase/services/read/inventory/collectionInventory.read.js

import { collection } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetCountFromServer } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

export const PLAYERS_DATABASE_INVENTORY = Object.freeze([
  { id: 'playerRoots', label: 'שחקנים', collectionName: PLAYERS_DATABASE_COLLECTIONS.playerRoots },
  { id: 'playerSeasons', label: 'עונות שחקן', collectionName: PLAYERS_DATABASE_COLLECTIONS.playerSeasons },
  { id: 'playerSearchIndexes', label: 'אינדקסי חיפוש', collectionName: PLAYERS_DATABASE_COLLECTIONS.playerSearchIndexes },
  { id: 'teamRoots', label: 'קבוצות', collectionName: PLAYERS_DATABASE_COLLECTIONS.teamRoots },
  { id: 'teamSeasons', label: 'עונות קבוצה', collectionName: PLAYERS_DATABASE_COLLECTIONS.teamSeasons },
  { id: 'leagues', label: 'ליגות', collectionName: PLAYERS_DATABASE_COLLECTIONS.leagues },
  { id: 'clubProfiles', label: 'מועדונים', collectionName: PLAYERS_DATABASE_COLLECTIONS.clubProfiles },
  { id: 'leaguesCenter', label: 'מרכז ליגות', collectionName: PLAYERS_DATABASE_COLLECTIONS.leaguesCenter },
  { id: 'clubsCenter', label: 'מרכזי מועדונים', collectionName: PLAYERS_DATABASE_COLLECTIONS.clubsCenter },
  { id: 'clubsDirectory', label: 'ספריית מועדונים', collectionName: PLAYERS_DATABASE_COLLECTIONS.clubsDirectory },
  { id: 'writeActions', label: 'קבלות כתיבה', collectionName: PLAYERS_DATABASE_COLLECTIONS.writeActions },
])

const countCollection = async item => {
  const snapshot = await trackedGetCountFromServer(
    collection(db, item.collectionName),
    {
      feature: 'playersDatabase',
      collection: item.collectionName,
      action: 'data-ops-count-collection',
      operationSubtype: 'data-ops-aggregation-count',
      meta: { inventoryId: item.id },
    }
  )

  return {
    ...item,
    count: Number(snapshot.data().count || 0),
  }
}

export const readPlayersDatabaseCollectionInventory = async () => ({
  checkedAt: new Date().toISOString(),
  collections: await Promise.all(PLAYERS_DATABASE_INVENTORY.map(countCollection)),
})

