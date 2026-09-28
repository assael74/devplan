// src/features/playersDatabase/domain/statsV2/clearStatsApprovedState.builder.js

import {
  STATS_OWNED_RICH_SCOUT_FIELDS,
} from './statsAbsence.builder.js'
import { getTeamSeasonStatsState } from './teamSeasonStatsState.js'
import { resolveStatsPlayerIdentityKey } from './statsReloadDecision.builder.js'
import {
  STATS_PLAYER_INDEX_OWNED_FIELDS,
  STATS_TEAM_INDEX_OWNED_FIELDS,
} from '../../services/writeV2/stats/support/statsProjectionOwnership.js'

import {
  CLEAR_STATS_CLUB_SEASON_OWNED_FIELDS,
  CLEAR_STATS_LEAGUE_OWNED_FIELDS,
  CLEAR_STATS_PLAYER_DOCUMENT_SEASON_OWNED_FIELDS,
  buildClearStatsPlayerIndexSetFields,
  buildClearStatsTeamIndexSetFields,
  buildStatsAbsentClubSeason,
  buildStatsAbsentLeagueRow,
  buildStatsAbsentPlayerDocumentSeasonRow,
  resolveClearStatsPlayersCount,
} from './clearStatsProjectionPlan.builder.js'

export const CLEAR_STATS_APPROVED_STATE_VERSION = 1

export const CLEAR_STATS_SET_FIELDS = Object.freeze([
  'statsStatus',
  'playerStats',
  'lineClassification',
  'primaryScoutProfileId',
  'primaryScoutProfileStrengthDepthPct',
  'professionalScoutProfileIds',
  'preliminaryScoutProfileIds',
  'scoutEffectiveImmediacyStatus',
  'scoutPlayerInterestLevel',
  'scoutEngineVersion',
])

export const CLEAR_STATS_TEAM_SET_FIELDS = Object.freeze([
  'scoutProfilesSummary',
  'statsLoadState',
  'teamBalance',
])

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const clone = value => JSON.parse(JSON.stringify(value))

const fail = (code, message) => {
  const error = new Error(message)
  error.code = code
  throw error
}

const requireObject = (value, code, message) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(code, message)
  }

  return value
}

const requireIdentity = identity => {
  const source = requireObject(
    identity,
    'CLEAR_STATS_APPROVED_IDENTITY_REQUIRED',
    'CLEAR_STATS Approved State requires identity'
  )

  const result = {
    birthTeamDocumentId: clean(source.birthTeamDocumentId),
    seasonKey: clean(source.seasonKey),
    leagueId: clean(source.leagueId),
    clubId: clean(source.clubId),
  }

  if (!result.birthTeamDocumentId || !result.seasonKey || !result.leagueId) {
    fail(
      'CLEAR_STATS_APPROVED_IDENTITY_REQUIRED',
      'CLEAR_STATS Approved State requires complete identity'
    )
  }

  return result
}

const assertPlanContract = proposedPlan => {
  const plan = requireObject(
    proposedPlan,
    'CLEAR_STATS_APPROVED_PLAN_REQUIRED',
    'CLEAR_STATS Proposed Plan is required for approval'
  )

  if (
    plan.planType !== 'clearStatsProposedPlan' ||
    plan.planVersion !== 1 ||
    plan.flowType !== 'stats' ||
    plan.operationType !== 'clear' ||
    plan.label !== 'CLEAR_STATS'
  ) {
    fail(
      'CLEAR_STATS_APPROVED_PLAN_INVALID',
      'CLEAR_STATS Proposed Plan contract is invalid'
    )
  }

  return plan
}

const assertStateContract = plan => {
  const isAbsentNoOp = (
    plan.currentStatsState === 'absent' &&
    plan.isIdempotent === true &&
    plan.canonicalMutation === null
  )
  const isPresentMutation = (
    plan.currentStatsState === 'present' &&
    plan.isIdempotent === false &&
    plan.canonicalMutation &&
    typeof plan.canonicalMutation === 'object' &&
    !Array.isArray(plan.canonicalMutation)
  )

  if (!isAbsentNoOp && !isPresentMutation) {
    fail(
      'CLEAR_STATS_APPROVED_STATE_CONTRACT_INVALID',
      'CLEAR_STATS Proposed Plan state contract is invalid'
    )
  }
}

