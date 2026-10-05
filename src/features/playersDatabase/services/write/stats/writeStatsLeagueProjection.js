// src/features/playersDatabase/services/write/stats/writeStatsLeagueProjection.js

import { FieldPath, doc, setDoc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

export const writeStatsLeagueProjection = async ({ approvedState = {} } = {}) => {
  const target = approvedState.leagueProjection || {}
  if (!target.leagueId || !target.seasonId || !target.teamId || !target.patch) {
    throw new Error('Missing Stats League projection target')
  }
  const reference = doc(db, PLAYERS_DATABASE_COLLECTIONS.leagues, target.leagueId)
  const teamPath = (...parts) => new FieldPath(
    'seasonsById', target.seasonId, 'table', 'teamsById', target.teamId, ...parts
  )

  await setDoc(reference, {
    seasonsById: {
      [target.seasonId]: {
        table: {
          teamsById: {
            [target.teamId]: target.patch,
          },
        },
      },
    },
  }, {
    mergeFields: [
      teamPath('stats'),
      teamPath('scouting'),
      teamPath('updatedAt'),
    ],
  })

  return { written: true, leagueId: target.leagueId }
}
