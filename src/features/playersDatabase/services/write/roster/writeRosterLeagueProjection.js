// src/features/playersDatabase/services/write/roster/writeRosterLeagueProjection.js

import { FieldPath, doc, setDoc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

export const writeRosterLeagueProjection = async ({ approvedState = {} } = {}) => {
  const target = approvedState.leagueProjection || {}
  const leagueId = String(target.leagueId || '').trim()
  const seasonId = String(target.seasonId || '').trim()
  const teamId = String(target.teamId || '').trim()
  if (!leagueId || !seasonId || !teamId || !target.roster) {
    throw new Error('Invalid approved League roster projection')
  }

  const rosterPath = new FieldPath('seasonsById', seasonId, 'table', 'teamsById', teamId, 'roster')
  const updatedAtPath = new FieldPath('seasonsById', seasonId, 'table', 'teamsById', teamId, 'updatedAt')
  await setDoc(doc(db, PLAYERS_DATABASE_COLLECTIONS.leagues, leagueId), {
    seasonsById: {
      [seasonId]: {
        table: {
          teamsById: {
            [teamId]: {
              roster: target.roster,
              updatedAt: target.updatedAt,
            },
          },
        },
      },
    },
  }, { mergeFields: [rosterPath, updatedAtPath] })

  return { leagueId, seasonId, teamId, written: true }
}

export default writeRosterLeagueProjection
