// src/features/playersDatabase/services/write/league/writeLeaguesCenter.js

import {
  FieldPath,
  deleteField,
  doc,
  setDoc,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { requireLeagueId } from '../../../domain/league/leagueIdentity.js'
import { requireSeasonId } from '../../../domain/identity/index.js'

const LEAGUES_CENTER_DOCUMENT_ID = 'all'

const WRITE_OPERATIONS = Object.freeze({
  UPSERT_SEASON: 'UPSERT_SEASON',
  DELETE_SEASON: 'DELETE_SEASON',
  DELETE_LEAGUE: 'DELETE_LEAGUE',
})

const IDENTITY_FIELDS = Object.freeze([
  'leagueName',
  'region',
  'ageGroupId',
  'ageGroupLabel',
  'level',
])

const SEASON_FIELDS = Object.freeze([
  'seasonKey',
  'seasonStatus',
  'birthYear',
  'seasonUrl',
  'hasCompetitionRules',
  'tableState',
  'tableImportedAt',
  'teamsById',
  'updatedAt',
])

const TEAM_FIELDS = Object.freeze([
  'clubId',
  'teamSlot',
  'documentationState',
  'documentationStateUpdatedAt',
])

const TABLE_STATES = new Set([
  'NOT_LOADED',
  'LOADED_EMPTY',
  'LOADED',
])

const DOCUMENTATION_STATES = new Set([
  'NO_ROSTER',
  'ROSTER_ONLY',
  'STATS_LOADED',
  'STATS_FINAL',
])

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const requireObject = (value, message) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(message)
  }
  return value
}

const requireExactFields = (value, fields, message) => {
  const object = requireObject(value, message)
  const keys = Object.keys(object)
  const allowed = new Set(fields)

  if (keys.some(key => !allowed.has(key))) throw new Error(message)
  if (fields.some(field => !Object.prototype.hasOwnProperty.call(object, field))) {
    throw new Error(message)
  }

  return object
}

const requireIdentity = value => requireExactFields(
  value,
  IDENTITY_FIELDS,
  'Invalid LeaguesCenter league identity projection'
)

const requireTeam = ({ teamId, value }) => {
  const id = clean(teamId)
  if (!id) throw new Error('Invalid LeaguesCenter team projection identity')

  const team = requireExactFields(
    value,
    Object.prototype.hasOwnProperty.call(value, 'showInvestigationIndicator')
      ? [...TEAM_FIELDS, 'showInvestigationIndicator'] : TEAM_FIELDS,
    'Invalid LeaguesCenter team projection'
  )

  if (!clean(team.clubId)) throw new Error('Invalid LeaguesCenter team projection')
  if (!Number.isInteger(team.teamSlot) || team.teamSlot <= 0) {
    throw new Error('Invalid LeaguesCenter team projection')
  }
  if (!DOCUMENTATION_STATES.has(team.documentationState)) {
    throw new Error('Invalid LeaguesCenter team documentation state')
  }


  return team
}

const requireSeason = value => {
  const season = requireExactFields(
    value,
    SEASON_FIELDS,
    'Invalid LeaguesCenter season projection'
  )

  if (!TABLE_STATES.has(season.tableState)) {
    throw new Error('Invalid LeaguesCenter table state')
  }
  if (typeof season.hasCompetitionRules !== 'boolean') {
    throw new Error('Invalid LeaguesCenter competition rules state')
  }

  const teamsById = requireObject(
    season.teamsById,
    'Invalid LeaguesCenter teams projection'
  )

  Object.entries(teamsById).forEach(([teamId, team]) => {
    requireTeam({ teamId, value: team })
  })

  return season
}

