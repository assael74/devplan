const { db } = require('../../../config/admin')
const { claimTeamRosterProjectionJob, updateStage, complete, supersede, fail } = require('./teamRosterProjectionJob.repository')
const { updateWriteActionFromProjectionJob } = require('../writeActions/writeAction.repository')
const { evaluatePlayerSeasonIndexes } = require('./teamRosterProjectionJob.indexes')

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
      .doc(buildTeamSeasonDocumentId(request.counterpartBirthTeamDocumentId, request.seasonKey)).get()
    // A counterpart Team Season is optional. If it does not exist, the roster
    // flow deliberately does not create it merely to record a movement.
    if (!target.exists) return { ...request, status: 'counterpartMissing' }
    const facts = Array.isArray(target.data()?.[clean(request.side)]) ? target.data()[clean(request.side)] : []
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
  }
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
    const playerIndexes = await inspectPlayerIndexes(canonicalSource)
    await updateStage({ ...identity, stage: 'playerIndexes', result: playerIndexes })
    const teamAndLeagueIndexes = await inspectTeamAndLeagueIndexes(canonicalSource, playerIndexes)
    await updateStage({ ...identity, stage: 'teamAndLeagueIndexes', result: teamAndLeagueIndexes })
    const clubProjection = await inspectClubProjection(canonicalSource)
    await updateStage({ ...identity, stage: 'clubProjection', result: clubProjection })
    const transfers = await inspectCounterpartTransfers(job)
    await updateStage({ ...identity, stage: 'transfers', result: transfers })
    const completion = await complete(identity)
    if (!completion?.applied) return { skipped: true, reason: 'staleAttempt' }
    await updateWriteActionFromProjectionJob({ writeActionId: job.writeActionId, jobId, jobType: job.jobType, ...identity, status: 'completed' })
    return { completed: true, canonicalSource, playerIndexes, transfers }
  } catch (error) {
    const transition = await fail({ ...identity, error })
    if (transition?.applied) await updateWriteActionFromProjectionJob({ writeActionId: job.writeActionId, jobId, jobType: job.jobType, ...identity, status: 'failed', error })
    throw error
  }
}

module.exports = { runTeamRosterProjectionJob }
