import { collection, doc, getDoc, getDocs, limit, query, startAfter, where } from 'firebase/firestore'
import { db } from '../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import { buildTeamSeasonDocumentId } from '../../model/team/teamIdentity.model.js'
import { normalizeAuditScope, AUDIT_SCOPE_TYPE } from './audit.scope.js'

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

const toRows = documents => documents
  .filter(item => item?.exists())
  .map(item => ({ id: item.id, data: item.data() || {} }))

const uniqueRows = rows => [...new Map(rows.map(row => [row.id, row])).values()]

const readDocumentsById = async ({ collectionName, ids = [] } = {}) => {
  const uniqueIds = [...new Set(ids.filter(Boolean))]
  const snapshots = await Promise.all(uniqueIds.map(id => getDoc(doc(db, collectionName, id))))
  return { rows: toRows(snapshots), readsUsed: uniqueIds.length }
}

const readSearchIndexesForTeam = async teamDocumentId => {
  const source = collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes)
  // Both fields are read because pre-normalization documents may only have the
  // legacy teamDocumentId. The rows are de-duplicated by document id.
  const snapshots = await Promise.all([
    getDocs(query(source, where('birthTeamDocumentId', '==', teamDocumentId))),
    getDocs(query(source, where('teamDocumentId', '==', teamDocumentId))),
  ])
  return {
    rows: uniqueRows(snapshots.flatMap(snapshot => toRows(snapshot.docs))),
    readsUsed: snapshots.reduce((total, snapshot) => total + snapshot.size, 0),
  }
}

// Recovery records are exceptional and therefore stay small. Querying only
// active records keeps a Team/Season Audit narrow without reading successful
// writes from the normal journal.
const readActiveWriteRecoveryActions = async () => {
  const source = collection(db, PLAYERS_DATABASE_COLLECTIONS.writeActions)
  const snapshot = await getDocs(query(source, where('recoveryRequired', '==', true)))
  return { rows: toRows(snapshot.docs), readsUsed: snapshot.size }
}

const readScopedSnapshot = async scope => {
  const scopes = scope.type === AUDIT_SCOPE_TYPE.TEAM_SEASON ? [scope] : scope.scopes
  const teamIds = [...new Set(scopes.map(item => item.teamDocumentId))]
  const rootResult = await readDocumentsById({
    collectionName: PLAYERS_DATABASE_COLLECTIONS.teams,
    ids: teamIds,
  })
  const seasonIds = scopes.map(item => buildTeamSeasonDocumentId(item.teamDocumentId, item.seasonKey))
  const seasonResult = await readDocumentsById({
    collectionName: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
    ids: seasonIds,
  })
  const indexResults = await Promise.all(teamIds.map(readSearchIndexesForTeam))
  const searchIndexes = uniqueRows(indexResults.flatMap(result => result.rows)).filter(row => (
    scopes.some(item => (
      String(row.data?.birthTeamDocumentId || row.data?.teamDocumentId || '').trim() === item.teamDocumentId &&
      String(row.data?.seasonKey || row.data?.seasonId || '').trim() === item.seasonKey
    ))
  ))
  const playerIds = [...new Set(seasonResult.rows.flatMap(row => (
    (Array.isArray(row.data?.teamPlayers) ? row.data.teamPlayers : [])
      .map(player => player?.playerDocumentId)
      .filter(Boolean)
  )))]
  const playerResult = await readDocumentsById({
    collectionName: PLAYERS_DATABASE_COLLECTIONS.players,
    ids: playerIds,
  })
  const leagueIds = [...new Set(seasonResult.rows.map(row => row.data?.leagueId).filter(Boolean))]
  const leagueResult = await readDocumentsById({
    collectionName: PLAYERS_DATABASE_COLLECTIONS.leagues,
    ids: leagueIds,
  })
  const favoritesResult = await readDocumentsById({
    collectionName: PLAYERS_DATABASE_COLLECTIONS.favorites,
    ids: ['players'],
  })
  const writeActionsResult = await readActiveWriteRecoveryActions()

  return {
    generatedAt: new Date().toISOString(),
    readsUsed: rootResult.readsUsed + seasonResult.readsUsed +
      indexResults.reduce((total, result) => total + result.readsUsed, 0) +
      playerResult.readsUsed + leagueResult.readsUsed + favoritesResult.readsUsed +
      writeActionsResult.readsUsed,
    rows: {
      leagues: leagueResult.rows,
      leaguesMaster: [],
      clubs: [],
      clubsMaster: [],
      teams: rootResult.rows,
      teamSeasons: seasonResult.rows,
      players: playerResult.rows,
      favorites: favoritesResult.rows,
      searchIndexes,
      writeActions: writeActionsResult.rows,
    },
  }
}

// A full-system audit reads every canonical collection. A Team/Season audit
// assembles only the explicit relation set needed for that Team/Season.
export async function readPlayerDatabaseAuditSnapshot({ scope } = {}) {
  const normalizedScope = normalizeAuditScope(scope)
  if (normalizedScope.type !== AUDIT_SCOPE_TYPE.FULL_SYSTEM) {
    return readScopedSnapshot(normalizedScope)
  }
  const [entries, writeActionsResult] = await Promise.all([
    Promise.all([
      ['leagues', PLAYERS_DATABASE_COLLECTIONS.leagues],
      ['leaguesMaster', PLAYERS_DATABASE_COLLECTIONS.leaguesMaster],
      ['clubs', PLAYERS_DATABASE_COLLECTIONS.clubs],
      ['clubsMaster', PLAYERS_DATABASE_COLLECTIONS.clubsMaster],
      ['teams', PLAYERS_DATABASE_COLLECTIONS.teams],
      ['teamSeasons', PLAYERS_DATABASE_COLLECTIONS.teamSeasons],
      ['players', PLAYERS_DATABASE_COLLECTIONS.players],
      ['favorites', PLAYERS_DATABASE_COLLECTIONS.favorites],
      ['searchIndexes', PLAYERS_DATABASE_COLLECTIONS.searchIndexes],
    ].map(async ([key, collectionName]) => [key, await readCollection(collectionName)])),
    readActiveWriteRecoveryActions(),
  ])

  const rows = {
    ...Object.fromEntries(entries.map(([key, documents]) => [key, documents.map(document => ({ id: document.id, data: document.data() || {} }))])),
    writeActions: writeActionsResult.rows,
  }
  return {
    generatedAt: new Date().toISOString(),
    readsUsed: entries.reduce((total, [, documents]) => total + documents.length, 0) + writeActionsResult.readsUsed,
    rows,
  }
}
