// src/features/playersDatabase/services/audit/playerScoutDocumentRewrite.audit.js

import {
  doc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { createTrackedWriteBatch } from '../../../../services/firestore/usage/index.js'
import { BIRTH_TEAMS_DATABASE_GENERIC_OBJECTS_CATALOG } from '../../catalog/firestoreDocuments/birthTeamDocument.catalog.js'
import {
  PLAYER_SCOUT_NULLABLE_STRUCTURED_FIELDS,
  PLAYERS_DATABASE_GENERIC_OBJECTS_CATALOG,
} from '../../catalog/firestoreDocuments/playerDocument.catalog.js'
import { SEARCHINDEX_BIRTH_TEAM_SEASON_GENERIC_OBJECT } from '../../catalog/firestoreDocuments/searchIndexBirthTeamSeason.catalog.js'
import { SEARCHINDEX_PLAYER_SEASON_GENERIC_OBJECT } from '../../catalog/firestoreDocuments/searchIndexPlayerSeason.catalog.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'

const REWRITE_PLAN_VERSION = 4
const WRITE_BATCH_SIZE = 100
const WRITE_BATCH_MAX_BYTES = 3_000_000
const WRITE_TARGET_OVERHEAD_BYTES = 1024
const REWRITE_PLAN_CACHE_LIMIT = 2

const rewritePlanCache = new Map()

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const isPlainObject = value => (
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype
)

const hasOwn = (source, key) => (
  source !== null &&
  source !== undefined &&
  Object.prototype.hasOwnProperty.call(source, key)
)

const unique = values => [
  ...new Set(
    (Array.isArray(values) ? values : [])
      .map(clean)
      .filter(Boolean)
  ),
]

const estimateUtf8Bytes = value => {
  try {
    return new TextEncoder().encode(JSON.stringify(value)).length
  } catch (error) {
    return WRITE_BATCH_MAX_BYTES
  }
}

const estimateRewriteTargetBytes = target => (
  estimateUtf8Bytes(target?.data || {}) +
  estimateUtf8Bytes(target?.collection || '') +
  estimateUtf8Bytes(target?.documentId || '') +
  WRITE_TARGET_OVERHEAD_BYTES
)

const buildWriteBatches = targets => {
  const safeTargets = Array.isArray(targets) ? targets : []
  const batches = []
  let currentBatch = []
  let currentBytes = 0

  safeTargets.forEach(target => {
    const targetBytes = estimateRewriteTargetBytes(target)
    const exceedsCount = currentBatch.length >= WRITE_BATCH_SIZE
    const exceedsBytes = (
      currentBatch.length > 0 &&
      currentBytes + targetBytes > WRITE_BATCH_MAX_BYTES
    )

    if (exceedsCount || exceedsBytes) {
      batches.push(currentBatch)
      currentBatch = []
      currentBytes = 0
    }

    currentBatch.push(target)
    currentBytes += targetBytes
  })

  if (currentBatch.length) batches.push(currentBatch)

  return batches
}


const isPayloadSizeError = error => {
  const message = clean(error?.message).toLowerCase()
  return (
    message.includes('request payload size exceeds the limit') ||
    message.includes('payload size exceeds the limit') ||
    message.includes('request too large')
  )
}

const commitRewriteTargets = async ({
  targets,
  plan,
  audit,
  logicalBatchIndex,
  committedResults,
  splitDepth = 0,
  splitIndex = 0,
}) => {
  const batch = createTrackedWriteBatch(db, {
    feature: 'playersDatabase',
    collection: 'multi',
    action: 'playerScoutDocumentRewrite',
    operationSubtype: 'maintenance-write-batch',
    meta: {
      logicalBatchIndex,
      splitDepth,
      splitIndex,
      planVersion: plan.version,
      sourceAuditGeneratedAt: audit.documentRewritePlan.sourceAuditGeneratedAt,
    },
  })

  targets.forEach(target => {
    const ref = doc(db, target.collection, target.documentId)
    batch.set(ref, {
      ...target.data,
      updatedAt: serverTimestamp(),
    })
  })

  try {
    await batch.commit()
    const result = {
      logicalBatchIndex,
      splitDepth,
      splitIndex,
      writes: targets.length,
      documentIds: targets.map(target => target.documentId),
    }
    committedResults.push(result)
    return [result]
  } catch (error) {
    if (isPayloadSizeError(error) && targets.length > 1) {
      const middle = Math.ceil(targets.length / 2)
      const firstTargets = targets.slice(0, middle)
      const secondTargets = targets.slice(middle)
      const firstResults = await commitRewriteTargets({
        targets: firstTargets,
        plan,
        audit,
        logicalBatchIndex,
        committedResults,
        splitDepth: splitDepth + 1,
        splitIndex: splitIndex * 2,
      })
      const secondResults = await commitRewriteTargets({
        targets: secondTargets,
        plan,
        audit,
        logicalBatchIndex,
        committedResults,
        splitDepth: splitDepth + 1,
        splitIndex: splitIndex * 2 + 1,
      })
      return [...firstResults, ...secondResults]
    }

    if (isPayloadSizeError(error) && targets.length === 1) {
      const target = targets[0]
      const singleError = new Error([
        'Single document exceeds Firestore request payload limit',
        `${target.collection}/${target.documentId}`,
        clean(error?.message),
      ].filter(Boolean).join(' | '))
      singleError.cause = error
      singleError.failedTarget = {
        collection: target.collection,
        documentId: target.documentId,
        estimatedBytes: estimateRewriteTargetBytes(target),
      }
      throw singleError
    }

    throw error
  }
}

const defaultFromTemplate = template => {
  if (Array.isArray(template)) return []

  if (isPlainObject(template)) {
    return Object.entries(template).reduce((result, [key, value]) => {
      result[key] = defaultFromTemplate(value)
      return result
    }, {})
  }

  return template
}

const alignToTemplate = ({ source, template, fieldName = '' }) => {
  if (
    source === null &&
    PLAYER_SCOUT_NULLABLE_STRUCTURED_FIELDS.includes(fieldName)
  ) {
    return null
  }
  if (Array.isArray(template)) {
    if (!Array.isArray(source)) return []

    if (!template.length) {
      return source
    }

    return source.map(item => alignToTemplate({
      source: item,
      template: template[0],
      fieldName,
    }))
  }

  if (isPlainObject(template)) {
    const safeSource = isPlainObject(source) ? source : {}

    return Object.entries(template).reduce((result, [key, value]) => {
      result[key] = hasOwn(safeSource, key)
        ? alignToTemplate({
            source: safeSource[key],
            template: value,
            fieldName: key,
          })
        : defaultFromTemplate(value)

      return result
    }, {})
  }

  return source === undefined
    ? defaultFromTemplate(template)
    : source
}

const profileTemplate = (
  PLAYERS_DATABASE_GENERIC_OBJECTS_CATALOG.current?.[0]?.scoutProfiles?.[0] ||
  null
)

const alignScoutProfiles = profiles => {
  if (!profileTemplate || !Array.isArray(profiles)) {
    return Array.isArray(profiles) ? profiles : []
  }

  return profiles.map(profile => alignToTemplate({
    source: profile,
    template: profileTemplate,
  }))
}

const normalizeComparable = value => {
  if (Array.isArray(value)) {
    return value.map(normalizeComparable)
  }

  if (value && typeof value.toMillis === 'function') {
    return {
      __firestoreTimestamp: value.toMillis(),
    }
  }

  if (value instanceof Date) {
    return {
      __date: value.toISOString(),
    }
  }

  if (isPlainObject(value)) {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = normalizeComparable(value[key])
        return result
      }, {})
  }

  return value
}

