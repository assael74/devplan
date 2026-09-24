const clean = value => String(value === undefined || value === null ? '' : value).trim()

const MANIFEST_SCHEMA_VERSION = 9
const MAX_INLINE_MANIFEST_BYTES = 700 * 1024

const byteLength = value => {
  const serialized = JSON.stringify(value)
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(serialized).length
  return serialized.length
}

const buildPlayerDocumentOperations = ({ playerScout = null, sourceRevision = '' } = {}) => (
  (Array.isArray(playerScout?.entries) ? playerScout.entries : []).map(entry => {
    const plan = entry?.approvedPlan || {}
    const playerDocumentId = clean(plan.playerDocumentId)
    const action = clean(plan.action || (plan.writeSkipped ? 'retain' : 'skip'))

    if (action === 'delete') {
      const error = new Error('Stats flow cannot delete Player Documents')
      error.code = 'STATS_PLAYER_DOCUMENT_DELETE_NOT_ALLOWED'
      error.playerDocumentId = playerDocumentId
      throw error
    }

    if (!['create', 'update'].includes(action)) return null
    if (!playerDocumentId) {
      throw new Error('Missing Player Document id for stats projection operation')
    }
    if (!plan.patch || typeof plan.patch !== 'object') {
      throw new Error('Missing Player Document patch for stats projection operation')
    }

    return {
      operationType: 'playerDocument',
      operationId: `playerDocument__${playerDocumentId}__${clean(sourceRevision)}`,
      playerDocumentId,
      action,
      patch: plan.patch,
      trackedAt: clean(plan.trackedAt),
    }
  }).filter(Boolean)
)

const buildCounterpartMovementOperations = ({ counterparts = null, sourceRevision = '' } = {}) => (
  (Array.isArray(counterparts?.operations) ? counterparts.operations : []).map(operation => {
    const birthTeamDocumentId = clean(operation?.birthTeamDocumentId)
    const seasonKey = clean(operation?.seasonKey)
    if (!operation?.changed || !birthTeamDocumentId || !seasonKey) return null

    return {
      operationType: 'counterpartMovement',
      operationId: `counterpartMovement__${birthTeamDocumentId}__${seasonKey}__${clean(sourceRevision)}`,
      sourceRevision: clean(sourceRevision),
      target: {
        birthTeamDocumentId,
        seasonKey,
      },
      expected: {
        counterpartRosterProjectionRevision: clean(operation?.counterpartRosterProjectionRevision),
        counterpartMovementProjectionRevision: clean(operation?.counterpartMovementProjectionRevision),
      },
      patch: operation?.patch && typeof operation.patch === 'object' ? operation.patch : {},
    }
  }).filter(Boolean)
)

const buildCounterpartClubOperations = ({ counterpartProjections = null, sourceRevision = '' } = {}) => {
  const clubProjection = []

  for (const operation of Array.isArray(counterpartProjections?.operations)
    ? counterpartProjections.operations
    : []) {
    const clubId = clean(operation?.clubId)
    const guards = Array.isArray(operation?.counterpartGuards) ? operation.counterpartGuards : []
    const clubFingerprint = clean(operation?.clubFingerprint)
    if (!clubId || guards.length === 0 || !clubFingerprint || !operation?.projectedClub) {
      const error = new Error('Incomplete approved aggregated Counterpart Club projection operation')
      error.code = 'STATS_COUNTERPART_CLUB_OPERATION_INVALID'
      throw error
    }

    clubProjection.push({
      operationType: 'counterpartClubProjection',
      operationId: `counterpartClub__${clubId}__${clean(sourceRevision)}`,
      sourceRevision: clean(sourceRevision),
      target: { clubId },
      expected: {
        counterpartGuardsRequired: true,
        counterpartGuards: guards,
        targetExists: operation.clubExists === true,
        targetFingerprint: clubFingerprint,
      },
      patch: { document: operation.projectedClub },
    })
  }

  const master = counterpartProjections?.masterProjection
  const clubsMaster = []
  if (master && !master.skipped) {
    const guards = Array.isArray(master.counterpartGuards) ? master.counterpartGuards : []
    const fingerprint = clean(master.clubsMasterFingerprint)
    if (guards.length === 0 || !fingerprint || !Array.isArray(master.projectedMasterClubs)) {
      const error = new Error('Incomplete approved aggregated Counterpart ClubsMaster operation')
      error.code = 'STATS_COUNTERPART_CLUBS_MASTER_OPERATION_INVALID'
      throw error
    }
    clubsMaster.push({
      operationType: 'counterpartClubsMaster',
      operationId: `counterpartClubsMaster__all__${clean(sourceRevision)}`,
      sourceRevision: clean(sourceRevision),
      target: { documentId: 'all' },
      expected: {
        counterpartGuardsRequired: true,
        counterpartGuards: guards,
        targetFingerprint: fingerprint,
      },
      patch: { clubs: master.projectedMasterClubs },
    })
  }

  return { clubProjection, clubsMaster }
}

