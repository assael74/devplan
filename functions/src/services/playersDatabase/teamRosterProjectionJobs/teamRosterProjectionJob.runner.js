const { db } = require('../../../config/admin')
const { claimTeamRosterProjectionJob, updateStage, complete, supersede, fail } = require('./teamRosterProjectionJob.repository')
const { updateWriteActionFromProjectionJob } = require('../writeActions/writeAction.repository')
const { evaluatePlayerSeasonIndexes } = require('./teamRosterProjectionJob.indexes')
const { applyApprovedRosterSyncPayload } = require('./teamRosterProjectionJob.applier')

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const buildTeamSeasonDocumentId = (teamId, seasonKey) => (
  `${clean(teamId)}__${clean(seasonKey).replace(/[^0-9a-zA-Z]+/g, '_')}`
)
const failVerification = (code, message) => {
  const error = new Error(message)
  error.code = code
  throw error
}

const sameSeason = (left, right) => clean(left).replace(/[^0-9a-zA-Z]+/g, '_') ===
  clean(right).replace(/[^0-9a-zA-Z]+/g, '_')

async function readCanonicalTeamSeason(job) {
  const id = clean(job.teamSeasonDocumentId)
  const snapshot = await db.collection('dbBirthTeamSeasons').doc(id).get()
  if (!snapshot.exists) throw new Error('Canonical Team Season was not found')
  const season = snapshot.data() || {}
  if (clean(season.rosterProjectionRevision) !== clean(job.sourceRevision)) {
    return { stale: true, teamSeasonDocumentId: id }
  }
  const canonicalRosterPlayers = Array.isArray(season.teamPlayers) ? season.teamPlayers : []
  return {
    teamSeasonDocumentId: id,
    teamId: clean(season.birthTeamDocumentId || season.teamDocumentId || job.teamId),
    seasonId: clean(season.seasonId || season.seasonKey || job.seasonId),
    seasonKey: clean(season.seasonKey || job.seasonKey),
    leagueId: clean(season.leagueId || job.source?.league?.id),
    clubId: clean(season.clubId),
    ageGroupId: clean(season.ageGroupId),
    birthTeamId: clean(season.birthTeamId || season.teamId || season.birthTeamDocumentId),
    birthTeamSlot: Number(season.birthTeamSlot || season.teamSlot || 1),
    playersCount: Number.isFinite(Number(season.playersCount))
      ? Number(season.playersCount)
      : canonicalRosterPlayers.length,
    canonicalRosterPlayers,
  }
}

