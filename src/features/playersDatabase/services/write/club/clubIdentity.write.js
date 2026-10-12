// src/features/playersDatabase/services/write/club/clubIdentity.write.js

import { collection, doc, FieldPath, Timestamp } from 'firebase/firestore'
import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDocsFromServer, trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS as collections } from '../../../constants/pdb.constants.js'
import { appendClubAliases, assertClubNamesAvailable, uniqueClubAliases } from '../../../domain/clubIdentity.js'
import { buildClubDirectoryProjection } from '../../../domain/projections/club/clubDirectory.projection.js'
import { invalidateDocumentCacheByPrefixKeepingSnapshot } from '../../cache/index.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const usage = { feature: 'playersDatabase', action: 'club-identity-write' }
const requireData = snapshot => {
  if (!snapshot.exists()) throw new Error('מסמך מועדון או ספרייה מחויב חסר; לא בוצעה שמירה')
  return snapshot.data()
}

// League aliases and its canonical table commit together; recovery only rebuilds projections.
export const writeClubIdentityChanges = async ({ edits, leagueWrite = null, replace = false }) => {
  const ids = [...new Set(edits.map(edit => clean(edit.clubId)))]
  if (ids.some(id => !id || id.includes('/'))) throw new Error('מזהה מועדון לא תקין')
  const directoryRef = doc(db, collections.clubsDirectory, 'all')
  const profileRefs = ids.map(id => doc(db, collections.clubProfiles, id))
  const centers = replace
    ? await trackedGetDocsFromServer(collection(db, collections.clubsCenter), usage)
    : { docs: [] }
  const updatedAt = Timestamp.now()
  const result = await trackedRunTransaction(db, async transaction => {
    const directory = requireData(await transaction.get(directoryRef))
    const profiles = []
    for (const ref of profileRefs) profiles.push(requireData(await transaction.get(ref)))
    const centerSnapshots = []
    for (const item of centers.docs) centerSnapshots.push(await transaction.get(item.ref))
    const clubsById = { ...directory.clubsById }
    const changes = []
    ids.forEach((id, index) => {
      const profile = profiles[index]
      if (profile.clubId !== id || !clubsById[id]) throw new Error('זהות המועדון חסרה או סותרת')
      const selected = edits.filter(edit => clean(edit.clubId) === id)
      const input = selected[0]
      const aliases = replace
        ? uniqueClubAliases(input.aliases)
        : appendClubAliases({ profile, aliases: selected.flatMap(edit => edit.aliases || []) })
      const names = replace
        ? { ...profile.names, display: clean(input.displayName), short: clean(input.shortName) }
        : profile.names
      if (replace && !names.display) throw new Error('יש להזין שם תצוגה למועדון')
      // The editor shows both alias lists, so removing a name removes its search copy too.
      const searchAliases = replace
        ? (profile.searchAliases || []).filter(alias => aliases.includes(alias))
        : profile.searchAliases || []
      const next = { ...profile, names, aliases, searchAliases }
      const proposed = replace ? [names.display, names.short, ...aliases] : aliases
      assertClubNamesAvailable({ clubId: id, names: proposed, clubsById })
      clubsById[id] = next
      const projection = buildClubDirectoryProjection({ profile: next, updatedAt })
      changes.push({ id, profile, next, projection, ref: profileRefs[index] })
    })
    let changedCount = 0
    changes.forEach(({ id, profile, next, projection, ref }) => {
      if (JSON.stringify([profile.names, profile.aliases, profile.searchAliases || []]) !==
        JSON.stringify([next.names, next.aliases, next.searchAliases])) {
        transaction.update(ref, {
          names: next.names, aliases: next.aliases, searchAliases: next.searchAliases,
          'timestamps.updatedAt': updatedAt,
        })
        changedCount += 1
      }
      const oldProjection = buildClubDirectoryProjection({ profile: directory.clubsById[id] })
      const newProjection = buildClubDirectoryProjection({ profile: next })
      if (JSON.stringify(oldProjection) !== JSON.stringify(newProjection)) {
        transaction.update(directoryRef, new FieldPath('clubsById', id), projection, 'updatedAt', updatedAt)
        changedCount += 1
      }
      centerSnapshots.forEach(snapshot => {
        if (!snapshot.exists()) return
        const entry = snapshot.data().clubsById?.[id]
        if (!entry || (entry.displayName === next.names.display && entry.shortName === next.names.short)) return
        transaction.update(snapshot.ref,
          new FieldPath('clubsById', id, 'displayName'), next.names.display,
          new FieldPath('clubsById', id, 'shortName'), next.names.short,
          'updatedAt', updatedAt)
        changedCount += 1
      })
    })
    if (leagueWrite) transaction.set(leagueWrite.ref, leagueWrite.document)
    return { completed: true, changedCount }
  }, usage)
  const prefixes = ['club', 'clubsDirectory', 'clubsCenter']
  prefixes.forEach(invalidateDocumentCacheByPrefixKeepingSnapshot)
  return result
}

export const updateClubIdentity = ({
  clubId,
  displayName,
  shortName,
  aliases,
}) => (
  writeClubIdentityChanges({ edits: [{ clubId, displayName, shortName, aliases }], replace: true })
)