const assertAllowedKeys = ({ source, allowed, code, message }) => {
  const allowedFields = new Set(allowed)
  const invalidField = Object.keys(source).find(field => !allowedFields.has(field))

  if (invalidField) {
    fail(code, `${message}: ${invalidField}`)
  }
}

const normalizeForComparison = value => {
  if (Array.isArray(value)) {
    return value.map(normalizeForComparison)
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = normalizeForComparison(value[key])
        return result
      }, {})
  }

  return value
}

const valuesEqual = (left, right) => (
  JSON.stringify(normalizeForComparison(left)) ===
  JSON.stringify(normalizeForComparison(right))
)

const assertExactKeys = ({ source, expected, code, message }) => {
  const actualKeys = Object.keys(source).sort()
  const expectedKeys = [...expected].sort()

  if (!valuesEqual(actualKeys, expectedKeys)) {
    fail(code, message)
  }
}

const buildPreviewPlayersByKey = preview => {
  const players = Array.isArray(preview?.teamPlayers)
    ? preview.teamPlayers
    : []
  const playersByKey = new Map()

  players.forEach(player => {
    const playerKey = clean(resolveStatsPlayerIdentityKey(player))

    if (!playerKey || playersByKey.has(playerKey)) {
      fail(
        'CLEAR_STATS_APPROVED_PREVIEW_PLAYER_IDENTITY_INVALID',
        'CLEAR_STATS preview player identities must be complete and unique'
      )
    }

    playersByKey.set(playerKey, player)
  })

  return playersByKey
}

const validatePlayerOwnedPatches = ({ patches, preview }) => {
  if (!Array.isArray(patches)) {
    fail(
      'CLEAR_STATS_APPROVED_PLAYER_PATCHES_INVALID',
      'CLEAR_STATS playerOwnedPatches must be an array'
    )
  }

  const previewPlayersByKey = buildPreviewPlayersByKey(preview)
  const seenPlayerKeys = new Set()
  const allowedUnsetFields = new Set(STATS_OWNED_RICH_SCOUT_FIELDS)

  patches.forEach(patch => {
    const source = requireObject(
      patch,
      'CLEAR_STATS_APPROVED_PLAYER_PATCH_INVALID',
      'CLEAR_STATS player patch must be an object'
    )
    const playerKey = clean(source.playerKey)

    if (!playerKey || seenPlayerKeys.has(playerKey)) {
      fail(
        'CLEAR_STATS_APPROVED_PLAYER_KEY_INVALID',
        'CLEAR_STATS playerKey must be complete and unique'
      )
    }

    const previewPlayer = previewPlayersByKey.get(playerKey)

    if (!previewPlayer) {
      fail(
        'CLEAR_STATS_APPROVED_PLAYER_PATCH_TARGET_INVALID',
        'CLEAR_STATS player patch must target a preview player'
      )
    }

    seenPlayerKeys.add(playerKey)

    const setFields = requireObject(
      source.setFields,
      'CLEAR_STATS_APPROVED_SET_FIELDS_INVALID',
      'CLEAR_STATS setFields must be an object'
    )

    assertAllowedKeys({
      source: setFields,
      allowed: CLEAR_STATS_SET_FIELDS,
      code: 'CLEAR_STATS_APPROVED_SET_FIELD_FORBIDDEN',
      message: 'CLEAR_STATS setFields contains a non Stats-owned field',
    })

    assertExactKeys({
      source: setFields,
      expected: CLEAR_STATS_SET_FIELDS,
      code: 'CLEAR_STATS_APPROVED_SET_FIELDS_INCOMPLETE',
      message: 'CLEAR_STATS setFields must contain the complete Stats-owned field set',
    })

    CLEAR_STATS_SET_FIELDS.forEach(field => {
      if (!valuesEqual(setFields[field], previewPlayer[field])) {
        fail(
          'CLEAR_STATS_APPROVED_SET_FIELD_MISMATCH',
          `CLEAR_STATS setFields does not match preview for ${field}`
        )
      }
    })

    if (!Array.isArray(source.unsetFields)) {
      fail(
        'CLEAR_STATS_APPROVED_UNSET_FIELDS_INVALID',
        'CLEAR_STATS unsetFields must be an array'
      )
    }

    source.unsetFields.forEach(field => {
      if (!allowedUnsetFields.has(field)) {
        fail(
          'CLEAR_STATS_APPROVED_UNSET_FIELD_FORBIDDEN',
          `CLEAR_STATS unsetFields contains a non Stats-owned field: ${field}`
        )
      }
    })
  })

  if (seenPlayerKeys.size !== previewPlayersByKey.size) {
    fail(
      'CLEAR_STATS_APPROVED_PLAYER_PATCH_COVERAGE_INVALID',
      'CLEAR_STATS requires exactly one patch for every preview player'
    )
  }
}

