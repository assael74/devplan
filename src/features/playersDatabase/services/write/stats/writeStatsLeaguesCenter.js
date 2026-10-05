// src/features/playersDatabase/services/write/stats/writeStatsLeaguesCenter.js

import { FieldPath, doc, setDoc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

export const writeStatsLeaguesCenter = async ({ approvedState = {} } = {}) => {
  const target = approvedState.leaguesCenterProjection || {}
  const team = target.team || {}
  if (!target.leagueId || !target.seasonId || !target.teamId) {
    throw new Error('Missing Stats LeaguesCenter projection target')
  }
  const teamPath = (...parts) => new FieldPath(
    'leaguesById', target.leagueId, 'seasonsById', target.seasonId, 'teamsById', target.teamId, ...parts
  )
  const seasonPath = (...parts) => new FieldPath(
    'leaguesById', target.leagueId, 'seasonsById', target.seasonId, ...parts
  )

  await setDoc(
    doc(db, PLAYERS_DATABASE_COLLECTIONS.leaguesCenter, 'all'),
    {
      leaguesById: {
        [target.leagueId]: {
          seasonsById: {
            [target.seasonId]: {
              teamsById: {
                [target.teamId]: team,
              },
              updatedAt: target.updatedAt || null,
            },
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
        seasonPath('updatedAt'),
        'updatedAt',
      ],
    }
  )

  return { written: true }
}
