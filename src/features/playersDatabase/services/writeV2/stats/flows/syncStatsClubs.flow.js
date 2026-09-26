// src/features/playersDatabase/services/writeV2/stats/flows/syncStatsClubs.flow.js

import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { APPROVED_STATS_STATE_VERSION } from '../../../../domain/statsV2/approvedStatsState.builder.js'
import { invalidateClubsMasterDocumentCache } from '../../../cache/index.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)

const CLUB_OWNED_FIELDS = new Set(['ageGroups', 'competitionPaths'])
const MASTER_ENTRY_OWNED_FIELDS = new Set([
  'name', 'clubLevel', 'ageGroups', 'competitionPaths', 'currentSeason', 'previousSeason',
])

const pickAllowed = (source, allowed, code) => {
  const input = source && typeof source === 'object' && !Array.isArray(source) ? source : {}
  const invalid = Object.keys(input).find(key => !allowed.has(key))
  if (invalid) {
    const error = new Error(`Stats V2 cannot write field: ${invalid}`)
    error.code = code
    throw error
  }
  return { ...input }
}

const upsertMasterEntries = ({ current = [], approved = [] } = {}) => {
  const byId = new Map((Array.isArray(current) ? current : []).map(row => [clean(row?.clubId), row]))
  approved.forEach(entry => {
    const clubId = clean(entry?.clubId)
    const existing = byId.get(clubId) || { clubId }
    const fields = pickAllowed(entry?.fields, MASTER_ENTRY_OWNED_FIELDS, 'STATS_CLUBS_MASTER_OWNERSHIP_INVALID')
    byId.set(clubId, { ...existing, ...fields, clubId })
  })
  return [...byId.values()].sort((left, right) => (
    clean(left?.name).localeCompare(clean(right?.name), 'he') ||
    clean(left?.clubId).localeCompare(clean(right?.clubId))
  ))
}

export async function syncStatsClubsV2({ approvedState } = {}) {
  if (approvedState?.planType !== 'approvedStatsState' ||
      approvedState?.planVersion !== APPROVED_STATS_STATE_VERSION) {
    const error = new Error('Invalid Approved Stats State')
    error.code = 'STATS_APPROVED_STATE_INVALID'
    throw error
  }

  const patches = Array.isArray(approvedState.clubProjectionPatches)
    ? approvedState.clubProjectionPatches
    : []
  const masterPatch = approvedState.clubsMasterPatch
  const reads = await Promise.all([
    ...patches.map(async patch => {
      const ref = doc(db, PLAYERS_DATABASE_COLLECTIONS.clubs, patch.clubId)
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        const error = new Error(`Club not found: ${patch.clubId}`)
        error.code = 'STATS_CLUB_NOT_FOUND'
        throw error
      }
      return { patch, ref, current: snap.data() || {} }
    }),
    (async () => {
      const ref = doc(db, PLAYERS_DATABASE_COLLECTIONS.clubsMaster, masterPatch.id || 'all')
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        const error = new Error('Clubs Master not found')
        error.code = 'STATS_CLUBS_MASTER_NOT_FOUND'
        throw error
      }
      return { ref, current: snap.data() || {} }
    })(),
  ])

  const masterRead = reads[reads.length - 1]
  const clubReads = reads.slice(0, -1)
  const nextClubs = clubReads.map(({ patch, ref, current }) => {
    const fields = pickAllowed(patch.fields, CLUB_OWNED_FIELDS, 'STATS_CLUB_OWNERSHIP_INVALID')
    return { ref, current, next: { ...current, ...fields } }
  })
  const nextMasterClubs = upsertMasterEntries({
    current: masterRead.current.clubs,
    approved: masterPatch.entries,
  })
  const masterChanged = !same(masterRead.current.clubs, nextMasterClubs)
  const changedClubs = nextClubs.filter(item => !same(item.current, item.next))

  if (!changedClubs.length && !masterChanged) {
    return { updatedClubs: 0, masterUpdated: false, skipped: true }
  }

  const batch = writeBatch(db)
  changedClubs.forEach(({ ref, next }) => batch.set(ref, { ...next, updatedAt: serverTimestamp() }))
  if (masterChanged) {
    batch.set(masterRead.ref, { ...masterRead.current, clubs: nextMasterClubs, updatedAt: serverTimestamp() })
  }
  await batch.commit()
  if (masterChanged) invalidateClubsMasterDocumentCache()

  return { updatedClubs: changedClubs.length, masterUpdated: masterChanged, skipped: false }
}