const validateTeamOwnedSetFields = ({ setFields, preview }) => {
  const source = requireObject(
    setFields,
    'CLEAR_STATS_APPROVED_TEAM_SET_FIELDS_INVALID',
    'CLEAR_STATS teamOwnedSetFields must be an object'
  )

  assertAllowedKeys({
    source,
    allowed: CLEAR_STATS_TEAM_SET_FIELDS,
    code: 'CLEAR_STATS_APPROVED_TEAM_SET_FIELD_FORBIDDEN',
    message: 'CLEAR_STATS teamOwnedSetFields contains a forbidden field',
  })

  assertExactKeys({
    source,
    expected: CLEAR_STATS_TEAM_SET_FIELDS,
    code: 'CLEAR_STATS_APPROVED_TEAM_SET_FIELDS_INCOMPLETE',
    message: 'CLEAR_STATS teamOwnedSetFields must contain exactly the approved Team fields',
  })

  CLEAR_STATS_TEAM_SET_FIELDS.forEach(field => {
    if (!valuesEqual(source[field], preview[field])) {
      fail(
        'CLEAR_STATS_APPROVED_TEAM_SET_FIELD_MISMATCH',
        `CLEAR_STATS teamOwnedSetFields does not match preview for ${field}`
      )
    }
  })
}

const validateImpact = plan => {
  const impact = requireObject(
    plan.impact,
    'CLEAR_STATS_APPROVED_IMPACT_INVALID',
    'CLEAR_STATS impact is required'
  )

  const playersAffected = impact.playersAffected
  const scoutProfilePlayersAffected = impact.scoutProfilePlayersAffected
  const scoutingFieldsRemoved = impact.scoutingFieldsRemoved

  if (
    !Number.isInteger(playersAffected) ||
    playersAffected < 0 ||
    !Number.isInteger(scoutProfilePlayersAffected) ||
    scoutProfilePlayersAffected < 0 ||
    !Number.isInteger(scoutingFieldsRemoved) ||
    scoutingFieldsRemoved < 0
  ) {
    fail(
      'CLEAR_STATS_APPROVED_IMPACT_INVALID',
      'CLEAR_STATS impact values must be non-negative integers'
    )
  }

  if (plan.isIdempotent) {
    if (
      playersAffected !== 0 ||
      scoutProfilePlayersAffected !== 0 ||
      scoutingFieldsRemoved !== 0
    ) {
      fail(
        'CLEAR_STATS_APPROVED_IMPACT_MISMATCH',
        'CLEAR_STATS idempotent impact must be zero'
      )
    }

    return
  }

  const patches = plan.canonicalMutation.playerOwnedPatches
  const expectedScoutingFieldsRemoved = patches.reduce(
    (total, patch) => total + patch.unsetFields.length,
    0
  )

  if (
    playersAffected !== patches.length ||
    scoutProfilePlayersAffected > playersAffected ||
    scoutingFieldsRemoved !== expectedScoutingFieldsRemoved
  ) {
    fail(
      'CLEAR_STATS_APPROVED_IMPACT_MISMATCH',
      'CLEAR_STATS impact must match the approved mutation'
    )
  }
}

