// src/features/playersDatabase/services/write/league/writeLeagueCanonical.js

import { doc, setDoc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { requireLeagueId } from '../../../domain/league/leagueIdentity.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const requireCanonicalDocument = ({ document, leagueId }) => {
  if (!document || typeof document !== 'object' || Array.isArray(document)) {
    throw new Error('Missing canonical League document')
  }

  if (clean(document.leagueId) !== leagueId) {
    throw new Error('Canonical League document identity does not match target league')
  }

  return document
}

export const writeLeagueCanonical = async ({ approvedState = {} } = {}) => {
  const leagueId = requireLeagueId(approvedState.leagueId)
  const canonicalWriteRequired = approvedState.canonicalWriteRequired !== false

  if (!canonicalWriteRequired) {
    return {
      leagueId,
      written: false,
      skipped: true,
    }
  }

  const document = requireCanonicalDocument({
    document: approvedState.document,
    leagueId,
  })
  const reference = doc(
    db,
    PLAYERS_DATABASE_COLLECTIONS.leagues,
    leagueId
  )

  await setDoc(reference, document)

  return {
    leagueId,
    written: true,
    skipped: false,
  }
}

export default writeLeagueCanonical
