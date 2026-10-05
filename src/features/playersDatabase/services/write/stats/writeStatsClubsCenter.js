// src/features/playersDatabase/services/write/stats/writeStatsClubsCenter.js

import { FieldPath, doc, setDoc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

export const writeStatsClubsCenter = async ({ approvedState = {} } = {}) => {
  const target = approvedState.clubsCenterProjection || {}
  const team = target.team || {}
  if (!target.seasonId || !target.clubId || !target.teamId) {
    throw new Error('Missing Stats ClubsCenter projection target')
  }
  const teamPath = (...parts) => new FieldPath(
    'clubsById', target.clubId, 'teamsById', target.teamId, ...parts
  )

  await setDoc(
    doc(db, PLAYERS_DATABASE_COLLECTIONS.clubsCenter, target.seasonId),
    {
      clubsById: {
        [target.clubId]: {
          teamsById: {
            [target.teamId]: team,
          },
        },
      },
      updatedAt: target.updatedAt || null,
    },
    {
      mergeFields: [
        teamPath('documentationState'),
        teamPath('documentationStateUpdatedAt'),
        teamPath('teamTaskSignals'),
        teamPath('updatedAt'),
        'updatedAt',
      ],
    }
  )

  return { written: true }
}