const validateCanonicalMutation = plan => {
  if (plan.isIdempotent) {
    return
  }

  const mutation = requireObject(
    plan.canonicalMutation,
    'CLEAR_STATS_APPROVED_MUTATION_INVALID',
    'CLEAR_STATS canonical mutation is required'
  )

  assertAllowedKeys({
    source: mutation,
    allowed: ['playerOwnedPatches', 'teamOwnedSetFields'],
    code: 'CLEAR_STATS_APPROVED_MUTATION_FIELD_FORBIDDEN',
    message: 'CLEAR_STATS canonical mutation contains a forbidden field',
  })

  validatePlayerOwnedPatches({
    patches: mutation.playerOwnedPatches,
    preview: plan.finalTeamSeasonPreview,
  })
  validateTeamOwnedSetFields({
    setFields: mutation.teamOwnedSetFields,
    preview: plan.finalTeamSeasonPreview,
  })
}


const assertPreservedFields = ({ before, after, ownedFields, label }) => {
  const owned = new Set(ownedFields)
  const keys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ])

  keys.forEach(key => {
    if (!owned.has(key) && !valuesEqual(before?.[key], after?.[key])) {
      fail(
        'CLEAR_STATS_APPROVED_PROJECTION_OWNERSHIP_VIOLATION',
        `CLEAR_STATS ${label} cannot change preserved field: ${key}`
      )
    }
  })
}

const validatePlayerDocumentMutation = operation => {
  const field = operation.target.arrayField
  if (!field || (field !== 'current' && field !== 'history')) return

  const before = operation.sourceFields?.[field]
  const after = operation.setFields?.[field]
  if (!Array.isArray(before) || !Array.isArray(after) || before.length !== after.length) {
    fail('CLEAR_STATS_APPROVED_PROJECTION_OWNERSHIP_VIOLATION', 'CLEAR_STATS Player Document array shape must be preserved')
  }

  before.forEach((row, index) => {
    const nextRow = after[index]
    const isTarget = (
      clean(row?.seasonKey) === clean(operation.target.seasonKey) &&
      clean(row?.birthTeamDocumentId || row?.birthTeamId) ===
        clean(operation.target.birthTeamDocumentId)
    )

    if (!isTarget) {
      if (!valuesEqual(row, nextRow)) {
        fail('CLEAR_STATS_APPROVED_PROJECTION_OWNERSHIP_VIOLATION', 'CLEAR_STATS Player Document cannot change another season')
      }
      return
    }

    assertPreservedFields({
      before: row,
      after: nextRow,
      ownedFields: CLEAR_STATS_PLAYER_DOCUMENT_SEASON_OWNED_FIELDS,
      label: 'Player Document season',
    })

    if (!valuesEqual(nextRow, buildStatsAbsentPlayerDocumentSeasonRow(row))) {
      fail(
        'CLEAR_STATS_APPROVED_PROJECTION_ABSENCE_MISMATCH',
        'CLEAR_STATS Player Document season must equal canonical Stats absence'
      )
    }
  })
}