export const buildStatsProjectionManifest = ({ approvedStatsPlan = null } = {}) => {
  const plan = approvedStatsPlan || {}
  const canonicalCommit = plan.canonical?.canonicalCommit || {}
  const sourceRevision = clean(plan.statsProjectionRevision)
  const teamSeasonDocumentId = clean(canonicalCommit.teamSeasonDocumentId)

  if (plan.planType !== 'approvedStatsPlan') {
    throw new Error('Missing approved stats plan for projection manifest')
  }
  if (!sourceRevision) throw new Error('Missing stats projection revision for projection manifest')
  if (!teamSeasonDocumentId) throw new Error('Missing Team Season id for projection manifest')

  const playerDocuments = buildPlayerDocumentOperations({
    playerScout: plan.playerScout,
    sourceRevision,
  })
  const counterpartMovement = buildCounterpartMovementOperations({
    counterparts: plan.counterparts,
    sourceRevision,
  })
  const counterpartClub = buildCounterpartClubOperations({
    counterpartProjections: plan.counterpartProjections,
    sourceRevision,
  })
  const teamScout = plan.teamScout || {}
  const playerSeasonIndexes = plan.playerSeasonIndexes || {}
  const leagueMetadata = plan.leagueMetadata || {}
  const teamSeasonIndex = plan.teamSeasonIndex || {}
  const mainClubProjection = plan.mainClubProjection || {}
  const leagueMetadataOperations = Array.isArray(leagueMetadata.operations)
    ? leagueMetadata.operations
    : []
  const leaguesMasterOperations = Array.isArray(leagueMetadata.leaguesMasterOperations)
    ? leagueMetadata.leaguesMasterOperations
    : []
  const playerSeasonIndexOperations = Array.isArray(playerSeasonIndexes.operations)
    ? playerSeasonIndexes.operations
    : []
  const expectedPlayerSeasonIndexDocumentIds = Array.isArray(
    playerSeasonIndexes.expectedDocumentIds
  )
    ? playerSeasonIndexes.expectedDocumentIds
    : playerSeasonIndexOperations
      .filter(operation => operation?.action === 'set')
      .map(operation => clean(operation?.documentId))
      .filter(Boolean)

  const manifest = {
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    sourceRevision,
    teamSeasonDocumentId,
    operations: {
      playerDocuments,
      counterpartMovement,
      counterpartClubProjection: counterpartClub.clubProjection,
      counterpartClubsMaster: counterpartClub.clubsMaster,
      teamScout: {
        operationType: 'teamScout',
        operationId: `teamScout__${teamSeasonDocumentId}__${sourceRevision}`,
        sourceRevision,
        teamSeasonDocumentId,
        changed: teamScout.changed === true,
        patch: {
          teamPlayers: Array.isArray(teamScout.players) ? teamScout.players : [],
          playersCount: Number.isFinite(Number(teamScout.playersCount))
            ? Number(teamScout.playersCount)
            : 0,
          scoutProfilesSummary: teamScout.scoutProfilesSummary || null,
        },
      },
      playerSeasonIndexes: playerSeasonIndexOperations,
      leagueMetadata: leagueMetadataOperations,
      leaguesMasterMetadata: leaguesMasterOperations,
      teamSeasonIndex: teamSeasonIndex.operation || null,
      mainClubProjection: Array.isArray(mainClubProjection.operations)
        ? mainClubProjection.operations
        : [],
      mainClubsMaster: Array.isArray(mainClubProjection.clubsMasterOperations)
        ? mainClubProjection.clubsMasterOperations
        : [],
    },
    deferred: {
      playerSeasonIndexes: {
        owner: 'functions',
        status: 'planned_functions_apply',
        expectedDocumentIds: expectedPlayerSeasonIndexDocumentIds,
        expectedCount: expectedPlayerSeasonIndexDocumentIds.length,
        operationsCount: playerSeasonIndexOperations.length,
        failedCount: Array.isArray(playerSeasonIndexes.failures)
          ? playerSeasonIndexes.failures.length
          : 0,
      },
      leagueMetadata: {
        owner: 'functions',
        status: 'planned_functions_apply',
        operationsCount: leagueMetadataOperations.length,
        leaguesMasterOperationsCount: leaguesMasterOperations.length,
        failedCount: Array.isArray(leagueMetadata.failures)
          ? leagueMetadata.failures.length
          : 0,
      },
      teamSeasonIndex: {
        owner: 'functions',
        status: 'planned_functions_apply',
        operationsCount: teamSeasonIndex.operation ? 1 : 0,
      },
      clubProjection: {
        owner: 'functions',
        status: 'planned_functions_apply',
        operationsCount: Array.isArray(mainClubProjection.operations)
          ? mainClubProjection.operations.length
          : 0,
        clubsMasterOperationsCount: Array.isArray(mainClubProjection.clubsMasterOperations)
          ? mainClubProjection.clubsMasterOperations.length
          : 0,
      },
    },
  }

  const manifestBytes = byteLength(manifest)
  if (manifestBytes > MAX_INLINE_MANIFEST_BYTES) {
    const error = new Error('Stats projection manifest is too large for inline persistence')
    error.code = 'STATS_PROJECTION_MANIFEST_TOO_LARGE'
    error.manifestBytes = manifestBytes
    throw error
  }

  return {
    ...manifest,
    manifestBytes,
  }
}

export const STATS_PROJECTION_MANIFEST_SCHEMA_VERSION = MANIFEST_SCHEMA_VERSION
