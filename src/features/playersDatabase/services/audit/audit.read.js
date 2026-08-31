import { collection, getDocs, limit, query, startAfter } from 'firebase/firestore'
import { db } from '../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'

const PAGE_SIZE = 1000
const READ_LIMIT = 49000

const readCollection = async collectionName => {
  const source = collection(db, collectionName)
  const documents = []
  let cursor = null

  while (documents.length < READ_LIMIT) {
    const remaining = READ_LIMIT - documents.length
    const constraints = [limit(Math.min(PAGE_SIZE, remaining))]
    if (cursor) constraints.unshift(startAfter(cursor))
    const snapshot = await getDocs(query(source, ...constraints))
    documents.push(...snapshot.docs)
    if (snapshot.size < PAGE_SIZE) return documents
    cursor = snapshot.docs[snapshot.docs.length - 1]
  }

  throw new Error(`ה־Audit נעצר: ${collectionName} הגיע למגבלת ${READ_LIMIT} מסמכים.`)
}

// Integrity checks never run against a partial side of a relation. Scoped
// filtering happens after this consistent evidence set is assembled.
export async function readPlayerDatabaseAuditSnapshot() {
  const entries = await Promise.all([
    ['leagues', PLAYERS_DATABASE_COLLECTIONS.leagues],
    ['leaguesMaster', PLAYERS_DATABASE_COLLECTIONS.leaguesMaster],
    ['teams', PLAYERS_DATABASE_COLLECTIONS.teams],
    ['teamSeasons', PLAYERS_DATABASE_COLLECTIONS.teamSeasons],
    ['players', PLAYERS_DATABASE_COLLECTIONS.players],
    ['favorites', PLAYERS_DATABASE_COLLECTIONS.favorites],
    ['searchIndexes', PLAYERS_DATABASE_COLLECTIONS.searchIndexes],
  ].map(async ([key, collectionName]) => [key, await readCollection(collectionName)]))

  const rows = Object.fromEntries(entries.map(([key, documents]) => [key, documents.map(document => ({ id: document.id, data: document.data() || {} }))]))
  return { generatedAt: new Date().toISOString(), readsUsed: entries.reduce((total, [, documents]) => total + documents.length, 0), rows }
}