async function inspectPlayerIndexes(source) {
  const indexes = await db.collection('dbSearchIndexes')
    .where('birthTeamId', '==', source.birthTeamId)
    .where('seasonKey', '==', source.seasonKey)
    .where('entityType', '==', 'playerSeason').get()
  const indexRows = indexes.docs.map(snapshot => ({ id: snapshot.id, ...(snapshot.data() || {}) }))
  const result = evaluatePlayerSeasonIndexes({ source, indexRows })

  if (!result.valid) {
    failVerification(
      'ROSTER_PLAYER_INDEX_CARDINALITY_MISMATCH',
      'Player SearchIndex documents must map one-to-one to canonical roster players'
    )
  }

  return {
    ...result,
    playerIndexDocumentIds: indexRows.map(row => row.id),
  }
}
async function inspectTeamAndLeagueIndexes(source, playerIndexes) {
  const teamIndexes = await db.collection('dbSearchIndexes')
    .where('teamSeasonDocumentId', '==', source.teamSeasonDocumentId).get()
  const matchingTeamIndexes = teamIndexes.docs
    .map(snapshot => ({ id: snapshot.id, ...(snapshot.data() || {}) }))
    .filter(row => clean(row.entityType) === 'birthTeamSeason')
  if (matchingTeamIndexes.length !== 1) {
    failVerification('ROSTER_TEAM_INDEX_MISSING', 'Expected exactly one Team SearchIndex for the canonical Team Season')
  }
  const teamIndex = matchingTeamIndexes[0]
  if (Number(teamIndex.playersCount) !== Number(source.playersCount) ||
      Number(teamIndex.playerSeasonIndexCount) !== Number(playerIndexes.playerIndexCount)) {
    failVerification('ROSTER_TEAM_INDEX_MISMATCH', 'Team SearchIndex roster counters do not match the canonical roster')
  }

  const leagueSnapshot = await db.collection('dbLeagues').doc(source.leagueId).get()
  if (!leagueSnapshot.exists) failVerification('ROSTER_LEAGUE_DOCUMENT_MISSING', 'League document required by the roster is missing')
  const league = leagueSnapshot.data() || {}
  const season = [league.current, ...(Array.isArray(league.history) ? league.history : [])]
    .find(item => sameSeason(item?.seasonKey || item?.seasonId, source.seasonKey))
  const rows = Array.isArray(season?.tableRank) ? season.tableRank : []
  const teamRows = rows.filter(row => (
    [row.birthTeamId, row.teamId, row.birthTeamDocumentId, row.teamDocumentId]
      .map(clean).includes(source.birthTeamId) ||
    [row.birthTeamId, row.teamId, row.birthTeamDocumentId, row.teamDocumentId]
      .map(clean).includes(source.teamId)
  ))
  if (teamRows.length !== 1 || Number(teamRows[0].playersCount) !== Number(source.playersCount)) {
    failVerification('ROSTER_LEAGUE_PROJECTION_MISMATCH', 'League table team metadata does not match the canonical roster')
  }
  return { teamIndexDocumentId: teamIndex.id, leagueId: source.leagueId, playersCount: source.playersCount }
}

async function inspectClubProjection(source) {
  if (!source.clubId) failVerification('ROSTER_CLUB_ID_MISSING', 'Canonical roster does not identify a Club projection target')
  const [clubSnapshot, masterSnapshot] = await db.getAll(
    db.collection('dbClubs').doc(source.clubId),
    db.collection('dbClubsMaster').doc('all')
  )
  if (!clubSnapshot.exists) failVerification('ROSTER_CLUB_PROJECTION_MISSING', 'Club projection is missing')
  const ageGroup = (Array.isArray(clubSnapshot.data()?.ageGroups) ? clubSnapshot.data().ageGroups : [])
    .find(group => clean(group?.ageGroupId) === source.ageGroupId)
  const clubSeason = (Array.isArray(ageGroup?.seasons) ? ageGroup.seasons : []).find(item => (
    sameSeason(item?.seasonKey || item?.seasonId, source.seasonKey) &&
    clean(item?.teamId) === source.birthTeamId &&
    clean(item?.league?.leagueId) === source.leagueId
  ))
  if (!clubSeason || Number(clubSeason.playersCount) !== Number(source.playersCount)) {
    failVerification('ROSTER_CLUB_PROJECTION_MISMATCH', 'Club roster projection does not match the canonical Team Season')
  }
  const masterRows = Array.isArray(masterSnapshot.data()?.clubs) ? masterSnapshot.data().clubs : []
  if (!masterSnapshot.exists || !masterRows.some(club => clean(club?.clubId) === source.clubId)) {
    failVerification('ROSTER_CLUB_MASTER_PROJECTION_MISSING', 'Clubs Master does not contain the projected Club')
  }
  return { clubId: source.clubId, clubsMasterContainsClub: true }
}