const valuesEqual = (left, right) => (
  JSON.stringify(normalizeComparable(left)) ===
  JSON.stringify(normalizeComparable(right))
)

const collectDiffPaths = ({
  actual,
  expected,
  prefix = '',
  added = [],
  removed = [],
  changed = [],
}) => {
  const actualObject = isPlainObject(actual)
  const expectedObject = isPlainObject(expected)

  if (actualObject && expectedObject) {
    const keys = new Set([
      ...Object.keys(actual),
      ...Object.keys(expected),
    ])

    keys.forEach(key => {
      const path = prefix ? `${prefix}.${key}` : key
      const hasActual = hasOwn(actual, key)
      const hasExpected = hasOwn(expected, key)

      if (!hasActual && hasExpected) {
        added.push(path)
        return
      }

      if (hasActual && !hasExpected) {
        removed.push(path)
        return
      }

      collectDiffPaths({
        actual: actual[key],
        expected: expected[key],
        prefix: path,
        added,
        removed,
        changed,
      })
    })

    return { added, removed, changed }
  }

  if (!valuesEqual(actual, expected)) {
    changed.push(prefix || '$')
  }

  return { added, removed, changed }
}

const normalizeSeasonKey = value => {
  const source = clean(value).toLowerCase()
  if (!source) return ''

  const match = source.match(/^(?:s)?(\d{2,4})[\/_-](\d{2,4})$/)
  if (!match) return source

  const start = match[1].slice(-2)
  const end = match[2].slice(-2)
  return `${start}/${end}`
}

