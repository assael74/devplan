// src/features/playersDatabase/services/write/roster/writeRosterLeaguesCenter.js

import { FieldPath, doc, setDoc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

export const writeRosterLeaguesCenter = async ({ approvedState = {} } = {}) => {
  const target = approvedState.leaguesCenterProjection || {}
  if (target.writeRequired === false) return { written: false, skipped: true }

  const leagueId = clean(target.leagueId)
  const seasonId = clean(target.seasonId)
  const teamId = clean(target.teamId)
  const team = target.team
  if (!leagueId || !seasonId || !teamId || !team) {
    throw new Error('Invalid approved LeaguesCenter roster projection')
  }

  const teamPath = new FieldPath('leaguesById', leagueId, 'seasonsById', seasonId, 'teamsById', teamId)
  await setDoc(doc(db, PLAYERS_DATABASE_COLLECTIONS.leaguesCenter, 'all'), {
    leaguesById: {
      [leagueId]: {
        seasonsById: {
          [seasonId]: {
            teamsById: {
              [teamId]: team,
            },
          },
        },
      },
    },
    updatedAt: target.updatedAt || null,
  }, { mergeFields: [teamPath, 'updatedAt'] })

  return { written: true, skipped: false, leagueId, seasonId, teamId }
}

export default writeRosterLeaguesCenter