const validateLeagueMutation = (operation, { playersCount } = {}) => {
  const field = Object.keys(operation.setFields || {})[0]
  if (field !== 'current' && field !== 'history') return

  const beforeSeasons = field === 'current'
    ? [operation.sourceFields?.current]
    : operation.sourceFields?.history
  const afterSeasons = field === 'current'
    ? [operation.setFields?.current]
    : operation.setFields?.history

  if (!Array.isArray(beforeSeasons) || !Array.isArray(afterSeasons) || beforeSeasons.length !== afterSeasons.length) {
    fail('CLEAR_STATS_APPROVED_PROJECTION_OWNERSHIP_VIOLATION', 'CLEAR_STATS League season shape must be preserved')
  }

  beforeSeasons.forEach((season, seasonIndex) => {
    const nextSeason = afterSeasons[seasonIndex]
    const isTargetSeason = clean(season?.seasonKey) === clean(operation.target.seasonKey)

    if (!isTargetSeason) {
      if (!valuesEqual(season, nextSeason)) {
        fail('CLEAR_STATS_APPROVED_PROJECTION_OWNERSHIP_VIOLATION', 'CLEAR_STATS League cannot change another season')
      }
      return
    }

    assertPreservedFields({
      before: season,
      after: nextSeason,
      ownedFields: ['tableRank'],
      label: 'League season',
    })

    const beforeRows = Array.isArray(season?.tableRank) ? season.tableRank : []
    const afterRows = Array.isArray(nextSeason?.tableRank) ? nextSeason.tableRank : []
    if (beforeRows.length !== afterRows.length) {
      fail('CLEAR_STATS_APPROVED_PROJECTION_OWNERSHIP_VIOLATION', 'CLEAR_STATS League table rows must be preserved')
    }

    beforeRows.forEach((row, rowIndex) => {
      const nextRow = afterRows[rowIndex]
      const rowIdentity = clean(row?.birthTeamId || row?.birthTeamDocumentId)
      const targetIdentity = clean(operation.target.birthTeamDocumentId)

      if (targetIdentity && rowIdentity === targetIdentity) {
        assertPreservedFields({
          before: row,
          after: nextRow,
          ownedFields: CLEAR_STATS_LEAGUE_OWNED_FIELDS,
          label: 'League team row',
        })
        if (!valuesEqual(nextRow, buildStatsAbsentLeagueRow(row, { playersCount }))) {
          fail(
            'CLEAR_STATS_APPROVED_PROJECTION_ABSENCE_MISMATCH',
            'CLEAR_STATS League team row must equal canonical Stats absence'
          )
        }
      } else if (!valuesEqual(row, nextRow)) {
        fail('CLEAR_STATS_APPROVED_PROJECTION_OWNERSHIP_VIOLATION', 'CLEAR_STATS League cannot change another team row')
      }
    })
  })
}

const validateClubSeasonRows = ({ beforeGroups, afterGroups, operation, playersCount, compact }) => {
  if (!Array.isArray(beforeGroups) || !Array.isArray(afterGroups) || beforeGroups.length !== afterGroups.length) {
    fail('CLEAR_STATS_APPROVED_PROJECTION_OWNERSHIP_VIOLATION', 'CLEAR_STATS Club age-group shape must be preserved')
  }

  const validateRows = (beforeRows, afterRows) => {
    if (!Array.isArray(beforeRows) || !Array.isArray(afterRows) || beforeRows.length !== afterRows.length) {
      fail('CLEAR_STATS_APPROVED_PROJECTION_OWNERSHIP_VIOLATION', 'CLEAR_STATS Club season rows must be preserved')
    }

    beforeRows.forEach((row, index) => {
      const nextRow = afterRows[index]
      const isTarget = clean(row?.seasonKey) === clean(operation.target.seasonKey) &&
        clean(row?.teamId) === clean(operation.target.birthTeamDocumentId)

      if (isTarget) {
        assertPreservedFields({
          before: row,
          after: nextRow,
          ownedFields: CLEAR_STATS_CLUB_SEASON_OWNED_FIELDS,
          label: 'Club season',
        })
        if (!valuesEqual(nextRow, buildStatsAbsentClubSeason(row, { playersCount }))) {
          fail(
            'CLEAR_STATS_APPROVED_PROJECTION_ABSENCE_MISMATCH',
            'CLEAR_STATS Club season must equal canonical Stats absence'
          )
        }
      } else if (!valuesEqual(row, nextRow)) {
        fail('CLEAR_STATS_APPROVED_PROJECTION_OWNERSHIP_VIOLATION', 'CLEAR_STATS Club cannot change another season or team')
      }
    })
  }

  beforeGroups.forEach((group, index) => {
    const nextGroup = afterGroups[index]
    const owned = compact ? ['current', 'previous'] : ['seasons']
    assertPreservedFields({ before: group, after: nextGroup, ownedFields: owned, label: 'Club age group' })

    if (compact) {
      validateRows(Array.isArray(group?.current) ? group.current : [], Array.isArray(nextGroup?.current) ? nextGroup.current : [])
      validateRows(Array.isArray(group?.previous) ? group.previous : [], Array.isArray(nextGroup?.previous) ? nextGroup.previous : [])
    } else {
      validateRows(Array.isArray(group?.seasons) ? group.seasons : [], Array.isArray(nextGroup?.seasons) ? nextGroup.seasons : [])
    }
  })
}