const seasonKeyOf = source => normalizeSeasonKey(
  source?.seasonKey ||
  source?.seasonId ||
  source?.season
)

const teamDocumentIdOf = source => clean(
  source?.teamDocumentId ||
  source?.birthTeamDocumentId ||
  source?.sourceDocumentId
)

const playerIdentityValues = source => unique([
  source?.playerDocumentId,
  source?.resolvedPlayerDocumentId,
  source?.playerId,
  source?.externalPlayerId,
  source?.identityKey,
])

const normalizedNameOf = source => clean(
  source?.normalizedName ||
  source?.fullName ||
  source?.displayName
).toLocaleLowerCase('he-IL')

const samePlayer = ({ left, right }) => {
  const leftIds = playerIdentityValues(left)
  const rightIds = playerIdentityValues(right)
  const sharedIdentity = leftIds.some(value => rightIds.includes(value))

  if (sharedIdentity) return true
  if (leftIds.length && rightIds.length) return false

  const leftName = normalizedNameOf(left)
  const rightName = normalizedNameOf(right)

  return Boolean(leftName && rightName && leftName === rightName)
}

const sameSeason = ({ left, right }) => (
  seasonKeyOf(left) &&
  seasonKeyOf(left) === seasonKeyOf(right)
)

const teamIdentityValues = source => unique([
  source?.teamDocumentId,
  source?.birthTeamDocumentId,
  source?.teamId,
  source?.birthTeamId,
])

const sameTeamWhenKnown = ({ left, right }) => {
  const leftIds = teamIdentityValues(left)
  const rightIds = teamIdentityValues(right)

  if (!leftIds.length || !rightIds.length) return false

  return leftIds.some(value => rightIds.includes(value))
}

const sameTeamStrict = ({ left, right }) => {
  const leftIds = teamIdentityValues(left)
  const rightIds = teamIdentityValues(right)

  if (!leftIds.length || !rightIds.length) return false

  return leftIds.some(value => rightIds.includes(value))
}

const sameTeamProjectionContext = ({ left, right }) => {
  const leftIds = teamIdentityValues(left)
  const rightIds = teamIdentityValues(right)

  if (leftIds.length && rightIds.length) {
    return leftIds.some(value => rightIds.includes(value))
  }

  const leftClubId = clean(left?.clubId)
  const rightClubId = clean(right?.clubId)
  if (!leftClubId || !rightClubId || leftClubId !== rightClubId) {
    return false
  }

  const leftAgeGroupId = clean(left?.ageGroupId)
  const rightAgeGroupId = clean(right?.ageGroupId)
  if (leftAgeGroupId && rightAgeGroupId) {
    return leftAgeGroupId === rightAgeGroupId
  }

  const leftBirthYear = Number(left?.birthYear || 0)
  const rightBirthYear = Number(right?.birthYear || 0)
  if (leftBirthYear && rightBirthYear) {
    return leftBirthYear === rightBirthYear
  }

  return false
}

const findRecalculatedRow = ({
  rows,
  player,
  season,
  sourceDocumentId = '',
  sourceTarget = '',
}) => {
  const candidates = (Array.isArray(rows) ? rows : []).filter(row => {
    if (sourceDocumentId && teamDocumentIdOf(row) !== clean(sourceDocumentId)) {
      return false
    }
    if (sourceTarget && clean(row.sourceTarget) !== clean(sourceTarget)) {
      return false
    }

    return (
      sameSeason({ left: row, right: season }) &&
      samePlayer({ left: row, right: player })
    )
  })

  return candidates.length === 1 ? candidates[0] : null
}

