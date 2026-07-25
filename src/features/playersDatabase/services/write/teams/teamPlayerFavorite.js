// features/playersDatabase/services/write/teams/teamPlayerFavorite.js

import {
  collection,
  getDocs,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { clean } from '../leagues/leagueDoc.js'

const updatePlayersInSeasonRows = ({ rows = [], playerId = '', favorite = false }) => {
  let updatedPlayersCount = 0
  let changed = false

  const nextRows = (Array.isArray(rows) ? rows : []).map(row => {
    const teamPlayers = Array.isArray(row?.teamPlayers) ? row.teamPlayers : []
    let rowChanged = false

    const nextPlayers = teamPlayers.map(player => {
      if (clean(player?.playerId) !== playerId) return player

      updatedPlayersCount += 1
      rowChanged = true

      return {
        ...player,
        favorite: Boolean(favorite),
        updatedAt: new Date().toISOString(),
      }
    })

    if (!rowChanged) return row

    changed = true

    return {
      ...row,
      teamPlayers: nextPlayers,
      updatedAt: new Date().toISOString(),
    }
  })

  return {
    rows: nextRows,
    changed,
    updatedPlayersCount,
  }
}

export async function updatePlayerFavoriteInAllTeamSeasons({
  player = {},
  favorite = false,
} = {}) {
  const playerId = clean(player.playerId)
  if (!playerId) throw new Error('Missing player id')

  const snapshot = await getDocs(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.teams)
  )
  const batch = writeBatch(db)
  let documentsCount = 0
  let rowsCount = 0

  snapshot.docs.forEach(teamSnapshot => {
    const data = teamSnapshot.data() || {}
    const currentResult = updatePlayersInSeasonRows({
      rows: data.current,
      playerId,
      favorite,
    })
    const historyResult = updatePlayersInSeasonRows({
      rows: data.history,
      playerId,
      favorite,
    })

    if (!currentResult.changed && !historyResult.changed) return

    documentsCount += 1
    rowsCount += (
      currentResult.updatedPlayersCount +
      historyResult.updatedPlayersCount
    )

    batch.set(
      teamSnapshot.ref,
      {
        current: currentResult.rows,
        history: historyResult.rows,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  })

  if (documentsCount > 0) {
    await batch.commit()
  }

  return {
    playerId,
    favorite: Boolean(favorite),
    documentsCount,
    rowsCount,
    updated: rowsCount > 0,
  }
}