const validateNestedProjectionOwnership = ({
  operation,
  targetType,
  identity,
  playersCount,
  seasonStatus,
}) => {
  if (operation.action === 'skip') return

  if (targetType === 'Player SearchIndex') {
    const expected = buildClearStatsPlayerIndexSetFields(
      operation.sourceFields,
      { identity, seasonStatus }
    )
    if (!valuesEqual(operation.setFields, expected)) {
      fail(
        'CLEAR_STATS_APPROVED_PROJECTION_ABSENCE_MISMATCH',
        'CLEAR_STATS Player SearchIndex must equal canonical Stats absence'
      )
    }
  }

  if (targetType === 'Team SearchIndex') {
    const expected = buildClearStatsTeamIndexSetFields({
      birthTeamDocumentId: identity.birthTeamDocumentId,
      seasonKey: identity.seasonKey,
      playersCount,
    })
    if (!valuesEqual(operation.setFields, expected)) {
      fail(
        'CLEAR_STATS_APPROVED_PROJECTION_ABSENCE_MISMATCH',
        'CLEAR_STATS Team SearchIndex must equal canonical Stats absence'
      )
    }
  }

  if (targetType === 'Player Document') {
    validatePlayerDocumentMutation(operation)
  }

  if (targetType === 'League') {
    validateLeagueMutation(operation, { playersCount })
  }

  if (targetType === 'Club') {
    validateClubSeasonRows({
      beforeGroups: operation.sourceFields?.ageGroups,
      afterGroups: operation.setFields?.ageGroups,
      operation,
      playersCount,
      compact: false,
    })
  }

  if (targetType === 'Clubs Master') {
    const beforeClubs = operation.sourceFields?.clubs
    const afterClubs = operation.setFields?.clubs
    if (!Array.isArray(beforeClubs) || !Array.isArray(afterClubs) || beforeClubs.length !== afterClubs.length) {
      fail('CLEAR_STATS_APPROVED_PROJECTION_OWNERSHIP_VIOLATION', 'CLEAR_STATS Clubs Master shape must be preserved')
    }

    beforeClubs.forEach((club, index) => {
      const nextClub = afterClubs[index]
      assertPreservedFields({ before: club, after: nextClub, ownedFields: ['ageGroups'], label: 'Clubs Master club' })
      validateClubSeasonRows({
        beforeGroups: club?.ageGroups,
        afterGroups: nextClub?.ageGroups,
        operation,
        playersCount,
        compact: true,
      })
    })
  }
}

const validateProjectionTargetIdentity = ({ target, identity, targetType, action }) => {
  if (action === 'skip') return

  const assertMatch = (field, expected) => {
    if (!clean(target[field]) || clean(target[field]) !== clean(expected)) {
      fail(
        'CLEAR_STATS_APPROVED_PROJECTION_TARGET_IDENTITY_INVALID',
        `CLEAR_STATS ${targetType} target identity is invalid: ${field}`
      )
    }
  }

  if (targetType !== 'Clubs Master') {
    assertMatch('seasonKey', identity.seasonKey)
  } else {
    assertMatch('seasonKey', identity.seasonKey)
  }

  if (['Player Document', 'Player SearchIndex', 'Team SearchIndex', 'League', 'Club', 'Clubs Master'].includes(targetType)) {
    assertMatch('birthTeamDocumentId', identity.birthTeamDocumentId)
  }

  if (['Player SearchIndex', 'Team SearchIndex'].includes(targetType)) {
    assertMatch('leagueId', identity.leagueId)
  }

  if (targetType === 'League' && clean(target.docId) !== clean(identity.leagueId)) {
    fail(
      'CLEAR_STATS_APPROVED_PROJECTION_TARGET_IDENTITY_INVALID',
      'CLEAR_STATS League target identity is invalid: leagueId'
    )
  }

  if (['Club', 'Clubs Master'].includes(targetType)) {
    assertMatch('clubId', identity.clubId)
  }
}