const requireWriteTarget = ({ approvedState = {} } = {}) => {
  const source = requireObject(
    approvedState.leaguesCenterProjection,
    'Missing LeaguesCenter projection write target'
  )
  const leagueId = requireLeagueId(source.leagueId)
  const seasonId = requireSeasonId(source.seasonId)
  const operation = clean(source.operation)
  const writeRequired = source.writeRequired !== false

  if (!Object.values(WRITE_OPERATIONS).includes(operation)) {
    throw new Error('Invalid LeaguesCenter projection write operation')
  }

  if (!writeRequired) {
    return {
      writeRequired: false,
      leagueId,
      seasonId,
      operation,
    }
  }

  const hasUpdatedAt = Object.prototype.hasOwnProperty.call(source, 'updatedAt')
  if (!hasUpdatedAt) throw new Error('Missing LeaguesCenter projection updatedAt')

  const identity = source.identity === null || source.identity === undefined
    ? null
    : requireIdentity(source.identity)

  if (operation === WRITE_OPERATIONS.UPSERT_SEASON && !identity) {
    throw new Error('Missing LeaguesCenter league identity projection')
  }

  const season = operation === WRITE_OPERATIONS.UPSERT_SEASON
    ? requireSeason(source.season)
    : null
  const deleteTeamIds = source.deleteTeamIds || []
  if (!Array.isArray(deleteTeamIds) || new Set(deleteTeamIds).size !== deleteTeamIds.length ||
    deleteTeamIds.some(id => typeof id !== 'string' || !clean(id) || season?.teamsById?.[id])) {
    throw new Error('Invalid LeaguesCenter team delete targets')
  }

  return {
    writeRequired: true,
    leagueId,
    seasonId,
    operation,
    identity,
    season,
    deleteTeamIds,
    updatedAt: source.updatedAt,
  }
}

const buildUpsertWrite = target => {
  const identityPath = new FieldPath(
    'leaguesById',
    target.leagueId,
    'identity'
  )
  const seasonPath = (...parts) => new FieldPath(
    'leaguesById', target.leagueId, 'seasonsById', target.seasonId, ...parts
  )
  const teamsById = { ...target.season.teamsById }
  // Upserts own individual fields. Only removed teams or an explicit empty
  // registry replace a whole row/map, retaining retired fields on live teams.
  const mergeFields = [identityPath, 'updatedAt', ...SEASON_FIELDS
    .filter(field => field !== 'teamsById').map(field => seasonPath(field))]
  const teamEntries = Object.entries(teamsById)
  if (!teamEntries.length) {
    mergeFields.push(seasonPath('teamsById'))
  } else {
    teamEntries.forEach(([teamId, team]) => {
      Object.keys(team).forEach(field => mergeFields.push(seasonPath('teamsById', teamId, field)))
    })
    target.deleteTeamIds.forEach(teamId => {
      teamsById[teamId] = deleteField()
      mergeFields.push(seasonPath('teamsById', teamId))
    })
  }

  return {
    data: {
      leaguesById: {
        [target.leagueId]: {
          identity: target.identity,
          seasonsById: {
            [target.seasonId]: { ...target.season, teamsById },
          },
        },
      },
      updatedAt: target.updatedAt,
    },
    mergeFields,
  }
}

const buildDeleteSeasonWrite = target => {
  const seasonPath = new FieldPath(
    'leaguesById',
    target.leagueId,
    'seasonsById',
    target.seasonId
  )
  const mergeFields = [seasonPath, 'updatedAt']
  const leagueValue = {
    seasonsById: {
      [target.seasonId]: deleteField(),
    },
  }

  if (target.identity) {
    leagueValue.identity = target.identity
    mergeFields.unshift(new FieldPath(
      'leaguesById',
      target.leagueId,
      'identity'
    ))
  }

  return {
    data: {
      leaguesById: {
        [target.leagueId]: leagueValue,
      },
      updatedAt: target.updatedAt,
    },
    mergeFields,
  }
}

const buildDeleteLeagueWrite = target => ({
  data: {
    leaguesById: {
      [target.leagueId]: deleteField(),
    },
    updatedAt: target.updatedAt,
  },
  mergeFields: [
    new FieldPath('leaguesById', target.leagueId),
    'updatedAt',
  ],
})

export const writeLeaguesCenter = async ({ approvedState = {} } = {}) => {
  const target = requireWriteTarget({ approvedState })

  if (!target.writeRequired) {
    return {
      leagueId: target.leagueId,
      seasonId: target.seasonId,
      operation: target.operation,
      written: false,
      skipped: true,
    }
  }

  const write = target.operation === WRITE_OPERATIONS.UPSERT_SEASON
    ? buildUpsertWrite(target)
    : target.operation === WRITE_OPERATIONS.DELETE_LEAGUE
      ? buildDeleteLeagueWrite(target)
      : buildDeleteSeasonWrite(target)
  const reference = doc(
    db,
    PLAYERS_DATABASE_COLLECTIONS.leaguesCenter,
    LEAGUES_CENTER_DOCUMENT_ID
  )

  await setDoc(reference, write.data, {
    mergeFields: write.mergeFields,
  })

  return {
    leagueId: target.leagueId,
    seasonId: target.seasonId,
    operation: target.operation,
    written: true,
    skipped: false,
  }
}

export default writeLeaguesCenter
