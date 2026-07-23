import {
  PLAYERS_DATABASE_RESOLUTION_MODE,
  resolvePlayersDatabaseEntityPolicy,
} from '../../model/playersDatabaseEntityPolicy.js'

const emptyBucket = () => ({
  total: 0,
  rows: [],
})

const createEmptyPlan = () => ({
  summary: {
    totalRows: 0,
    validRows: 0,
    invalidRows: 0,
    managedPlayers: 0,
    ignoredPlayerNames: 0,
    nameOnlyClubs: 0,
    candidateClubs: 0,
    nameOnlyTeams: 0,
    managedTeams: 0,
    nameOnlyLeagues: 0,
    candidateLeagues: 0,
    managedLeagues: 0,
    managedSnapshots: 0,
    candidateSnapshots: 0,
    ignoredSnapshots: 0,
    uniqueManagedPlayers: 0,
    duplicateManagedPlayers: 0,
    uniqueNameOnlyClubs: 0,
    uniqueNameOnlyTeams: 0,
    uniqueLeagueRefs: 0,
  },
  buckets: {
    managedPlayers: emptyBucket(),
    ignoredPlayerNames: emptyBucket(),
    nameOnlyClubs: emptyBucket(),
    candidateClubs: emptyBucket(),
    nameOnlyTeams: emptyBucket(),
    managedTeams: emptyBucket(),
    nameOnlyLeagues: emptyBucket(),
    candidateLeagues: emptyBucket(),
    managedLeagues: emptyBucket(),
    managedSnapshots: emptyBucket(),
    candidateSnapshots: emptyBucket(),
    ignoredSnapshots: emptyBucket(),
    invalidRows: emptyBucket(),
  },
  indexes: {
    managedPlayersByExternalId: {},
    duplicateManagedPlayersByExternalId: {},
    nameOnlyClubsByName: {},
    nameOnlyTeamsByName: {},
    leagueRefsByKey: {},
  },
  rows: [],
})

const clean = (value) => String(value ?? '').trim()

const pick = (row = {}, keys = []) => {
  for (const key of keys) {
    const value = clean(row?.[key])
    if (value) return value
  }

  return ''
}

const buildRowIdentity = (row = {}, fallbackIndex = 0) => ({
  rowId: clean(row.rowId) || `row-${fallbackIndex + 1}`,
  playerName: pick(row, ['fullName', 'playerName']),
  externalPlayerId: pick(row, ['externalPlayerId', 'playerExternalId']),
  clubName: pick(row, ['clubName', 'currentClubName']),
  teamName: pick(row, ['teamName', 'currentTeamName']),
  leagueName: pick(row, ['leagueName', 'currentLeagueName']),
  seasonId: pick(row, ['seasonId']),
})

const normalizeKey = (value) =>
  clean(value)
    .toLowerCase()
    .replace(/\s+/g, ' ')

const buildLeagueKey = (identity) =>
  [
    normalizeKey(identity.leagueName),
    normalizeKey(identity.seasonId),
  ].filter(Boolean).join('|')

const isRowBasicallyValid = (identity) => {
  if (identity.externalPlayerId) return true
  if (identity.playerName && (identity.clubName || identity.teamName || identity.leagueName)) return true
  return false
}

const pushBucket = (plan, bucketName, rowPlan) => {
  const bucket = plan.buckets[bucketName]
  if (!bucket) return

  bucket.total += 1
  bucket.rows.push(rowPlan)

  if (Object.prototype.hasOwnProperty.call(plan.summary, bucketName)) {
    plan.summary[bucketName] += 1
  }
}

const pushIndex = (index, key, rowPlan) => {
  const safeKey = normalizeKey(key)
  if (!safeKey) return

  if (!index[safeKey]) {
    index[safeKey] = {
      key: safeKey,
      label: key,
      total: 0,
      rows: [],
    }
  }

  index[safeKey].total += 1
  index[safeKey].rows.push(rowPlan)
}

const buildDedupeIndexes = (plan, rowPlan) => {
  const { identity, policy } = rowPlan

  if (policy.player.mode === PLAYERS_DATABASE_RESOLUTION_MODE.MANAGED) {
    pushIndex(plan.indexes.managedPlayersByExternalId, identity.externalPlayerId, rowPlan)
  }

  if (policy.club.mode === PLAYERS_DATABASE_RESOLUTION_MODE.NAME_ONLY) {
    pushIndex(plan.indexes.nameOnlyClubsByName, identity.clubName, rowPlan)
  }

  if (policy.team.mode === PLAYERS_DATABASE_RESOLUTION_MODE.NAME_ONLY) {
    pushIndex(plan.indexes.nameOnlyTeamsByName, identity.teamName, rowPlan)
  }

  if (identity.leagueName) {
    pushIndex(plan.indexes.leagueRefsByKey, buildLeagueKey(identity), rowPlan)
  }
}

