// src/features/playersDatabase/services/write/stats/writeStatsClubsCenter.js

import { FieldPath, doc, setDoc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

const writeProjection = async ({ target, includeDocumentation }) => {
  const team = target.team || {}
  if (!target.seasonId || !target.clubId || !target.teamId) {
    throw new Error('Missing Stats ClubsCenter projection target')
  }
  const teamPath = (...parts) => new FieldPath(
    'clubsById', target.clubId, 'teamsById', target.teamId, ...parts
  )

  const mergeFields = [
    teamPath('transfers'),
    teamPath('updatedAt'),
    'updatedAt',
  ]
  if (includeDocumentation) {
    mergeFields.unshift(
      teamPath('documentationState'),
      teamPath('documentationStateUpdatedAt'),
      teamPath('teamTaskSignals')
    )
  }

  return setDoc(
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
      mergeFields,
    }
  )
}

export const writeStatsClubsCenter = async ({ approvedState = {} } = {}) => {
  const localTarget = approvedState.clubsCenterProjection || {}
  const counterpartTargets = Array.isArray(approvedState.counterpartClubsCenterProjections)
    ? approvedState.counterpartClubsCenterProjections
    : []

  await writeProjection({ target: localTarget, includeDocumentation: true })
  for (const target of counterpartTargets) {
    await writeProjection({ target, includeDocumentation: false })
  }

  return {
    written: true,
    counterpartCount: counterpartTargets.length,
  }
}
