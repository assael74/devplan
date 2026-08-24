// src/features/playersDatabase/services/audit/playerIdentity.audit.js

import {
  collection,
  limit,
  query,
  startAfter,
  where,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { trackedGetDocs } from '../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import { SEARCHINDEX_PLAYER_SEASON_GENERIC_OBJECT } from '../../catalog/firestoreDocuments/searchIndexPlayerSeason.catalog.js'


const PLAYER_IDENTITY_AUDIT_READ_HARD_LIMIT = 50000
const PLAYER_IDENTITY_AUDIT_READ_SAFETY_LIMIT = 49000

const estimateSnapshotReads = snapshot => Math.max(
  1,
  Array.isArray(snapshot?.docs) ? snapshot.docs.length : 0
)

const FIRESTORE_STRUCTURED_QUERY_MAX_LIMIT = 10000

const readIdentitySnapshotWithinBudget = async ({
  source,
  metadata,
  budget,
  reservedReads = 0,
  label,
}) => {
  const availableReads = Math.max(
    0,
    Number(budget || 0) - Number(reservedReads || 0)
  )

  if (availableReads < 1) {
    throw new Error(
      `Audit stopped before ${label}: read safety budget exhausted. ` +
      `The audit is capped below ${PLAYER_IDENTITY_AUDIT_READ_HARD_LIMIT} document reads.`
    )
  }

  const documents = []
  let readsUsed = 0
  let cursor = null

  while (readsUsed < availableReads) {
    const remainingAllowance = availableReads - readsUsed
    const pageLimit = Math.min(
      FIRESTORE_STRUCTURED_QUERY_MAX_LIMIT,
      remainingAllowance
    )
    const constraints = []

    if (cursor) constraints.push(startAfter(cursor))
    constraints.push(limit(pageLimit))

    const pageSnapshot = await trackedGetDocs(
      query(source, ...constraints),
      metadata
    )
    const pageReads = estimateSnapshotReads(pageSnapshot)

    readsUsed += pageReads
    documents.push(...pageSnapshot.docs)

    if (pageSnapshot.docs.length < pageLimit) {
      return {
        snapshot: { docs: documents },
        readsUsed,
      }
    }

    if (readsUsed >= availableReads) {
      throw new Error(
        `Audit stopped while reading ${label}: the source reached the ` +
        `${availableReads}-document safety allowance. No incomplete audit result was produced. ` +
        `The audit is capped below ${PLAYER_IDENTITY_AUDIT_READ_HARD_LIMIT} document reads.`
      )
    }

    cursor = pageSnapshot.docs[pageSnapshot.docs.length - 1]
  }

  throw new Error(
    `Audit stopped while reading ${label}: read safety allowance exhausted.`
  )
}

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const toNumber = value => {
  const number = Number(value)

  return Number.isFinite(number) ? number : null
}

const normalizeName = value => clean(value)
  .toLowerCase()
  .replace(/["'׳״.]/g, '')
  .replace(/[\s\-_/\\]+/g, '_')
  .replace(/^_+|_+$/g, '')

const isYearValue = value => {
  const year = toNumber(value)

  return Number.isInteger(year) && year >= 1990 && year <= 2035
}

const isBrokenExternalId = row => {
  const externalPlayerId = clean(row.externalPlayerId)
  if (!externalPlayerId) return false

  return externalPlayerId === clean(row.birthYear) ||
    externalPlayerId === clean(row.identityBirthYear) ||
    isYearValue(externalPlayerId)
}

const isBrokenPlayerId = row => {
  const playerId = clean(row.playerId)
  const birthYear = clean(row.birthYear || row.identityBirthYear)

  if (!playerId) return true
  if (/^player__\d{4}__\d{4}$/.test(playerId)) return true
  if (birthYear && playerId === `player__${birthYear}__${birthYear}`) return true

  return false
}

const getSeasonId = season => clean(season.seasonId || season.seasonKey)

const buildOccurrenceKey = row => [
  clean(row.teamDocumentId || row.birthTeamDocumentId || row.teamId),
  clean(row.seasonId || row.seasonKey),
  clean(row.playerId),
  normalizeName(row.normalizedName || row.normalizedDisplayName || row.fullName),
].join('::')

const buildNameYearKey = row => {
  const name = normalizeName(
    row.normalizedName || row.normalizedDisplayName || row.fullName
  )
  const year = clean(row.identityBirthYear || row.birthYear)

  return name && year ? `${year}::${name}` : ''
}

const flattenTeamPlayer = ({
  teamDoc = {},
  teamDocumentId = '',
  season = {},
  target = 'current',
  player = {},
  playerIndex = 0,
} = {}) => ({
  source: 'dbBirthTeams',
  sourceDocumentId: teamDocumentId,
  sourceTarget: target,
  sourcePlayerIndex: playerIndex,

  teamDocumentId,
  birthTeamDocumentId: clean(
    teamDoc.birthTeamDocumentId || teamDoc.teamDocumentId || teamDocumentId
  ),
  teamId: clean(teamDoc.birthTeamId || teamDoc.teamId || teamDocumentId),
  teamName: clean(teamDoc.displayName || teamDoc.teamName || teamDoc.name),

  seasonId: getSeasonId(season),
  seasonKey: clean(season.seasonKey),
  birthYear: toNumber(season.birthYear),

  fullName: clean(player.fullName),
  normalizedName: clean(player.normalizedName),
  playerId: clean(player.playerId),
  playerDocumentId: clean(player.playerDocumentId),
  externalPlayerId: clean(player.externalPlayerId),
  identityBirthYear: toNumber(player.identityBirthYear),
  identityKey: clean(player.identityKey),
  matchedPlayerId: clean(player.matchedPlayerId),
  rosterStatus: clean(player.rosterStatus),
  isYoungerAgeGroup: Boolean(player.isYoungerAgeGroup),
})

const flattenTeamDocument = snapshot => {
  const data = snapshot.data() || {}
  const rows = []

  ;['current', 'history'].forEach(target => {
    const seasons = Array.isArray(data[target]) ? data[target] : []

    seasons.forEach(season => {
      const players = Array.isArray(season.teamPlayers)
        ? season.teamPlayers
        : []

      players.forEach((player, playerIndex) => {
        rows.push(flattenTeamPlayer({
          teamDoc: data,
          teamDocumentId: snapshot.id,
          season,
          target,
          player,
          playerIndex,
        }))
      })
    })
  })

  return rows
}

const flattenSearchPlayer = snapshot => {
  const data = snapshot.data() || {}

  return {
    source: 'dbSearchIndexes',
    sourceDocumentId: snapshot.id,
    sourceTarget: clean(data.sourceTarget),

    teamDocumentId: clean(
      data.teamDocumentId || data.birthTeamDocumentId || data.teamId
    ),
    birthTeamDocumentId: clean(data.birthTeamDocumentId),
    teamId: clean(data.teamId || data.birthTeamId),
    teamName: clean(data.teamName),

    seasonId: clean(data.seasonId || data.seasonKey),
    seasonKey: clean(data.seasonKey),
    birthYear: toNumber(data.birthYear),

    fullName: clean(data.displayName || data.fullName),
    normalizedName: clean(
      data.normalizedDisplayName || data.normalizedName
    ),
    playerId: clean(data.playerId),
    playerDocumentId: clean(data.playerDocumentId),
    externalPlayerId: clean(data.externalPlayerId),
    identityBirthYear: toNumber(data.identityBirthYear),
    identityKey: clean(data.identityKey),
    matchedPlayerId: clean(data.matchedPlayerId),
    rosterStatus: clean(data.rosterStatus),
    isYoungerAgeGroup: Boolean(data.isYoungerAgeGroup),
  }
}

const getValueType = value => {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  if (value instanceof Date) return 'date'

  return typeof value
}

const isTimestampLike = value => Boolean(
  value &&
  typeof value === 'object' &&
  typeof value.toDate === 'function'
)

const isTypeValid = ({ actualValue, expectedValue }) => {
  if (expectedValue === null) return true
  if (isTimestampLike(actualValue)) return expectedValue === null

  return getValueType(actualValue) === getValueType(expectedValue)
}

const validateExactSchema = ({ data = {}, schema = {} } = {}) => {
  const dataKeys = Object.keys(data).sort()
  const schemaKeys = Object.keys(schema).sort()
  const schemaKeySet = new Set(schemaKeys)
  const dataKeySet = new Set(dataKeys)

  const missingFields = schemaKeys.filter(key => !dataKeySet.has(key))
  const unexpectedFields = dataKeys.filter(key => !schemaKeySet.has(key))
  const invalidTypes = schemaKeys.reduce((result, key) => {
    if (!dataKeySet.has(key)) return result

    const actualValue = data[key]
    const expectedValue = schema[key]

    if (isTypeValid({
      actualValue,
      expectedValue,
    })) return result

    result.push({
      field: key,
      expectedType: getValueType(expectedValue),
      actualType: getValueType(actualValue),
      actualValue,
    })

    return result
  }, [])

  return {
    valid: missingFields.length === 0 &&
      unexpectedFields.length === 0 &&
      invalidTypes.length === 0,
    missingFields,
    unexpectedFields,
    invalidTypes,
  }
}

const buildPlayerSeasonSchemaAudit = snapshots => {
  const documents = snapshots.map(snapshot => {
    const result = validateExactSchema({
      data: snapshot.data() || {},
      schema: SEARCHINDEX_PLAYER_SEASON_GENERIC_OBJECT,
    })

    return {
      documentId: snapshot.id,
      ...result,
    }
  })
  const invalidDocuments = documents.filter(document => !document.valid)

  return {
    catalog: 'SEARCHINDEX_PLAYER_SEASON_GENERIC_OBJECT',
    expectedFields: Object.keys(
      SEARCHINDEX_PLAYER_SEASON_GENERIC_OBJECT
    ).sort(),
    checkedDocuments: documents.length,
    validDocuments: documents.length - invalidDocuments.length,
    invalidDocuments: invalidDocuments.length,
    missingFieldOccurrences: invalidDocuments.reduce(
      (total, document) => total + document.missingFields.length,
      0
    ),
    unexpectedFieldOccurrences: invalidDocuments.reduce(
      (total, document) => total + document.unexpectedFields.length,
      0
    ),
    invalidTypeOccurrences: invalidDocuments.reduce(
      (total, document) => total + document.invalidTypes.length,
      0
    ),
    documents: invalidDocuments,
  }
}

const readTeamPlayers = async ({ budget }) => {
  const result = await readIdentitySnapshotWithinBudget({
    source: collection(db, PLAYERS_DATABASE_COLLECTIONS.teams),
    metadata: {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.teams,
      action: 'playerIdentity-audit',
      operationSubtype: 'audit-read',
    },
    budget,
    reservedReads: 1,
    label: 'team documents',
  })

  return {
    rows: result.snapshot.docs.flatMap(flattenTeamDocument),
    readsUsed: result.readsUsed,
  }
}

const readSearchPlayers = async ({ budget }) => {
  const result = await readIdentitySnapshotWithinBudget({
    source: query(
      collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
      where('entityType', '==', 'playerSeason')
    ),
    metadata: {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      action: 'playerIdentity-audit',
      operationSubtype: 'audit-query',
    },
    budget,
    label: 'player search index documents',
  })

  return {
    rows: result.snapshot.docs.map(flattenSearchPlayer),
    schemaAudit: buildPlayerSeasonSchemaAudit(result.snapshot.docs),
    readsUsed: result.readsUsed,
  }
}

const groupRows = ({ rows = [], keyBuilder }) => {
  const groups = new Map()

  rows.forEach(row => {
    const key = keyBuilder(row)
    if (!key) return

    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(row)
  })

  return groups
}

const collectIssues = ({ teamPlayers = [], searchPlayers = [] } = {}) => {
  const allRows = [...teamPlayers, ...searchPlayers]
  const issues = []

  allRows.forEach(row => {
    if (isBrokenExternalId(row)) {
      issues.push({
        type: 'external_id_is_year',
        severity: 'critical',
        row,
      })
    }

    if (isBrokenPlayerId(row)) {
      issues.push({
        type: 'invalid_player_id',
        severity: 'critical',
        row,
      })
    }

    if (!clean(row.identityKey)) {
      issues.push({
        type: 'missing_identity_key',
        severity: 'warning',
        row,
      })
    }
  })

  const playerIdGroups = groupRows({
    rows: allRows,
    keyBuilder: row => clean(row.playerId),
  })

  playerIdGroups.forEach((rows, playerId) => {
    const names = new Set(rows
      .map(row => normalizeName(row.fullName || row.normalizedName))
      .filter(Boolean))

    if (names.size <= 1) return

    issues.push({
      type: 'player_id_multiple_names',
      severity: 'critical',
      playerId,
      names: [...names],
      rows,
    })
  })

  const identityGroups = groupRows({
    rows: allRows,
    keyBuilder: buildNameYearKey,
  })

  identityGroups.forEach((rows, identityKey) => {
    const playerIds = new Set(rows
      .map(row => clean(row.playerId))
      .filter(Boolean))

    if (playerIds.size <= 1) return

    const validExternalRows = rows.filter(row => {
      const externalPlayerId = clean(row.externalPlayerId)

      return externalPlayerId && !isBrokenExternalId(row)
    })
    const allRowsHaveValidExternalId = validExternalRows.length === rows.length
    const externalIdGroups = groupRows({
      rows: validExternalRows,
      keyBuilder: row => clean(row.externalPlayerId),
    })
    const externalIdHasMultiplePlayerIds = [...externalIdGroups.values()]
      .some(group => new Set(group
        .map(row => clean(row.playerId))
        .filter(Boolean)).size > 1)

    if (allRowsHaveValidExternalId && !externalIdHasMultiplePlayerIds) return

    issues.push({
      type: 'same_identity_multiple_player_ids',
      severity: 'warning',
      identityKey,
      playerIds: [...playerIds],
      rows,
    })
  })

  const teamKeys = new Set(teamPlayers.map(buildOccurrenceKey))
  const searchKeys = new Set(searchPlayers.map(buildOccurrenceKey))

  teamPlayers.forEach(row => {
    const key = buildOccurrenceKey(row)
    if (searchKeys.has(key)) return

    issues.push({
      type: 'team_player_missing_search_index',
      severity: 'warning',
      row,
    })
  })

  searchPlayers.forEach(row => {
    const key = buildOccurrenceKey(row)
    if (teamKeys.has(key)) return

    issues.push({
      type: 'orphan_search_index',
      severity: 'warning',
      row,
    })
  })

  return issues
}

const countIssues = issues => issues.reduce((result, issue) => {
  result[issue.type] = (result[issue.type] || 0) + 1

  return result
}, {})

export async function buildPlayerIdentityAudit() {
  let remainingReadBudget = PLAYER_IDENTITY_AUDIT_READ_SAFETY_LIMIT

  const teamResult = await readTeamPlayers({
    budget: remainingReadBudget,
  })
  remainingReadBudget -= teamResult.readsUsed

  const searchResult = await readSearchPlayers({
    budget: remainingReadBudget,
  })
  remainingReadBudget -= searchResult.readsUsed

  const teamPlayers = teamResult.rows
  const searchPlayers = searchResult.rows
  const schemaAudit = searchResult.schemaAudit
  const issues = collectIssues({
    teamPlayers,
    searchPlayers,
  })

  return {
    generatedAt: new Date().toISOString(),
    mode: 'read-only',
    readSafety: {
      hardLimit: PLAYER_IDENTITY_AUDIT_READ_HARD_LIMIT,
      safetyLimit: PLAYER_IDENTITY_AUDIT_READ_SAFETY_LIMIT,
      readsUsed: PLAYER_IDENTITY_AUDIT_READ_SAFETY_LIMIT - remainingReadBudget,
      remainingBudget: remainingReadBudget,
    },
    collections: {
      teams: PLAYERS_DATABASE_COLLECTIONS.teams,
      searchIndexes: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    },
    summary: {
      teamPlayerRows: teamPlayers.length,
      searchPlayerDocuments: searchPlayers.length,
      totalIssues: issues.length,
      issuesByType: countIssues(issues),
      schema: {
        checkedDocuments: schemaAudit.checkedDocuments,
        validDocuments: schemaAudit.validDocuments,
        invalidDocuments: schemaAudit.invalidDocuments,
        missingFieldOccurrences: schemaAudit.missingFieldOccurrences,
        unexpectedFieldOccurrences: schemaAudit.unexpectedFieldOccurrences,
        invalidTypeOccurrences: schemaAudit.invalidTypeOccurrences,
      },
    },
    schemaAudit,
    teamPlayers,
    searchPlayers,
    issues,
  }
}

const downloadJson = ({ data, fileName }) => {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function downloadPlayerIdentityAudit() {
  const audit = await buildPlayerIdentityAudit()
  const date = new Date().toISOString().slice(0, 10)

  downloadJson({
    data: audit,
    fileName: `player-identity-audit-${date}.json`,
  })

  return audit.summary
}
