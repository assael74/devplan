// features/playersDatabase/services/write/players/playerSeasonDelete.js

import {
  deleteField,
  doc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import {
  createTrackedWriteBatch,
  trackedGetDoc,
} from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import {
  buildSeasonKey,
  clean,
} from '../leagues/leagueDoc.js'
import {
  buildPlayerSeasonScope,
  isSamePlayerSeasonScope,
} from '../shared/playerSeasonScope.js'

const shouldRemoveSeason = ({
  row = {},
  season = {},
  team = {},
} = {}) =>
  isSamePlayerSeasonScope(
    row,
    buildPlayerSeasonScope({
      season,
      team,
    })
  )

export async function removePlayerSeasonDocsMany({
  season = {},
  team = {},
  playerDocumentIds = [],
  target = '',
} = {}) {
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const leagueId = clean(season.leagueId || team.leagueId)
  const ids = [...new Set((Array.isArray(playerDocumentIds) ? playerDocumentIds : []).map(clean).filter(Boolean))]
  if (!seasonId && !seasonKey) return { rowsCount: 0 }
  if (!ids.length) return { rowsCount: 0 }

  const batch = createTrackedWriteBatch(db, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.players,
    action: 'remove-player-seasons',
    operationSubtype: 'maintenance-batch',
  })
  let rowsCount = 0
  let updatedCount = 0
  let deletedCount = 0

  for (const playerDocumentId of ids) {
    const ref = doc(db, PLAYERS_DATABASE_COLLECTIONS.players, playerDocumentId)
    const snapshot = await trackedGetDoc(ref, {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.players,
      action: 'remove-player-seasons',
      operationSubtype: 'maintenance-getDoc',
    })
    if (!snapshot.exists()) continue

    const data = snapshot.data() || {}
    const removeFromRows = rows =>
      (Array.isArray(rows) ? rows : []).filter(row => !shouldRemoveSeason({
        row,
        season: {
          ...season,
          seasonId,
          seasonKey,
          leagueId,
        },
        team: {
          ...team,
          leagueId,
        },
      }))
    const current = removeFromRows(data.current)
    const history = removeFromRows(data.history)
    const changed =
      current.length !== (Array.isArray(data.current) ? data.current.length : 0) ||
      history.length !== (Array.isArray(data.history) ? data.history.length : 0)

    if (!changed) continue

    rowsCount += 1

    if (!current.length && !history.length) {
      deletedCount += 1
      batch.delete(ref)
      continue
    }

    updatedCount += 1
    batch.set(
      ref,
      {
        current,
        history,
        scoutProfiles: deleteField(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  }

  if (rowsCount) {
    await batch.commit()
  }

  return {
    rowsCount,
    updatedCount,
    deletedCount,
    target: clean(target),
  }
}

