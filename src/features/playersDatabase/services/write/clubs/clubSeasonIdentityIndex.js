import { doc, serverTimestamp } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import {
  buildClubSeasonIdentityIndexDocumentId,
  CLUB_SEASON_IDENTITY_INDEX_DOCUMENT_CATALOG,
  CLUB_SEASON_IDENTITY_INDEX_PROJECTION_VERSION,
} from '../../../catalog/firestoreDocuments/clubSeasonIdentityIndex.catalog.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const indexRef = ({ seasonKey, birthYear }) => doc(
  db,
  PLAYERS_DATABASE_COLLECTIONS.clubsMaster,
  buildClubSeasonIdentityIndexDocumentId({ seasonKey, birthYear })
)

const sortEntries = entries => [...entries].sort((left, right) => (
  clean(left.clubId).localeCompare(clean(right.clubId)) ||
  Number(left.teamSlot || 1) - Number(right.teamSlot || 1) ||
  clean(left.leagueId).localeCompare(clean(right.leagueId))
))

export const buildLeagueClubSeasonIdentityEntries = ({ league = {}, season = {}, rows = [] } = {}) => {
  const seasonKey = clean(season.seasonKey || season.seasonId)
  const birthYear = Number(season.birthYear) || 0
  const leagueId = clean(league.id || league.leagueId || season.leagueId)
  const leagueName = clean(league.name || league.leagueName)
  const leagueLevel = Number(league.level) || 0
  const ageGroupId = clean(league.ageGroupId || season.ageGroupId)

  if (!seasonKey || !birthYear || !leagueId) return []

  const entries = new Map()
  ;(Array.isArray(rows) ? rows : []).forEach(row => {
    const clubId = clean(row?.clubId)
    const teamId = clean(row?.teamId || row?.birthTeamId)
    if (!clubId || !teamId) return

    const teamSlot = Number(row?.birthTeamSlot || row?.teamSlot || 1) || 1
    const entry = {
      clubId,
      clubName: clean(row?.clubName || row?.club || row?.teamName),
      ageGroupId,
      teamId,
      teamSlot,
      leagueId,
      leagueName,
      leagueLevel,
    }
    entries.set(`${clubId}::${teamSlot}::${teamId}`, entry)
  })

  return sortEntries([...entries.values()])
}

export async function syncLeagueClubSeasonIdentityIndex({
  league = {},
  season = {},
  rows = [],
  lastWriteAction = 'PASTE_LEAGUE_TABLE',
} = {}) {
  const seasonKey = clean(season.seasonKey || season.seasonId)
  const birthYear = Number(season.birthYear) || 0
  const leagueId = clean(league.id || league.leagueId || season.leagueId)
  const id = buildClubSeasonIdentityIndexDocumentId({ seasonKey, birthYear })
  if (!id || !leagueId) return { changed: false, writeSkipped: true, reason: 'missingIdentityScope' }

  const entriesForLeague = buildLeagueClubSeasonIdentityEntries({ league, season, rows })
  return trackedRunTransaction(db, async transaction => {
    const ref = indexRef({ seasonKey, birthYear })
    const snapshot = await transaction.get(ref)
    const existing = snapshot.exists() ? snapshot.data() || {} : CLUB_SEASON_IDENTITY_INDEX_DOCUMENT_CATALOG
    const existingEntries = Array.isArray(existing.entries) ? existing.entries : []
    const previousEntriesForLeague = existingEntries
      .filter(entry => clean(entry?.leagueId) === leagueId)
    const retained = existingEntries
      .filter(entry => clean(entry?.leagueId) !== leagueId)
    const entries = sortEntries([...retained, ...entriesForLeague])
    // A team can move to another Club without changing its team id. Treat the
    // old Club/team pair as removed as well, otherwise its Club projection is
    // never cleaned during a corrected League import.
    const currentClubTeamKeys = new Set(entriesForLeague.map(entry => (
      `${clean(entry?.clubId)}::${clean(entry?.teamId)}`
    )))
    const removedEntries = previousEntriesForLeague.filter(entry => (
      !currentClubTeamKeys.has(`${clean(entry?.clubId)}::${clean(entry?.teamId)}`)
    ))
    const changed = !snapshot.exists() || JSON.stringify(existing.entries || []) !== JSON.stringify(entries)

    if (changed) {
      transaction.set(ref, {
        documentType: 'clubSeasonIdentityIndex',
        projectionVersion: CLUB_SEASON_IDENTITY_INDEX_PROJECTION_VERSION,
        seasonKey,
        birthYear,
        entries,
        updatedAt: serverTimestamp(),
        lastWriteAction: clean(lastWriteAction),
        lastWriteAt: serverTimestamp(),
      })
    }

    return {
      id,
      changed,
      updated: changed,
      writeSkipped: !changed,
      entriesCount: entries.length,
      removedEntries,
    }
  }, {
    feature: 'playersDatabase',
    action: 'club-season-identity-index-sync',
    collection: PLAYERS_DATABASE_COLLECTIONS.clubsMaster,
  })
}

export async function removeLeagueClubSeasonIdentityIndex({
  league = {},
  season = {},
  lastWriteAction = 'REMOVE_LEAGUE_SEASON',
} = {}) {
  const seasonKey = clean(season.seasonKey || season.seasonId)
  const birthYear = Number(season.birthYear) || 0
  const leagueId = clean(league.id || league.leagueId || season.leagueId)
  const id = buildClubSeasonIdentityIndexDocumentId({ seasonKey, birthYear })
  if (!id || !leagueId) return { changed: false, writeSkipped: true, reason: 'missingIdentityScope' }

  return trackedRunTransaction(db, async transaction => {
    const ref = indexRef({ seasonKey, birthYear })
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) return { id, changed: false, updated: false, writeSkipped: true, entriesCount: 0 }

    const existing = snapshot.data() || {}
    const entries = (Array.isArray(existing.entries) ? existing.entries : [])
      .filter(entry => clean(entry?.leagueId) !== leagueId)
    const changed = entries.length !== (existing.entries || []).length
    if (changed) {
      transaction.set(ref, {
        ...existing,
        entries: sortEntries(entries),
        updatedAt: serverTimestamp(),
        lastWriteAction: clean(lastWriteAction),
        lastWriteAt: serverTimestamp(),
      })
    }
    return { id, changed, updated: changed, writeSkipped: !changed, entriesCount: entries.length }
  }, {
    feature: 'playersDatabase',
    action: 'club-season-identity-index-remove',
    collection: PLAYERS_DATABASE_COLLECTIONS.clubsMaster,
  })
}
