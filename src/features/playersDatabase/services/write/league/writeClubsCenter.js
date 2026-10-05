// src/features/playersDatabase/services/write/league/writeClubsCenter.js

import {
  FieldPath,
  deleteField,
  doc,
  setDoc,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { requireLeagueId } from '../../../domain/league/leagueIdentity.js'
import {
  buildTeamId,
  buildTeamSeasonDocumentId,
  requireSeasonId,
} from '../../../domain/identity/index.js'

const LEAGUE_OPERATIONS = Object.freeze({
  NONE: 'NONE',
  UPSERT: 'UPSERT',
  DELETE: 'DELETE',
})

const CLUB_PROFILE_FIELDS = Object.freeze([
  'displayName',
  'shortName',
  'clubLevel',
  'clubStrengthLevel',
])

const LEAGUE_FIELDS = Object.freeze([
  'displayName',
  'ageGroupLabel',
  'leagueLevel',
  'tableImportedAt',
])

const TEAM_FIELDS = Object.freeze([
  'teamSeasonDocumentId',
  'birthYear',
  'ageGroupId',
  'teamSlot',
  'leagueId',
  'documentationState',
  'documentationStateUpdatedAt',
  'teamTaskSignals',
  'performance',
  'competitionProjection',
  'transfers',
  'updatedAt',
])

const TASK_SIGNAL_FIELDS = Object.freeze([
  'offense',
  'defense',
  'updatedAt',
])

const PERFORMANCE_FIELDS = Object.freeze([
  'tableRank',
  'points',
  'teamGamePlayed',
])

const COMPETITION_PROJECTION_FIELDS = Object.freeze(['effective'])
const COMPETITION_EFFECTIVE_FIELDS = Object.freeze([
  'projectedNextLeagueLevel',
  'status',
  'source',
])

const TRANSFER_FIELDS = Object.freeze([
  'coverageStatus',
  'external',
  'internal',
  'pending',
  'updatedAt',
])

const MOVEMENT_DIRECTIONS = Object.freeze([
  'up',
  'lateral',
  'down',
  'unknown',
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

const requireMap = (value, message) => requireObject(value, message)

const requireClubProfileProjection = value => requireExactFields(
  value,
  CLUB_PROFILE_FIELDS,
  'Invalid ClubsCenter ClubProfile projection'
)

const requireLeagueProjection = value => requireExactFields(
  value,
  LEAGUE_FIELDS,
  'Invalid ClubsCenter league projection'
)

const requireTaskSignals = value => {
  const signals = requireExactFields(
    value,
    TASK_SIGNAL_FIELDS,
    'Invalid ClubsCenter team task signals projection'
  )

  if (typeof signals.offense !== 'boolean' || typeof signals.defense !== 'boolean') {
    throw new Error('Invalid ClubsCenter team task signals projection')
  }

  return signals
}

const requirePerformance = value => requireExactFields(
  value,
  PERFORMANCE_FIELDS,
  'Invalid ClubsCenter team performance projection'
)

const requireCompetitionProjection = value => {
  const projection = requireExactFields(
    value,
    COMPETITION_PROJECTION_FIELDS,
    'Invalid ClubsCenter team competition projection'
  )

  requireExactFields(
    projection.effective,
    COMPETITION_EFFECTIVE_FIELDS,
    'Invalid ClubsCenter team competition projection'
  )

  return projection
}

const requireDirectionMap = ({ value, key, message }) => {
  const container = requireExactFields(value, MOVEMENT_DIRECTIONS, message)

  MOVEMENT_DIRECTIONS.forEach(direction => {
    const entry = requireExactFields(container[direction], [key], message)
    requireMap(entry[key], message)
  })

  return container
}

const requireTransfers = value => {
  const transfers = requireExactFields(
    value,
    TRANSFER_FIELDS,
    'Invalid ClubsCenter team transfers projection'
  )

  const external = requireExactFields(
    transfers.external,
    ['in', 'out'],
    'Invalid ClubsCenter team external transfers projection'
  )
  requireDirectionMap({
    value: external.in,
    key: 'clubsById',
    message: 'Invalid ClubsCenter team external transfers projection',
  })
  requireDirectionMap({
    value: external.out,
    key: 'clubsById',
    message: 'Invalid ClubsCenter team external transfers projection',
  })

  const internal = requireExactFields(
    transfers.internal,
    ['in', 'out'],
    'Invalid ClubsCenter team internal transfers projection'
  )
  requireDirectionMap({
    value: internal.in,
    key: 'teamsById',
    message: 'Invalid ClubsCenter team internal transfers projection',
  })
  requireDirectionMap({
    value: internal.out,
    key: 'teamsById',
    message: 'Invalid ClubsCenter team internal transfers projection',
  })

  const pending = requireExactFields(
    transfers.pending,
    ['total'],
    'Invalid ClubsCenter team pending transfers projection'
  )
  if (!Number.isInteger(pending.total) || pending.total < 0) {
    throw new Error('Invalid ClubsCenter team pending transfers projection')
  }

  return transfers
}

const requireTeamProjection = ({
  value,
  clubId,
  teamId,
  seasonId,
  leagueId,
}) => {
  const team = requireExactFields(
    value,
    TEAM_FIELDS,
    'Invalid ClubsCenter team projection'
  )

  if (!Number.isInteger(team.birthYear) || team.birthYear <= 0) {
    throw new Error('Invalid ClubsCenter team projection')
  }
  if (!clean(team.ageGroupId)) throw new Error('Invalid ClubsCenter team projection')
  if (!Number.isInteger(team.teamSlot) || team.teamSlot <= 0) {
    throw new Error('Invalid ClubsCenter team projection')
  }

  const expectedTeamId = buildTeamId({
    clubId,
    birthYear: team.birthYear,
    teamSlot: team.teamSlot,
  })
  if (teamId !== expectedTeamId) {
    throw new Error('ClubsCenter team identity mismatch')
  }

  const expectedTeamSeasonDocumentId = buildTeamSeasonDocumentId({
    teamId,
    seasonId,
  })
  if (clean(team.teamSeasonDocumentId) !== expectedTeamSeasonDocumentId) {
    throw new Error('ClubsCenter Team Season identity mismatch')
  }
  if (clean(team.leagueId) !== leagueId) {
    throw new Error('ClubsCenter team league identity mismatch')
  }
  if (!DOCUMENTATION_STATES.has(team.documentationState)) {
    throw new Error('Invalid ClubsCenter team documentation state')
  }

  requireTaskSignals(team.teamTaskSignals)
  requirePerformance(team.performance)
  requireCompetitionProjection(team.competitionProjection)
  requireTransfers(team.transfers)

  return team
}

const requireClubWrite = ({ value, seasonId, leagueId }) => {
  const source = requireObject(value, 'Invalid ClubsCenter club write target')
  const allowed = new Set(['clubId', 'clubProfile', 'upsertTeamsById', 'deleteTeamIds'])

  if (Object.keys(source).some(key => !allowed.has(key))) {
    throw new Error('Invalid ClubsCenter club write target')
  }

  const clubId = clean(source.clubId)
  if (!clubId) throw new Error('Missing ClubsCenter club id')

  const clubProfile = source.clubProfile === null || source.clubProfile === undefined
    ? null
    : requireClubProfileProjection(source.clubProfile)

  const sourceUpserts = source.upsertTeamsById === null || source.upsertTeamsById === undefined
    ? {}
    : requireMap(source.upsertTeamsById, 'Invalid ClubsCenter team upserts')
  const upsertTeamsById = {}

  Object.entries(sourceUpserts).forEach(([teamId, team]) => {
    const cleanTeamId = clean(teamId)
    if (!cleanTeamId) throw new Error('Invalid ClubsCenter team id')
    upsertTeamsById[cleanTeamId] = requireTeamProjection({
      value: team,
      clubId,
      teamId: cleanTeamId,
      seasonId,
      leagueId,
    })
  })

  const sourceDeletes = source.deleteTeamIds === null || source.deleteTeamIds === undefined
    ? []
    : source.deleteTeamIds
  if (!Array.isArray(sourceDeletes)) throw new Error('Invalid ClubsCenter team deletes')

  const deleteTeamIds = sourceDeletes.map(teamId => {
    const cleanTeamId = clean(teamId)
    if (!cleanTeamId) throw new Error('Invalid ClubsCenter team id')
    return cleanTeamId
  })

  const duplicateDeleteIds = new Set(deleteTeamIds)
  if (duplicateDeleteIds.size !== deleteTeamIds.length) {
    throw new Error('Duplicate ClubsCenter team delete target')
  }

  if (Object.keys(upsertTeamsById).some(teamId => duplicateDeleteIds.has(teamId))) {
    throw new Error('Conflicting ClubsCenter team write target')
  }

  if (Object.keys(upsertTeamsById).length > 0 && !clubProfile) {
    throw new Error('Missing ClubProfile projection for ClubsCenter team upsert')
  }

  return {
    clubId,
    clubProfile,
    upsertTeamsById,
    deleteTeamIds,
  }
}

const requireWriteTarget = ({ approvedState = {} } = {}) => {
  const source = requireObject(
    approvedState.clubsCenterProjection,
    'Missing ClubsCenter projection write target'
  )
  const seasonId = requireSeasonId(source.seasonId)
  const leagueId = requireLeagueId(source.leagueId)
  const writeRequired = source.writeRequired !== false

  if (!writeRequired) {
    return {
      writeRequired: false,
      seasonId,
      leagueId,
    }
  }

  const leagueOperation = clean(source.leagueOperation || LEAGUE_OPERATIONS.NONE)
  if (!Object.values(LEAGUE_OPERATIONS).includes(leagueOperation)) {
    throw new Error('Invalid ClubsCenter league projection operation')
  }

  const seasonKey = clean(source.seasonKey)
  const seasonStatus = clean(source.seasonStatus)
  if (
    leagueOperation !== LEAGUE_OPERATIONS.DELETE
    && (!seasonKey || !seasonStatus)
  ) {
    throw new Error('Invalid ClubsCenter season projection')
  }
  if (!Object.prototype.hasOwnProperty.call(source, 'updatedAt')) {
    throw new Error('Missing ClubsCenter projection updatedAt')
  }

  const league = leagueOperation === LEAGUE_OPERATIONS.UPSERT
    ? requireLeagueProjection(source.league)
    : null

  const sourceClubWrites = source.clubWrites === null || source.clubWrites === undefined
    ? []
    : source.clubWrites
  if (!Array.isArray(sourceClubWrites)) throw new Error('Invalid ClubsCenter club writes')

  const clubWrites = sourceClubWrites.map(value => requireClubWrite({
    value,
    seasonId,
    leagueId,
  }))
  const clubIds = clubWrites.map(item => item.clubId)
  if (new Set(clubIds).size !== clubIds.length) {
    throw new Error('Duplicate ClubsCenter club write target')
  }

  return {
    writeRequired: true,
    seasonId,
    seasonKey,
    seasonStatus,
    leagueId,
    leagueOperation,
    league,
    clubWrites,
    updatedAt: source.updatedAt,
  }
}

const setNested = ({ root, path, value }) => {
  let cursor = root
  path.forEach((key, index) => {
    if (index === path.length - 1) {
      cursor[key] = value
      return
    }
    if (!cursor[key]) cursor[key] = {}
    cursor = cursor[key]
  })
}

const buildWrite = target => {
  const data = {
    seasonId: target.seasonId,
    updatedAt: target.updatedAt,
  }
  const mergeFields = ['seasonId', 'updatedAt']

  if (target.leagueOperation !== LEAGUE_OPERATIONS.DELETE) {
    data.seasonKey = target.seasonKey
    data.seasonStatus = target.seasonStatus
    mergeFields.push('seasonKey', 'seasonStatus')
  }

  if (target.leagueOperation === LEAGUE_OPERATIONS.UPSERT) {
    setNested({
      root: data,
      path: ['leaguesById', target.leagueId],
      value: target.league,
    })
    mergeFields.push(new FieldPath('leaguesById', target.leagueId))
  }

  if (target.leagueOperation === LEAGUE_OPERATIONS.DELETE) {
    setNested({
      root: data,
      path: ['leaguesById', target.leagueId],
      value: deleteField(),
    })
    mergeFields.push(new FieldPath('leaguesById', target.leagueId))
  }

  target.clubWrites.forEach(clubWrite => {
    if (clubWrite.clubProfile) {
      Object.entries(clubWrite.clubProfile).forEach(([field, value]) => {
        setNested({
          root: data,
          path: ['clubsById', clubWrite.clubId, field],
          value,
        })
        mergeFields.push(new FieldPath('clubsById', clubWrite.clubId, field))
      })
    }

    Object.entries(clubWrite.upsertTeamsById).forEach(([teamId, team]) => {
      setNested({
        root: data,
        path: ['clubsById', clubWrite.clubId, 'teamsById', teamId],
        value: team,
      })
      mergeFields.push(new FieldPath(
        'clubsById',
        clubWrite.clubId,
        'teamsById',
        teamId
      ))
    })

    clubWrite.deleteTeamIds.forEach(teamId => {
      setNested({
        root: data,
        path: ['clubsById', clubWrite.clubId, 'teamsById', teamId],
        value: deleteField(),
      })
      mergeFields.push(new FieldPath(
        'clubsById',
        clubWrite.clubId,
        'teamsById',
        teamId
      ))
    })
  })

  return { data, mergeFields }
}

export const writeClubsCenter = async ({ approvedState = {} } = {}) => {
  const target = requireWriteTarget({ approvedState })

  if (!target.writeRequired) {
    return {
      seasonId: target.seasonId,
      leagueId: target.leagueId,
      written: false,
      skipped: true,
      upsertedTeams: 0,
      deletedTeams: 0,
    }
  }

  const { data, mergeFields } = buildWrite(target)
  const reference = doc(
    db,
    PLAYERS_DATABASE_COLLECTIONS.clubsCenter,
    target.seasonId
  )

  await setDoc(reference, data, { mergeFields })

  const upsertedTeams = target.clubWrites.reduce(
    (total, item) => total + Object.keys(item.upsertTeamsById).length,
    0
  )
  const deletedTeams = target.clubWrites.reduce(
    (total, item) => total + item.deleteTeamIds.length,
    0
  )

  return {
    seasonId: target.seasonId,
    leagueId: target.leagueId,
    written: true,
    skipped: false,
    upsertedTeams,
    deletedTeams,
  }
}

export default writeClubsCenter