async function inspectCounterpartTransfers(job) {
  const requests = Array.isArray(job.counterpartRequests) ? job.counterpartRequests : []
  const inspected = await Promise.all(requests.map(async request => {
    const target = await db.collection('dbBirthTeamSeasons')
      .doc(buildTeamSeasonDocumentId(
        request.counterpartBirthTeamDocumentId,
        request.counterpartSeasonKey || request.seasonKey
      )).get()
    // A counterpart Team Season is optional. If it does not exist, the roster
    // flow deliberately does not create it merely to record a movement.
    if (!target.exists) return { ...request, status: 'counterpartMissing' }
    const targetData = target.data() || {}
    if (Object.prototype.hasOwnProperty.call(request, 'counterpartRosterProjectionRevision') &&
        clean(targetData.rosterProjectionRevision) !== clean(request.counterpartRosterProjectionRevision)) {
      return { ...request, status: 'counterpartSuperseded' }
    }
    const currentMovementRevision = clean(targetData.movementProjectionRevision)
    const expectedMovementRevision = clean(request.counterpartMovementProjectionRevision)
    const appliedMovementRevision = clean(job.sourceRevision)
    if (currentMovementRevision !== expectedMovementRevision &&
        currentMovementRevision !== appliedMovementRevision) {
      return { ...request, status: 'counterpartSuperseded' }
    }
    const facts = Array.isArray(targetData[clean(request.side)]) ? targetData[clean(request.side)] : []
    const synchronized = facts.some(fact => clean(fact?.movementId) === clean(request.movementId) && clean(fact?.playerId) === clean(request.playerId))
    return { ...request, status: synchronized ? 'synchronized' : 'missingCounterpartFact' }
  }))
  const missing = inspected.filter(item => item.status === 'missingCounterpartFact')
  if (missing.length) {
    const error = new Error(`${missing.length} transfer counterpart records were not synchronized`)
    error.code = 'ROSTER_TRANSFER_COUNTERPART_MISSING'
    throw error
  }
  return {
    requestedCount: requests.length,
    synchronizedCount: inspected.filter(item => item.status === 'synchronized').length,
    optionalMissingTeamSeasonCount: inspected.filter(item => item.status === 'counterpartMissing').length,
    supersededTargetCount: inspected.filter(item => item.status === 'counterpartSuperseded').length,
  }
}


const isObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const matchesApprovedValue = (actual, expected) => {
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual) || actual.length !== expected.length) return false
    return expected.every((value, index) => matchesApprovedValue(actual[index], value))
  }
  if (isObject(expected)) {
    if (!isObject(actual)) return false
    return Object.entries(expected).every(([key, value]) => matchesApprovedValue(actual[key], value))
  }
  return actual === expected
}

const failOperationVerification = (operation, message) => {
  const error = new Error(message)
  error.code = 'ROSTER_SYNC_PAYLOAD_VERIFICATION_MISMATCH'
  error.operationId = clean(operation?.operationId)
  throw error
}

const approvedOperations = (job, family) => {
  const rows = job.approvedSyncPayload?.operations?.[family]
  return Array.isArray(rows) ? rows : []
}

async function counterpartGuardIsCurrent(operation) {
  const expected = operation.expected || {}
  if (!expected.counterpartGuardRequired) return true
  const guard = expected.counterpartGuard || {}
  const teamId = clean(guard.birthTeamDocumentId)
  const seasonKey = clean(guard.seasonKey)
  const revision = clean(guard.rosterProjectionRevision)
  if (!teamId || !seasonKey || !revision) {
    failOperationVerification(operation, 'Counterpart-derived verification is missing revision guard')
  }
  const snapshot = await db.collection('dbBirthTeamSeasons')
    .doc(buildTeamSeasonDocumentId(teamId, seasonKey)).get()
  return snapshot.exists && clean(snapshot.data()?.rosterProjectionRevision) === revision
}

async function inspectApprovedLeagueOperations(job) {
  const operations = approvedOperations(job, 'leagueTeam')
  for (const operation of operations) {
    const leagueId = clean(operation.target?.leagueId)
    const snapshot = await db.collection('dbLeagues').doc(leagueId).get()
    if (!snapshot.exists) failOperationVerification(operation, 'Approved League target is missing')
    const league = snapshot.data() || {}
    const sourceTarget = clean(operation.target?.sourceTarget)
    const season = sourceTarget === 'current'
      ? league.current
      : (Array.isArray(league.history) ? league.history : []).find(row => sameSeason(
        row?.seasonKey || row?.seasonId,
        operation.target?.seasonKey
      ))
    const rows = Array.isArray(season?.tableRank) ? season.tableRank : []
    const rowKey = clean(operation.expected?.rowKey || operation.target?.birthTeamDocumentId)
    const row = rows.find(item => clean(
      item?.birthTeamDocumentId || item?.birthTeamId || item?.teamDocumentId || item?.teamId || item?.id
    ) === rowKey)
    if (!row || !matchesApprovedValue(row, operation.patch || {})) {
      failOperationVerification(operation, 'League row does not match approved roster sync patch')
    }
  }
  return { operationCount: operations.length }
}

