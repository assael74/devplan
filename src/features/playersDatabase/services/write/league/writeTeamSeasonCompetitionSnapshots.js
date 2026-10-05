// src/features/playersDatabase/services/write/league/writeTeamSeasonCompetitionSnapshots.js

import { doc, updateDoc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import {
  buildTeamSeasonDocumentId,
  requireSeasonId,
} from '../../../domain/identity/index.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const SNAPSHOT_FIELDS = Object.freeze([
  'teamUrl',
  'clubLevel',
  'clubStrengthLevel',
  'officialTable',
  'updatedAt',
])

const OFFICIAL_TABLE_FIELDS = Object.freeze([
  'rank',
  'points',
  'goalsFor',
  'goalsAgainst',
  'teamGamePlayed',
])

const hasOnlyFields = (value, fields) => {
  const allowed = new Set(fields)
  return Object.keys(value).every(key => allowed.has(key))
}

const requireObject = (value, message) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(message)
  }
  return value
}

const requireCompleteFields = (value, fields, message) => {
  const object = requireObject(value, message)
  if (!hasOnlyFields(object, fields)) throw new Error(message)
  if (fields.some(field => !Object.prototype.hasOwnProperty.call(object, field))) {
    throw new Error(message)
  }
  return object
}

const requireCompetitionSnapshot = value => {
  const snapshot = requireCompleteFields(
    value,
    SNAPSHOT_FIELDS,
    'Invalid Team Season competitionSnapshot projection'
  )

  requireCompleteFields(
    snapshot.officialTable,
    OFFICIAL_TABLE_FIELDS,
    'Invalid Team Season competitionSnapshot officialTable'
  )

  return snapshot
}

const requireTarget = ({ target = {}, seasonId }) => {
  const teamId = clean(target.teamId)
  if (!teamId) throw new Error('Missing Team id for competitionSnapshot target')

  const expectedDocumentId = buildTeamSeasonDocumentId({
    teamId,
    seasonId,
  })
  const teamSeasonDocumentId = clean(target.teamSeasonDocumentId)

  if (teamSeasonDocumentId !== expectedDocumentId) {
    throw new Error('Team Season competitionSnapshot target identity mismatch')
  }

  return {
    teamId,
    teamSeasonDocumentId,
    competitionSnapshot: requireCompetitionSnapshot(target.competitionSnapshot),
  }
}

export const writeTeamSeasonCompetitionSnapshots = async ({ approvedState = {} } = {}) => {
  const seasonId = requireSeasonId(approvedState.seasonId)
  const sourceTargets = approvedState.teamSeasonCompetitionSnapshots

  if (!Array.isArray(sourceTargets)) {
    throw new Error('Missing Team Season competitionSnapshot targets')
  }

  const targets = sourceTargets.map(target => requireTarget({ target, seasonId }))

  for (const target of targets) {
    const reference = doc(
      db,
      PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
      target.teamSeasonDocumentId
    )

    await updateDoc(reference, {
      competitionSnapshot: target.competitionSnapshot,
    })
  }

  return {
    seasonId,
    updatedTeamSeasons: targets.length,
  }
}

export default writeTeamSeasonCompetitionSnapshots