const applyExpectedScoutState = ({
  source,
  state,
  profiles,
  combinations,
}) => {
  if (!isPlainObject(state)) return source

  return {
    ...source,
    ...state,
    scoutProfiles: alignScoutProfiles(profiles),
    scoutCombinations: Array.isArray(combinations) ? combinations : [],
  }
}

const buildCanonicalTeamDocument = ({ snapshot, recalculatedRows }) => {
  const source = snapshot.data() || {}
  const next = {
    ...source,
    current: Array.isArray(source.current) ? source.current.map(season => ({
      ...season,
      teamPlayers: (Array.isArray(season.teamPlayers)
        ? season.teamPlayers
        : []
      ).map(player => {
        const row = findRecalculatedRow({
          rows: recalculatedRows,
          player,
          season,
          sourceDocumentId: snapshot.id,
          sourceTarget: 'current',
        })

        const patched = row?.canRecalculateScout
          ? applyExpectedScoutState({
              source: {
                ...player,
                scoutStatsLoadMeasurements:
                  row.expectedScoutStatsLoadMeasurements ||
                  player.scoutStatsLoadMeasurements,
              },
              state: row.expectedTeamScoutState,
              profiles: row.expectedTeamScoutProfiles,
              combinations: row.expectedTeamScoutCombinations,
            })
          : player

        return {
          ...patched,
          scoutProfiles: alignScoutProfiles(patched.scoutProfiles),
        }
      }),
    })) : [],
    history: Array.isArray(source.history) ? source.history.map(season => ({
      ...season,
      teamPlayers: (Array.isArray(season.teamPlayers)
        ? season.teamPlayers
        : []
      ).map(player => {
        const row = findRecalculatedRow({
          rows: recalculatedRows,
          player,
          season,
          sourceDocumentId: snapshot.id,
          sourceTarget: 'history',
        })

        const patched = row?.canRecalculateScout
          ? applyExpectedScoutState({
              source: {
                ...player,
                scoutStatsLoadMeasurements:
                  row.expectedScoutStatsLoadMeasurements ||
                  player.scoutStatsLoadMeasurements,
              },
              state: row.expectedTeamScoutState,
              profiles: row.expectedTeamScoutProfiles,
              combinations: row.expectedTeamScoutCombinations,
            })
          : player

        return {
          ...patched,
          scoutProfiles: alignScoutProfiles(patched.scoutProfiles),
        }
      }),
    })) : [],
  }

  return alignToTemplate({
    source: next,
    template: BIRTH_TEAMS_DATABASE_GENERIC_OBJECTS_CATALOG,
  })
}

const findPlayerRowForSeason = ({
  rows,
  documentId,
  playerDocument,
  season,
}) => {
  const candidates = (Array.isArray(rows) ? rows : []).filter(row => {
    const rowDocumentId = clean(
      row.resolvedPlayerDocumentId ||
      row.playerDocumentId
    )

    if (rowDocumentId && rowDocumentId !== clean(documentId)) return false
    if (!sameSeason({ left: row, right: season })) return false
    if (!sameTeamWhenKnown({ left: row, right: season })) return false

    return samePlayer({
      left: row,
      right: {
        ...playerDocument,
        ...season,
        playerDocumentId: documentId,
      },
    })
  })

  return candidates.length === 1 ? candidates[0] : null
}

const buildCanonicalPlayerDocument = ({ snapshot, recalculatedRows }) => {
  const source = snapshot.data() || {}

  const patchSeasons = seasons => (
    (Array.isArray(seasons) ? seasons : []).map(season => {
      const row = findPlayerRowForSeason({
        rows: recalculatedRows,
        documentId: snapshot.id,
        playerDocument: source,
        season,
      })

      const patched = row?.expectedPlayerScoutState
        ? applyExpectedScoutState({
            source: season,
            state: row.expectedPlayerScoutState,
            profiles: row.expectedPlayerScoutProfiles,
            combinations: row.expectedPlayerScoutCombinations,
          })
        : season

      return {
        ...patched,
        scoutProfiles: alignScoutProfiles(patched.scoutProfiles),
      }
    })
  )

  return alignToTemplate({
    source: {
      ...source,
      current: patchSeasons(source.current),
      history: patchSeasons(source.history),
    },
    template: PLAYERS_DATABASE_GENERIC_OBJECTS_CATALOG,
  })
}

