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

// A scoped audit follows only explicit counterpart references. It intentionally
// does not query the collection: a missing counterpart remains legal and must
// never cause a broad scan.
export const buildScopedMovementCounterpartSeasonIds = ({ teamSeasons = [] } = {}) => {
  const ids = new Set()

  ;(Array.isArray(teamSeasons) ? teamSeasons : []).forEach(row => {
    const season = row?.data || {}
    const seasonKey = String(season.seasonKey || season.seasonId || '').trim()
    const localTeamId = String(season.birthTeamDocumentId || season.teamDocumentId || '').trim()
    if (!seasonKey) return

    ;(Array.isArray(season.transfersIn) ? season.transfersIn : []).forEach(incoming => {
      const sourceTeamId = String(incoming?.fromBirthTeamDocumentId || '').trim()
      if (sourceTeamId && sourceTeamId !== localTeamId) ids.add(buildTeamSeasonDocumentId(sourceTeamId, seasonKey))
    })
    ;(Array.isArray(season.transfersOut) ? season.transfersOut : []).forEach(outgoing => {
      const targetTeamId = String(outgoing?.toBirthTeamDocumentId || '').trim()
      if (targetTeamId && targetTeamId !== localTeamId) ids.add(buildTeamSeasonDocumentId(targetTeamId, seasonKey))
    })
  })

  return [...ids].filter(Boolean)
}

const readScopedSnapshot = async (scope, { includeWriteRecovery = true } = {}) => {
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
  const counterpartSeasonIds = buildScopedMovementCounterpartSeasonIds({
    teamSeasons: seasonResult.rows,
  }).filter(id => !seasonIds.includes(id))
  const counterpartSeasonResult = await readDocumentsById({
    collectionName: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
    ids: counterpartSeasonIds,
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
  const writeActionsResult = includeWriteRecovery
    ? await readActiveWriteRecoveryActions()
    : { rows: [], readsUsed: 0 }

  return {
    generatedAt: new Date().toISOString(),
    readsUsed: rootResult.readsUsed + seasonResult.readsUsed + counterpartSeasonResult.readsUsed +
      indexResults.reduce((total, result) => total + result.readsUsed, 0) +
      playerResult.readsUsed + leagueResult.readsUsed + favoritesResult.readsUsed +
      writeActionsResult.readsUsed,
    rows: {
      leagues: leagueResult.rows,
      leaguesMaster: [],
      clubs: [],
      clubsMaster: [],
      teams: rootResult.rows,
      teamSeasons: uniqueRows([...seasonResult.rows, ...counterpartSeasonResult.rows]),
      players: playerResult.rows,
      favorites: favoritesResult.rows,
      searchIndexes,
      writeActions: writeActionsResult.rows,
    },
  }
}

const readClubTeamSeasonScopedSnapshot = async (scope, { includeWriteRecovery = true } = {}) => {
  const base = await readScopedSnapshot({
    type: AUDIT_SCOPE_TYPE.TEAM_SEASON,
    teamDocumentId: scope.teamDocumentId,
    seasonKey: scope.seasonKey,
  }, { includeWriteRecovery })
  const counterpartTeamIds = base.rows.teamSeasons
    .map(row => String(row.data?.birthTeamDocumentId || row.data?.teamDocumentId || '').trim())
    .filter(Boolean)
  const knownTeamIds = new Set(base.rows.teams.map(row => row.id))
  const counterpartRoots = await readDocumentsById({
    collectionName: PLAYERS_DATABASE_COLLECTIONS.teams,
    ids: counterpartTeamIds.filter(id => !knownTeamIds.has(id)),
  })
  const teams = uniqueRows([...base.rows.teams, ...counterpartRoots.rows])
  const clubIds = [...new Set([
    scope.clubId,
    ...teams.map(row => String(row.data?.clubId || '').trim()),
  ].filter(Boolean))]
  const [clubResult, clubsMasterResult, leagueResult] = await Promise.all([
    readDocumentsById({ collectionName: PLAYERS_DATABASE_COLLECTIONS.clubs, ids: clubIds }),
    readDocumentsById({ collectionName: PLAYERS_DATABASE_COLLECTIONS.clubsMaster, ids: ['all'] }),
    readDocumentsById({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.leagues,
      ids: [...new Set(base.rows.teamSeasons.map(row => row.data?.leagueId).filter(Boolean))],
    }),
  ])

  return {
    ...base,
    readsUsed: base.readsUsed + counterpartRoots.readsUsed + clubResult.readsUsed + clubsMasterResult.readsUsed + leagueResult.readsUsed,
    rows: {
      ...base.rows,
      leagues: leagueResult.rows,
      clubs: clubResult.rows,
      clubsMaster: clubsMasterResult.rows,
      teams,
    },
  }
}
const readLeagueSeasonScopedSnapshot = async scope => {
  const leagueResult = await readDocumentsById({
    collectionName: PLAYERS_DATABASE_COLLECTIONS.leagues,
    ids: [scope.leagueId],
  })
  const league = leagueResult.rows[0]
  const data = league?.data || {}
  const current = data.current || {}
  const season = String(current.seasonKey || current.seasonId || '').trim() === scope.seasonKey
    ? current
    : (Array.isArray(data.history) ? data.history : []).find(item => (
      String(item?.seasonKey || item?.seasonId || '').trim() === scope.seasonKey
    )) || {}
  const teamScopes = (Array.isArray(season.tableRank) ? season.tableRank : [])
    .map(row => ({
      teamDocumentId: String(row?.birthTeamDocumentId || row?.teamDocumentId || row?.birthTeamId || row?.teamId || '').trim(),
      seasonKey: scope.seasonKey,
    }))
    .filter(item => item.teamDocumentId)

  // A League receipt Audit reads one exact League document and the explicit
  // Team Seasons listed in its table. It deliberately excludes the global
  // recovery-journal query, so this path never expands into a broad scan.
  const scoped = await readScopedSnapshot(
    { type: AUDIT_SCOPE_TYPE.TEAM_SEASONS, scopes: teamScopes },
    { includeWriteRecovery: false }
  )
  return {
    ...scoped,
    readsUsed: scoped.readsUsed + leagueResult.readsUsed,
    rows: { ...scoped.rows, leagues: leagueResult.rows },
  }
}

// A full-system audit reads every canonical collection. A Team/Season audit
// assembles only the explicit relation set needed for that Team/Season.
export async function readPlayerDatabaseAuditSnapshot({ scope, includeWriteRecovery = true } = {}) {
  const normalizedScope = normalizeAuditScope(scope)
  if (normalizedScope.type === AUDIT_SCOPE_TYPE.LEAGUE_SEASON) {
    return readLeagueSeasonScopedSnapshot(normalizedScope)
  }
  if (normalizedScope.type === AUDIT_SCOPE_TYPE.CLUB_TEAM_SEASON) {
    return readClubTeamSeasonScopedSnapshot(normalizedScope, { includeWriteRecovery })
  }
  if (normalizedScope.type !== AUDIT_SCOPE_TYPE.FULL_SYSTEM) {
    return readScopedSnapshot(normalizedScope, { includeWriteRecovery })
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
