// src/features/playersDatabase/services/write/stats/writeStatsPlayerSeasons.js

import { FieldPath, doc, setDoc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

export const writeStatsPlayerSeasons = async ({ approvedState = {} } = {}) => {
  const plans = Array.isArray(approvedState.playerSeasonPlans) ? approvedState.playerSeasonPlans : []

  for (const plan of plans) {
    const projection = plan.projection
    const reference = doc(db, PLAYERS_DATABASE_COLLECTIONS.playerSeasons, plan.documentId)
    const teamId = projection.teamId

    if (!plan.exists) {
      await setDoc(reference, {
        identity: projection.identity,
        teamsById: {
          [teamId]: projection.team,
        },
        timestamps: {
          createdAt: approvedState.updatedAt || null,
          updatedAt: approvedState.updatedAt || null,
        },
      })
      continue
    }

    if (!plan.teamExists) {
      await setDoc(reference, {
        identity: {
          seasonStatus: projection.identity.seasonStatus,
        },
        teamsById: {
          [teamId]: projection.team,
        },
        timestamps: {
          updatedAt: approvedState.updatedAt || null,
        },
      }, {
        mergeFields: [
          new FieldPath('identity', 'seasonStatus'),
          new FieldPath('teamsById', teamId),
          new FieldPath('timestamps', 'updatedAt'),
        ],
      })
      continue
    }

    await setDoc(reference, {
      identity: {
        seasonStatus: projection.identity.seasonStatus,
      },
      teamsById: {
        [teamId]: {
          stats: projection.team.stats,
          scouting: projection.team.scouting,
          roster: { numShirt: projection.team.roster.numShirt },
          manual: { playerUrl: projection.team.manual?.playerUrl || '' },
          updatedAt: projection.team.updatedAt,
        },
      },
      timestamps: {
        updatedAt: approvedState.updatedAt || null,
      },
    }, {
      mergeFields: [
        new FieldPath('identity', 'seasonStatus'),
        new FieldPath('teamsById', teamId, 'stats'),
        new FieldPath('teamsById', teamId, 'scouting'),
        new FieldPath('teamsById', teamId, 'roster', 'numShirt'),
        new FieldPath('teamsById', teamId, 'manual', 'playerUrl'),
        new FieldPath('teamsById', teamId, 'updatedAt'),
        new FieldPath('timestamps', 'updatedAt'),
      ],
    })
  }

  return { written: plans.length }
}