async function inspectApprovedLeaguesMasterOperations(job) {
  const operations = approvedOperations(job, 'leaguesMaster')
  if (!operations.length) return { operationCount: 0 }
  const snapshot = await db.collection('dbLeaguesMaster').doc('all').get()
  if (!snapshot.exists) failOperationVerification(operations[0], 'LeaguesMaster document is missing')
  const master = snapshot.data() || {}
  const leagues = Array.isArray(master.leagues) ? master.leagues : []
  for (const operation of operations) {
    const leagueId = clean(operation.target?.leagueId)
    const seasonKey = clean(operation.target?.seasonKey)
    const league = leagues.find(row => clean(row?.leagueId) === leagueId)
    const season = (Array.isArray(league?.seasons) ? league.seasons : []).find(row => sameSeason(
      row?.seasonKey || row?.seasonId,
      seasonKey
    ))
    if (!league || !matchesApprovedValue(league, operation.patch?.league || {}) ||
        !season || !matchesApprovedValue(season, operation.patch?.seasonEntry || {}) ||
        !matchesApprovedValue(master.summary, operation.patch?.summary)) {
      failOperationVerification(operation, 'LeaguesMaster does not match approved roster sync payload')
    }
  }
  return { operationCount: operations.length }
}

async function inspectApprovedClubOperations(job) {
  const operations = approvedOperations(job, 'clubProjection')
  let supersededCount = 0
  for (const operation of operations) {
    if (!await counterpartGuardIsCurrent(operation)) {
      supersededCount += 1
      continue
    }
    const clubId = clean(operation.target?.clubId)
    const snapshot = await db.collection('dbClubs').doc(clubId).get()
    if (!snapshot.exists) failOperationVerification(operation, 'Approved Club target is missing')
    const club = snapshot.data() || {}
    const fields = operation.patch?.fields || operation.patch || {}
    const projection = fields.ageGroupSeasonProjection
    const ageGroupId = clean(operation.target?.ageGroupId || projection?.ageGroupId)
    const seasonKey = clean(operation.target?.seasonKey || projection?.season?.seasonKey)
    const teamId = clean(operation.target?.teamId || projection?.season?.teamId)
    const ageGroup = (Array.isArray(club.ageGroups) ? club.ageGroups : [])
      .find(row => clean(row?.ageGroupId) === ageGroupId)
    const season = (Array.isArray(ageGroup?.seasons) ? ageGroup.seasons : [])
      .find(row => sameSeason(row?.seasonKey || row?.seasonId, seasonKey) && clean(row?.teamId) === teamId)
    const expectedSeason = projection?.season || projection
    if (!season || !matchesApprovedValue(season, expectedSeason || {})) {
      failOperationVerification(operation, 'Club projection does not match approved roster sync payload')
    }
  }
  return { operationCount: operations.length, supersededCount }
}

async function inspectApprovedClubsMasterOperations(job) {
  const operations = approvedOperations(job, 'clubsMaster')
  if (!operations.length) return { operationCount: 0, supersededCount: 0 }
  const snapshot = await db.collection('dbClubsMaster').doc('all').get()
  if (!snapshot.exists) failOperationVerification(operations[0], 'ClubsMaster document is missing')
  const clubs = Array.isArray(snapshot.data()?.clubs) ? snapshot.data().clubs : []
  let supersededCount = 0
  for (const operation of operations) {
    if (!await counterpartGuardIsCurrent(operation)) {
      supersededCount += 1
      continue
    }
    const clubId = clean(operation.target?.clubId)
    const fields = operation.patch?.fields || operation.patch || {}
    const expectedEntry = fields.ageGroupEntry
    const club = clubs.find(row => clean(row?.clubId) === clubId)
    const entry = (Array.isArray(club?.ageGroups) ? club.ageGroups : [])
      .find(row => clean(row?.ageGroupId) === clean(expectedEntry?.ageGroupId))
    if (!club || !matchesApprovedValue(club, fields.clubIdentity || {}) ||
        !entry || !matchesApprovedValue(entry, expectedEntry || {})) {
      failOperationVerification(operation, 'ClubsMaster entry does not match approved roster sync payload')
    }
  }
  return { operationCount: operations.length, supersededCount }
}