const findProjectionRow = ({ rows, source }) => {
  const baseCandidates = (Array.isArray(rows) ? rows : []).filter(row => (
    sameSeason({ left: row, right: source }) &&
    samePlayer({ left: row, right: source })
  ))

  const strictCandidates = baseCandidates.filter(row => (
    sameTeamStrict({ left: row, right: source })
  ))

  if (strictCandidates.length === 1) return strictCandidates[0]
  if (strictCandidates.length > 1) return null

  const contextualCandidates = baseCandidates.filter(row => (
    sameTeamProjectionContext({ left: row, right: source })
  ))

  return contextualCandidates.length === 1
    ? contextualCandidates[0]
    : null
}

const buildCanonicalPlayerSearchDocument = ({
  snapshot,
  recalculatedRows,
}) => {
  const source = snapshot.data() || {}
  const row = findProjectionRow({
    rows: recalculatedRows,
    source,
  })

  if (!row) {
    return {
      skipRewrite: true,
      skipReason: 'unsafe_or_ambiguous_player_projection_match',
    }
  }

  const sourcePlayerDocumentId = clean(source.playerDocumentId)
  const playerDocumentExists = row.playerDocumentExists === true
  const playerDocumentTrackingRequired = row.playerDocumentTrackingRequired === true
  const resolvedPlayerDocumentId = clean(
    row.resolvedPlayerDocumentId || row.playerDocumentId
  )

  if (!playerDocumentExists && playerDocumentTrackingRequired) {
    return {
      skipRewrite: true,
      skipReason: 'required_player_document_missing',
    }
  }

  if (
    playerDocumentExists &&
    sourcePlayerDocumentId &&
    resolvedPlayerDocumentId &&
    sourcePlayerDocumentId !== resolvedPlayerDocumentId
  ) {
    return {
      skipRewrite: true,
      skipReason: 'tracked_player_document_identity_mismatch',
    }
  }

  const canonicalPlayerDocumentId = playerDocumentExists
    ? resolvedPlayerDocumentId
    : ''
  const patched = row.expectedSearchIndexScoutFields
    ? {
        ...source,
        ...row.expectedSearchIndexScoutFields,
        playerDocumentId: canonicalPlayerDocumentId,
      }
    : {
        ...source,
        playerDocumentId: canonicalPlayerDocumentId,
      }

  return {
    canonical: alignToTemplate({
      source: patched,
      template: SEARCHINDEX_PLAYER_SEASON_GENERIC_OBJECT,
    }),
  }
}

const buildCanonicalTeamSearchDocument = snapshot => alignToTemplate({
  source: snapshot.data() || {},
  template: SEARCHINDEX_BIRTH_TEAM_SEASON_GENERIC_OBJECT,
})

const buildTarget = ({
  snapshot,
  collection,
  documentType,
  canonical,
}) => {
  const actual = snapshot.data() || {}
  if (valuesEqual(actual, canonical)) return null

  const diff = collectDiffPaths({
    actual,
    expected: canonical,
  })

  return {
    collection,
    documentId: snapshot.id,
    documentType,
    data: canonical,
    addedFields: diff.added,
    removedFields: diff.removed,
    changedFields: diff.changed,
  }
}

const buildTargetsForSnapshots = ({
  snapshots,
  collection,
  documentType,
  builder,
}) => (
  (Array.isArray(snapshots) ? snapshots : []).reduce((result, snapshot) => {
    const built = builder(snapshot)

    if (built?.skipRewrite === true) {
      result.skipped.push({
        collection,
        documentId: snapshot.id,
        documentType,
        reason: clean(built.skipReason) || 'rewrite_skipped_for_safety',
      })
      return result
    }

    const canonical = built?.canonical || built
    const target = buildTarget({
      snapshot,
      collection,
      documentType,
      canonical,
    })

    if (target) result.targets.push(target)

    return result
  }, { targets: [], skipped: [] })
)