const validateProjectionOperation = ({
  operation,
  allowedSetFields,
  targetType,
  identity,
  playersCount,
  seasonStatus,
}) => {
  if (operation === null) return null

  const source = requireObject(
    operation,
    'CLEAR_STATS_APPROVED_PROJECTION_OPERATION_INVALID',
    `CLEAR_STATS ${targetType} operation must be an object`
  )
  const target = requireObject(
    source.target,
    'CLEAR_STATS_APPROVED_PROJECTION_TARGET_INVALID',
    `CLEAR_STATS ${targetType} operation requires target`
  )

  if (!clean(target.docId)) {
    fail(
      'CLEAR_STATS_APPROVED_PROJECTION_TARGET_INVALID',
      `CLEAR_STATS ${targetType} operation requires docId`
    )
  }

  if (source.action !== 'update' && source.action !== 'skip') {
    fail(
      'CLEAR_STATS_APPROVED_PROJECTION_ACTION_INVALID',
      'CLEAR_STATS projection operations may only update or skip existing documents'
    )
  }

  validateProjectionTargetIdentity({
    target,
    identity,
    targetType,
    action: source.action,
  })

  requireObject(
    source.sourceFields,
    'CLEAR_STATS_APPROVED_PROJECTION_SOURCE_FIELDS_INVALID',
    `CLEAR_STATS ${targetType} sourceFields must be an object`
  )

  const setFields = requireObject(
    source.setFields,
    'CLEAR_STATS_APPROVED_PROJECTION_SET_FIELDS_INVALID',
    `CLEAR_STATS ${targetType} setFields must be an object`
  )
  const allowed = new Set(allowedSetFields)
  const forbidden = Object.keys(setFields).find(field => !allowed.has(field))

  if (forbidden) {
    fail(
      'CLEAR_STATS_APPROVED_PROJECTION_FIELD_FORBIDDEN',
      `CLEAR_STATS ${targetType} cannot write field: ${forbidden}`
    )
  }

  if (!Array.isArray(source.unsetFields) || source.unsetFields.length > 0) {
    fail(
      'CLEAR_STATS_APPROVED_PROJECTION_UNSET_INVALID',
      `CLEAR_STATS ${targetType} does not allow projection unsetFields`
    )
  }

  validateNestedProjectionOwnership({
    operation: source,
    targetType,
    identity,
    playersCount,
    seasonStatus,
  })

  return source
}