const finalizeDedupeSummary = (plan) => {
  const managedPlayerEntries = Object.values(plan.indexes.managedPlayersByExternalId)
  const duplicateManagedPlayers = managedPlayerEntries.filter((entry) => entry.total > 1)

  duplicateManagedPlayers.forEach((entry) => {
    plan.indexes.duplicateManagedPlayersByExternalId[entry.key] = entry
  })

  plan.summary.uniqueManagedPlayers = managedPlayerEntries.length
  plan.summary.duplicateManagedPlayers = duplicateManagedPlayers.reduce(
    (sum, entry) => sum + entry.total - 1,
    0
  )
  plan.summary.uniqueNameOnlyClubs = Object.keys(plan.indexes.nameOnlyClubsByName).length
  plan.summary.uniqueNameOnlyTeams = Object.keys(plan.indexes.nameOnlyTeamsByName).length
  plan.summary.uniqueLeagueRefs = Object.keys(plan.indexes.leagueRefsByKey).length
}

const classifyPolicy = (plan, rowPlan) => {
  const { policy } = rowPlan

  if (policy.player.mode === PLAYERS_DATABASE_RESOLUTION_MODE.MANAGED) {
    pushBucket(plan, 'managedPlayers', rowPlan)
  }

  if (policy.player.mode === PLAYERS_DATABASE_RESOLUTION_MODE.IGNORED && rowPlan.identity.playerName) {
    pushBucket(plan, 'ignoredPlayerNames', rowPlan)
  }

  if (policy.club.mode === PLAYERS_DATABASE_RESOLUTION_MODE.NAME_ONLY) {
    pushBucket(plan, 'nameOnlyClubs', rowPlan)
  }

  if (policy.club.mode === PLAYERS_DATABASE_RESOLUTION_MODE.CANDIDATE) {
    pushBucket(plan, 'candidateClubs', rowPlan)
  }

  if (policy.team.mode === PLAYERS_DATABASE_RESOLUTION_MODE.NAME_ONLY) {
    pushBucket(plan, 'nameOnlyTeams', rowPlan)
  }

  if (policy.team.mode === PLAYERS_DATABASE_RESOLUTION_MODE.MANAGED) {
    pushBucket(plan, 'managedTeams', rowPlan)
  }

  if (policy.league.mode === PLAYERS_DATABASE_RESOLUTION_MODE.NAME_ONLY) {
    pushBucket(plan, 'nameOnlyLeagues', rowPlan)
  }

  if (policy.league.mode === PLAYERS_DATABASE_RESOLUTION_MODE.CANDIDATE) {
    pushBucket(plan, 'candidateLeagues', rowPlan)
  }

  if (policy.league.mode === PLAYERS_DATABASE_RESOLUTION_MODE.MANAGED) {
    pushBucket(plan, 'managedLeagues', rowPlan)
  }

  if (policy.snapshot.mode === PLAYERS_DATABASE_RESOLUTION_MODE.MANAGED) {
    pushBucket(plan, 'managedSnapshots', rowPlan)
  }

  if (policy.snapshot.mode === PLAYERS_DATABASE_RESOLUTION_MODE.CANDIDATE) {
    pushBucket(plan, 'candidateSnapshots', rowPlan)
  }

  if (policy.snapshot.mode === PLAYERS_DATABASE_RESOLUTION_MODE.IGNORED) {
    pushBucket(plan, 'ignoredSnapshots', rowPlan)
  }
}

export function buildPlayersDatabaseImportPlan(rows = []) {
  const plan = createEmptyPlan()
  const safeRows = Array.isArray(rows) ? rows : []

  plan.summary.totalRows = safeRows.length

  safeRows.forEach((row, index) => {
    const identity = buildRowIdentity(row, index)
    const policy = resolvePlayersDatabaseEntityPolicy(row)
    const isValid = isRowBasicallyValid(identity)

    const rowPlan = {
      rowIndex: index,
      identity,
      sourceRow: row,
      policy,
      valid: isValid,
      status: isValid ? 'valid' : 'invalid',
      issues: isValid ? [] : ['missing_player_or_context_identity'],
    }

    plan.rows.push(rowPlan)

    if (!isValid) {
      plan.summary.invalidRows += 1
      pushBucket(plan, 'invalidRows', rowPlan)
      return
    }

    plan.summary.validRows += 1
    buildDedupeIndexes(plan, rowPlan)
    classifyPolicy(plan, rowPlan)
  })

  finalizeDedupeSummary(plan)

  return plan
}