const summarizeTargets = ({ targets, skipped }) => {
  const safeTargets = Array.isArray(targets) ? targets : []
  const safeSkipped = Array.isArray(skipped) ? skipped : []
  const byType = safeTargets.reduce((result, target) => {
    const key = clean(target.documentType) || 'unknown'
    result[key] = Number(result[key] || 0) + 1
    return result
  }, {})

  const skippedByReason = safeSkipped.reduce((result, item) => {
    const reason = clean(item.reason) || 'rewrite_skipped_for_safety'
    result[reason] = Number(result[reason] || 0) + 1
    return result
  }, {})

  return {
    documentsToRewrite: safeTargets.length,
    documentsSkippedForSafety: safeSkipped.length,
    documentsSkippedForSafetyByReason: skippedByReason,
    teamDocuments: Number(byType.teamDocument || 0),
    playerDocuments: Number(byType.playerDocument || 0),
    playerSearchIndexes: Number(byType.playerSearchIndex || 0),
    teamSearchIndexes: Number(byType.teamSearchIndex || 0),
    fieldsAdded: safeTargets.reduce(
      (sum, target) => sum + target.addedFields.length,
      0
    ),
    fieldsRemoved: safeTargets.reduce(
      (sum, target) => sum + target.removedFields.length,
      0
    ),
    fieldsChanged: safeTargets.reduce(
      (sum, target) => sum + target.changedFields.length,
      0
    ),
    batches: buildWriteBatches(safeTargets).length,
  }
}

const storeRewritePlan = plan => {
  const planId = [
    Date.now(),
    Math.random().toString(36).slice(2, 10),
  ].join('-')

  rewritePlanCache.set(planId, plan)

  while (rewritePlanCache.size > REWRITE_PLAN_CACHE_LIMIT) {
    const oldestPlanId = rewritePlanCache.keys().next().value
    rewritePlanCache.delete(oldestPlanId)
  }

  return {
    planId,
    version: plan.version,
    generatedAt: plan.generatedAt,
    sourceAuditGeneratedAt: plan.sourceAuditGeneratedAt,
    strategy: plan.strategy,
    sourceOfTruth: plan.sourceOfTruth,
    readPolicy: plan.readPolicy,
    writePolicy: plan.writePolicy,
    summary: plan.summary,
  }
}

const getStoredRewritePlan = descriptor => {
  const planId = clean(descriptor?.planId)
  if (!planId) return null

  return rewritePlanCache.get(planId) || null
}

export const buildPlayerScoutDocumentRewritePlan = ({
  teamSnapshots = [],
  playerSnapshots = [],
  playerSearchSnapshots = [],
  teamSearchSnapshots = [],
  recalculatedRows = [],
  auditGeneratedAt = '',
} = {}) => {
  const teamResult = buildTargetsForSnapshots({
    snapshots: teamSnapshots,
    collection: PLAYERS_DATABASE_COLLECTIONS.teams,
    documentType: 'teamDocument',
    builder: snapshot => buildCanonicalTeamDocument({
      snapshot,
      recalculatedRows,
    }),
  })
  const playerResult = buildTargetsForSnapshots({
    snapshots: playerSnapshots,
    collection: PLAYERS_DATABASE_COLLECTIONS.players,
    documentType: 'playerDocument',
    builder: snapshot => buildCanonicalPlayerDocument({
      snapshot,
      recalculatedRows,
    }),
  })
  const playerSearchResult = buildTargetsForSnapshots({
    snapshots: playerSearchSnapshots,
    collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    documentType: 'playerSearchIndex',
    builder: snapshot => buildCanonicalPlayerSearchDocument({
      snapshot,
      recalculatedRows,
    }),
  })
  const teamSearchResult = buildTargetsForSnapshots({
    snapshots: teamSearchSnapshots,
    collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    documentType: 'teamSearchIndex',
    builder: buildCanonicalTeamSearchDocument,
  })
  const targets = [
    ...teamResult.targets,
    ...playerResult.targets,
    ...playerSearchResult.targets,
    ...teamSearchResult.targets,
  ]
  const skipped = [
    ...teamResult.skipped,
    ...playerResult.skipped,
    ...playerSearchResult.skipped,
    ...teamSearchResult.skipped,
  ]

  return storeRewritePlan({
    version: REWRITE_PLAN_VERSION,
    generatedAt: new Date().toISOString(),
    sourceAuditGeneratedAt: clean(auditGeneratedAt),
    strategy: 'catalog-canonical-full-document-rewrite',
    sourceOfTruth: {
      teamSeason: 'dbBirthTeams',
      playerDocument: 'dbPlayers',
      searchIndex: 'projection',
      schema: 'direct document catalogs',
    },
    readPolicy: {
      auditReadsReused: true,
      applyReads: 0,
      conflictCheckReads: 0,
    },
    writePolicy: {
      fullDocumentReplacement: true,
      removesUnexpectedFields: true,
      addsMissingCatalogFields: true,
      refreshesComputedScoutStateWhenRecalculationIsAvailable: true,
      batchSize: WRITE_BATCH_SIZE,
      batchMaxEstimatedBytes: WRITE_BATCH_MAX_BYTES,
    },
    summary: summarizeTargets({ targets, skipped }),
    targets,
    skipped,
  })
}