const validateProjectionPlan = plan => {
  const projectionPlan = requireObject(
    plan.projectionPlan,
    'CLEAR_STATS_APPROVED_PROJECTION_PLAN_REQUIRED',
    'CLEAR_STATS projectionPlan is required'
  )

  if (projectionPlan.planVersion !== 1) {
    fail(
      'CLEAR_STATS_APPROVED_PROJECTION_PLAN_INVALID',
      'CLEAR_STATS projectionPlan version is invalid'
    )
  }

  const playerDocuments = Array.isArray(projectionPlan.playerDocumentOperations)
    ? projectionPlan.playerDocumentOperations
    : fail('CLEAR_STATS_APPROVED_PROJECTION_PLAN_INVALID', 'Player Document operations must be an array')
  const playerIndexes = Array.isArray(projectionPlan.playerSearchIndexOperations)
    ? projectionPlan.playerSearchIndexOperations
    : fail('CLEAR_STATS_APPROVED_PROJECTION_PLAN_INVALID', 'Player SearchIndex operations must be an array')
  const clubs = Array.isArray(projectionPlan.clubOperations)
    ? projectionPlan.clubOperations
    : fail('CLEAR_STATS_APPROVED_PROJECTION_PLAN_INVALID', 'Club operations must be an array')

  const groups = [
    [playerDocuments, ['current', 'history'], 'Player Document'],
    [playerIndexes, [...STATS_PLAYER_INDEX_OWNED_FIELDS], 'Player SearchIndex'],
    [clubs, ['ageGroups'], 'Club'],
  ]
  const seenTargets = new Set()
  const validated = []
  const playersCount = resolveClearStatsPlayersCount(plan.finalTeamSeasonPreview)
  const seasonStatus = clean(plan.finalTeamSeasonPreview?.seasonStatus)

  groups.forEach(([operations, allowed, targetType]) => {
    operations.forEach(operation => {
      const value = validateProjectionOperation({
        operation,
        allowedSetFields: allowed,
        targetType,
        identity: plan.identity,
        playersCount,
        seasonStatus,
      })
      const key = `${targetType}:${clean(value.target.docId)}`
      if (seenTargets.has(key)) {
        fail('CLEAR_STATS_APPROVED_PROJECTION_TARGET_DUPLICATE', `Duplicate CLEAR_STATS target: ${key}`)
      }
      seenTargets.add(key)
      validated.push(value)
    })
  })

  ;[
    [projectionPlan.teamSearchIndexOperation, [...STATS_TEAM_INDEX_OWNED_FIELDS], 'Team SearchIndex'],
    [projectionPlan.leagueOperation, ['current', 'history'], 'League'],
    [projectionPlan.clubsMasterOperation, ['clubs'], 'Clubs Master'],
  ].forEach(([operation, allowed, targetType]) => {
    if (operation === null) return
    const value = validateProjectionOperation({
      operation,
      allowedSetFields: allowed,
      targetType,
      identity: plan.identity,
      playersCount,
      seasonStatus,
    })
    const key = `${targetType}:${clean(value.target.docId)}`
    if (seenTargets.has(key)) {
      fail('CLEAR_STATS_APPROVED_PROJECTION_TARGET_DUPLICATE', `Duplicate CLEAR_STATS target: ${key}`)
    }
    seenTargets.add(key)
    validated.push(value)
  })

  const impact = requireObject(
    projectionPlan.impact,
    'CLEAR_STATS_APPROVED_PROJECTION_IMPACT_INVALID',
    'CLEAR_STATS projection impact is required'
  )
  const required = validated.filter(operation => operation.action === 'update').length

  if (
    !Number.isInteger(impact.documentsAffected) || impact.documentsAffected < 0 ||
    !Number.isInteger(impact.operationsRequired) || impact.operationsRequired < 0 ||
    impact.documentsAffected !== required ||
    impact.operationsRequired !== required
  ) {
    fail(
      'CLEAR_STATS_APPROVED_PROJECTION_IMPACT_MISMATCH',
      'CLEAR_STATS projection impact must match approved update operations'
    )
  }

  return projectionPlan
}

export const buildClearStatsApprovedStateV2 = ({
  proposedPlan,
  approvedAt,
} = {}) => {
  const plan = assertPlanContract(proposedPlan)

  if (!clean(approvedAt)) {
    fail(
      'CLEAR_STATS_APPROVED_AT_REQUIRED',
      'CLEAR_STATS approval requires approvedAt'
    )
  }

  const identity = requireIdentity(plan.identity)

  assertStateContract(plan)

  if (getTeamSeasonStatsState(plan.finalTeamSeasonPreview) !== 'absent') {
    fail(
      'CLEAR_STATS_APPROVED_PREVIEW_INVALID',
      'CLEAR_STATS final Team Season preview must be absent'
    )
  }

  validateCanonicalMutation(plan)
  validateImpact(plan)
  const projectionPlan = validateProjectionPlan(plan)

  return clone({
    stateType: 'clearStatsApprovedState',
    stateVersion: CLEAR_STATS_APPROVED_STATE_VERSION,
    approvedAt,
    flowType: 'stats',
    operationType: 'clear',
    label: 'CLEAR_STATS',
    identity,
    currentStatsState: plan.currentStatsState,
    isIdempotent: plan.isIdempotent,
    canonicalMutation: plan.canonicalMutation,
    finalTeamSeasonPreview: plan.finalTeamSeasonPreview,
    projectionPlan,
    impact: plan.impact,
  })
}
