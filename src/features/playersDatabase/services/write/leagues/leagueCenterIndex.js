import { doc, runTransaction, serverTimestamp } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import {
  buildLeagueCenterRows,
} from '../../../model/leagueCenter.model.js'

const INDEX_DOC_ID = 'all'

const clean = value => String(value ?? '').trim()

const leagueCenterIndexRef = () =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.leagueCenterIndex, INDEX_DOC_ID)

const leagueRef = leagueId =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.leagues, clean(leagueId))

const buildRowsById = rows => {
  const map = new Map()

  ;(Array.isArray(rows) ? rows : []).forEach(row => {
    const id = clean(row?.id)
    if (!id) return
    map.set(id, row)
  })

  return map
}

const upsertRows = ({
  currentRows = [],
  leagueRows = [],
} = {}) => {
  const map = buildRowsById(currentRows)

  leagueRows.forEach(row => {
    const id = clean(row?.id)
    if (!id) return
    map.set(id, row)
  })

  return Array.from(map.values())
}

export async function syncLeagueCenterIndexRows({
  leagues = [],
  selectedSeasonKey = '',
  removedLeagueIds = [],
} = {}) {
  const safeLeagues = Array.isArray(leagues) ? leagues : []
  const safeRemovedIds = new Set((Array.isArray(removedLeagueIds) ? removedLeagueIds : []).map(clean).filter(Boolean))

  if (!safeLeagues.length && !safeRemovedIds.size) return null

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(leagueCenterIndexRef())
    const existingRows = snapshot.exists() && Array.isArray(snapshot.data()?.rows)
      ? snapshot.data().rows
      : buildLeagueCenterRows({ leagueDocs: [] })
    const leagueRows = []

    for (const league of safeLeagues) {
      const leagueId = clean(league?.id || league?.leagueId)
      if (!leagueId) continue

      const leagueSnapshot = await transaction.get(leagueRef(leagueId))
      const leagueData = leagueSnapshot.exists()
        ? { id: leagueId, ...leagueSnapshot.data() }
        : { ...league, id: leagueId }

      const row = buildLeagueCenterRows({
        leagueDocs: [leagueData],
        selectedSeasonKey,
      }).find(item => clean(item.id) === leagueId)

      if (row) leagueRows.push(row)
    }

    const nextRows = upsertRows({
      currentRows: existingRows,
      leagueRows,
    }).filter(row => !safeRemovedIds.has(clean(row.id)))

    transaction.set(leagueCenterIndexRef(), {
      id: INDEX_DOC_ID,
      rows: nextRows,
      rowsById: Object.fromEntries(nextRows.map(row => [row.id, row])),
      updatedAt: serverTimestamp(),
    }, { merge: true })

    return {
      updated: true,
      rowsCount: nextRows.length,
    }
  })
}