async function inspectApprovedSyncPayload(job) {
  const league = await inspectApprovedLeagueOperations(job)
  const leaguesMaster = await inspectApprovedLeaguesMasterOperations(job)
  const club = await inspectApprovedClubOperations(job)
  const clubsMaster = await inspectApprovedClubsMasterOperations(job)
  return { league, leaguesMaster, club, clubsMaster }
}

async function runTeamRosterProjectionJob(jobId) {
  const job = await claimTeamRosterProjectionJob(jobId)
  if (!job) return { skipped: true, reason: 'jobNotClaimed' }
  const identity = { jobId, sourceRevision: job.sourceRevision, attemptToken: job.attemptToken }
  try {
    await updateWriteActionFromProjectionJob({ writeActionId: job.writeActionId, jobId, jobType: job.jobType, ...identity, status: 'processing' })
    const canonicalSource = await readCanonicalTeamSeason(job)
    if (canonicalSource.stale) {
      const transition = await supersede(identity)
      if (transition?.applied) await updateWriteActionFromProjectionJob({ writeActionId: job.writeActionId, jobId, jobType: job.jobType, ...identity, status: 'superseded' })
      return { skipped: true, reason: 'staleSource' }
    }
    await updateStage({ ...identity, stage: 'canonicalSource', result: canonicalSource })
    const syncApply = await applyApprovedRosterSyncPayload({ job })
    await updateStage({ ...identity, stage: 'syncApply', result: { operationCount: syncApply.operationCount } })
    const playerIndexes = await inspectPlayerIndexes(canonicalSource)
    await updateStage({ ...identity, stage: 'playerIndexes', result: playerIndexes })
    const teamAndLeagueIndexes = await inspectTeamAndLeagueIndexes(canonicalSource, playerIndexes)
    await updateStage({ ...identity, stage: 'teamAndLeagueIndexes', result: teamAndLeagueIndexes })
    const clubProjection = await inspectClubProjection(canonicalSource)
    await updateStage({ ...identity, stage: 'clubProjection', result: clubProjection })
    const transfers = await inspectCounterpartTransfers(job)
    await updateStage({ ...identity, stage: 'transfers', result: transfers })
    const approvedPayload = await inspectApprovedSyncPayload(job)
    await updateStage({ ...identity, stage: 'approvedPayload', result: approvedPayload })
    const completion = await complete(identity)
    if (!completion?.applied) return { skipped: true, reason: 'staleAttempt' }
    await updateWriteActionFromProjectionJob({ writeActionId: job.writeActionId, jobId, jobType: job.jobType, ...identity, status: 'completed' })
    return { completed: true, canonicalSource, playerIndexes, transfers, approvedPayload }
  } catch (error) {
    if (error?.code === 'ROSTER_SYNC_SOURCE_STALE') {
      const transition = await supersede(identity)
      if (transition?.applied) await updateWriteActionFromProjectionJob({ writeActionId: job.writeActionId, jobId, jobType: job.jobType, ...identity, status: 'superseded' })
      return { skipped: true, reason: 'staleSourceDuringSync' }
    }
    const transition = await fail({ ...identity, error })
    if (transition?.applied) await updateWriteActionFromProjectionJob({ writeActionId: job.writeActionId, jobId, jobType: job.jobType, ...identity, status: 'failed', error })
    throw error
  }
}

module.exports = { runTeamRosterProjectionJob }