export const buildPlayerScoutDocumentRewritePreview = ({ audit } = {}) => {
  if (!audit) {
    throw new Error('Document rewrite preview requires a source audit')
  }

  if (audit.repairDataIncluded !== true) {
    throw new Error(
      'Document rewrite requires an audit created with includeRepairData: true'
    )
  }

  const plan = audit.documentRewritePlan

  if (!plan || plan.version !== REWRITE_PLAN_VERSION) {
    throw new Error(
      'Document rewrite plan is missing. Run the audit again with the current code.'
    )
  }

  return {
    generatedAt: new Date().toISOString(),
    mode: 'document-rewrite-preview',
    planVersion: plan.version,
    sourceAuditGeneratedAt: plan.sourceAuditGeneratedAt,
    summary: plan.summary,
    cost: {
      reads: 0,
      writesMaximum: plan.summary.documentsToRewrite,
      batches: plan.summary.batches,
    },
    policy: {
      ...plan.readPolicy,
      ...plan.writePolicy,
    },
  }
}

export const applyPlayerScoutDocumentRewrite = async ({
  confirmed = false,
  audit,
} = {}) => {
  if (!confirmed) {
    throw new Error('Document rewrite requires explicit confirmation')
  }

  const preview = buildPlayerScoutDocumentRewritePreview({ audit })
  const plan = getStoredRewritePlan(audit.documentRewritePlan)

  if (!plan) {
    throw new Error(
      'Document rewrite plan expired from memory. Run the audit again before Apply.'
    )
  }

  const targetBatches = buildWriteBatches(plan.targets)
  const committedResults = []

  for (let batchIndex = 0; batchIndex < targetBatches.length; batchIndex += 1) {
    const targets = targetBatches[batchIndex]

    try {
      await commitRewriteTargets({
        targets,
        plan,
        audit,
        logicalBatchIndex: batchIndex,
        committedResults,
      })
    } catch (error) {
      const causeMessage = clean(error?.message)
      const writesCommitted = committedResults.reduce(
        (sum, result) => sum + result.writes,
        0
      )
      const failure = new Error([
        `Document rewrite failed at batch ${batchIndex}`,
        causeMessage ? `Firestore: ${causeMessage}` : '',
      ].filter(Boolean).join(' | '))
      failure.cause = error
      failure.stage = 'document_rewrite_apply'
      failure.failedBatchIndex = batchIndex
      failure.batchesCommitted = committedResults.length
      failure.writesCommitted = writesCommitted
      failure.pendingWrites = plan.targets.length - writesCommitted
      failure.failedTarget = error?.failedTarget || null
      throw failure
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    mode: 'document-rewrite-apply',
    sourceAuditGeneratedAt: audit.documentRewritePlan.sourceAuditGeneratedAt,
    readsPerformed: 0,
    writesPerformed: plan.targets.length,
    batchesCommitted: committedResults.length,
    summary: preview.summary,
    results: committedResults,
    verificationRequired: true,
    verificationRanAutomatically: false,
  }
}
