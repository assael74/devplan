// src/features/playersDatabase/services/write/roster/writeRosterCanonical.js

import { deleteDoc, deleteField, doc, setDoc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { hasTeamNoteData } from '../../../model/team/teamNotes.model.js'

const usage = { feature: 'playersDatabase', action: 'roster-team-root-write' }

export const writeRosterCanonical = async ({ approvedState = {} } = {}) => {
  const canonical = approvedState.canonical || {}
  const teamId = String(approvedState.teamId || '').trim()
  const teamSeasonDocumentId = String(approvedState.teamSeasonDocumentId || '').trim()
  if (!teamId || !teamSeasonDocumentId) throw new Error('Missing approved Roster canonical identity')

  let teamRootWritten = false
  let teamRootDeleted = false
  let teamSeasonWritten = false
  let teamSeasonDeleted = false

  if (canonical.teamRootOperation === 'SET' || canonical.teamRootOperation === 'DELETE') {
    const identity = canonical.teamRoot && canonical.teamRoot.identity
    if (canonical.teamRootOperation === 'SET' && (!identity || identity.teamId !== teamId)) {
      throw new Error('Approved Team Root identity mismatch')
    }
    const reference = doc(db, PLAYERS_DATABASE_COLLECTIONS.teamRoots, teamId)
    const outcome = await trackedRunTransaction(db, async transaction => {
      const snapshot = await transaction.get(reference)
      const current = snapshot.exists() ? snapshot.data() : null
      if (current && current.identity?.teamId !== teamId) {
        throw new Error('Existing Team Root identity mismatch')
      }
      if (canonical.teamSeasonOperation === 'SET') {
        if (!current) {
          transaction.set(reference, canonical.teamRoot)
        } else {
          transaction.update(reference, {
            [`seasonRefsById.${approvedState.seasonId}`]: canonical.teamRoot.seasonRefsById[approvedState.seasonId],
            'timestamps.updatedAt': canonical.teamRoot.timestamps.updatedAt,
          })
        }
        return 'written'
      }
      if (!current) return 'none'
      const refs = current.seasonRefsById || {}
      const remainingRefs = Object.keys(refs).filter(id => id !== approvedState.seasonId)
      if (!remainingRefs.length && !hasTeamNoteData(current.notes)) {
        transaction.delete(reference)
        return 'deleted'
      }
      transaction.update(reference, {
        [`seasonRefsById.${approvedState.seasonId}`]: deleteField(),
        'timestamps.updatedAt': approvedState.updatedAt || canonical.teamRoot?.timestamps?.updatedAt || new Date().toISOString(),
      })
      return 'written'
    }, usage)
    teamRootWritten = outcome === 'written'
    teamRootDeleted = outcome === 'deleted'
  } else if (canonical.teamRootOperation !== 'NONE') {
    throw new Error('Invalid Team Root write operation')
  }

  if (canonical.teamSeasonOperation === 'SET') {
    const identity = canonical.teamSeason && canonical.teamSeason.identity
    if (
      !identity ||
      identity.teamSeasonDocumentId !== teamSeasonDocumentId ||
      identity.teamId !== teamId ||
      identity.seasonId !== approvedState.seasonId
    ) {
      throw new Error('Approved Team Season identity mismatch')
    }
    await setDoc(doc(db, PLAYERS_DATABASE_COLLECTIONS.teamSeasons, teamSeasonDocumentId), canonical.teamSeason, {
      mergeFields: Object.keys(canonical.teamSeason),
    })
    teamSeasonWritten = true
  } else if (canonical.teamSeasonOperation === 'DELETE') {
    await deleteDoc(doc(db, PLAYERS_DATABASE_COLLECTIONS.teamSeasons, teamSeasonDocumentId))
    teamSeasonDeleted = true
  } else if (canonical.teamSeasonOperation !== 'NONE') {
    throw new Error('Invalid Team Season write operation')
  }

  return { teamRootWritten, teamRootDeleted, teamSeasonWritten, teamSeasonDeleted }
}

export default writeRosterCanonical
