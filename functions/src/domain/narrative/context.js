// C:\projects\devplan\functions\src\domain\narrative\context.js

const { resolveProfileLabel } = require('./profileLabels')
const { resolveAgeGroupLabel } = require('./ageGroupLabels')

function clean(value) {
  return String(value || '').trim()
}

function isPresent(value) {
  return value !== null && value !== undefined && value !== ''
}

function firstPresent(...values) {
  return values.find(isPresent)
}

function numberOrNull(value) {
  if (!isPresent(value)) return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function valueOrNull(value) {
  return isPresent(value) ? value : null
}

function resolvePlayingUp({ playerBirthYear, groupBirthYear, isYoungerAgeGroup }) {
  if (typeof isYoungerAgeGroup === 'boolean') return isYoungerAgeGroup

  const playerYear = numberOrNull(playerBirthYear)
  const groupYear = numberOrNull(groupBirthYear)
  if (playerYear === null || groupYear === null) return null

  return playerYear > groupYear
}

function resolveSeasonStartYear(value) {
  const match = clean(value).match(/^(\d{2,4})\/(\d{2,4})$/)
  if (!match) return 0

  const year = Number(match[1])
  if (!Number.isFinite(year)) return 0

  return year < 100 ? 2000 + year : year
}

function resolveActivePlayerEntry(player = {}) {
  const current = Array.isArray(player.current) ? player.current : []
  const history = Array.isArray(player.history) ? player.history : []
  const entries = [...current, ...history]

  return [...entries]
    .filter(entry => (
      clean(entry.seasonKey || entry.seasonId) &&
      clean(entry.seasonStatus).toLowerCase() !== 'completed'
    ))
    .sort((left, right) => (
      resolveSeasonStartYear(right.seasonKey || right.seasonId) -
      resolveSeasonStartYear(left.seasonKey || left.seasonId)
    ))[0] || null
}

function resolveLatestPlayerEntry(player = {}) {
  const current = Array.isArray(player.current) ? player.current : []
  const history = Array.isArray(player.history) ? player.history : []

  return [...current, ...history]
    .filter(entry => clean(entry.seasonKey || entry.seasonId))
    .sort((left, right) => (
      resolveSeasonStartYear(right.seasonKey || right.seasonId) -
      resolveSeasonStartYear(left.seasonKey || left.seasonId)
    ))[0] || null
}

function normalizeCombination(combination = {}) {
  return {
    id: clean(combination.id),
    label: clean(combination.label),
    interestLevel: clean(combination.interestLevel || combination.interest),
    profileIds: Array.isArray(combination.profileIds)
      ? combination.profileIds.map(clean).filter(Boolean)
      : [],
    matchedProfileIds: Array.isArray(combination.matchedProfileIds)
      ? combination.matchedProfileIds.map(clean).filter(Boolean)
      : [],
  }
}

function findTeamSeason(team = {}, entry = {}) {
  const seasonKey = clean(entry.seasonKey)
  const seasonId = clean(entry.seasonId)
  const rows = [
    ...(Array.isArray(team.current) ? team.current : []),
    ...(Array.isArray(team.history) ? team.history : []),
  ]

  return rows.find(row => (
    (seasonKey && clean(row.seasonKey) === seasonKey) ||
    (seasonId && clean(row.seasonId) === seasonId)
  )) || null
}

function findTeamPlayer(teamSeason = {}, player = {}) {
  const playerDocumentId = clean(player.id || player.playerDocumentId)
  const playerId = clean(player.playerId)
  const externalPlayerId = clean(player.externalPlayerId)
  const rows = Array.isArray(teamSeason.teamPlayers) ? teamSeason.teamPlayers : []

  return rows.find(row => (
    (playerDocumentId && clean(row.playerDocumentId) === playerDocumentId) ||
    (playerId && clean(row.playerId) === playerId) ||
    (externalPlayerId && clean(row.externalPlayerId) === externalPlayerId)
  )) || null
}

function enrichStats({ entry = {}, teamSeason = null, teamPlayer = null }) {
  const stats = entry.playerStats || {}
  const safeTeamPlayer = teamPlayer || {}
  const safeTeamSeason = teamSeason || {}
  const teamPlayerStats = safeTeamPlayer.playerStats || {}
  const teamStats = safeTeamSeason.teamStats || {}

  return {
    games: numberOrNull(stats.games),
    goals: numberOrNull(stats.goals),
    minutes: numberOrNull(stats.minutes),
    starts: numberOrNull(stats.starts),
    substituteIn: numberOrNull(stats.substituteIn),
    substitutedOut: numberOrNull(stats.substitutedOut),
    teamMinutes: numberOrNull(stats.teamMinutes),
    teamGames: numberOrNull(firstPresent(
      stats.teamGames,
      teamPlayerStats.teamGames,
      teamStats.teamGamePlayed
    )),
    teamRank: numberOrNull(firstPresent(
      stats.teamRank,
      teamPlayerStats.teamRank,
      safeTeamSeason.tableRank
    )),
    teamGoalsFor: numberOrNull(firstPresent(
      stats.teamGoalsFor,
      teamPlayerStats.teamGoalsFor,
      teamStats.goalsFor
    )),
    teamGoalsAgainst: numberOrNull(firstPresent(
      stats.teamGoalsAgainst,
      teamPlayerStats.teamGoalsAgainst,
      teamStats.goalsAgainst
    )),
    teamAttackPerformance: valueOrNull(firstPresent(
      stats.teamAttackPerformance,
      teamPlayerStats.teamAttackPerformance,
      safeTeamSeason.offense,
      safeTeamSeason.performance?.offense,
      safeTeamSeason.teamScout?.offense
    )),
    teamDefensePerformance: valueOrNull(firstPresent(
      stats.teamDefensePerformance,
      teamPlayerStats.teamDefensePerformance,
      safeTeamSeason.defense,
      safeTeamSeason.performance?.defense,
      safeTeamSeason.teamScout?.defense
    )),
  }
}

function normalizeProfile(profile = {}) {
  return {
    profileId: clean(profile.profileId || profile.id),
    profileLabel: resolveProfileLabel(profile),
    profileShortLabel: clean(profile.profileShortLabel || profile.shortLabel),
    profileIdentity: clean(profile.profileIdentity || profile.identity),
    interestLevel: clean(profile.interestLevel || profile.interest),
    score: numberOrNull(profile.score),
    profileDepth: valueOrNull(profile.profileDepth),
    profileStrength: valueOrNull(profile.profileStrength),
    positionContext: clean(profile.positionContext),
    scoutContext: valueOrNull(profile.scoutContext),
    requiredReview: Array.isArray(profile.requiredReview)
      ? profile.requiredReview
      : Array.isArray(profile.reviews) ? profile.reviews : [],
    warnings: Array.isArray(profile.warnings) ? profile.warnings : [],
    matchEvidence: Array.isArray(profile.matchEvidence) ? profile.matchEvidence : [],
  }
}

function buildEntry({
  entry = {},
  player = {},
  teamsById = new Map(),
  sourceTarget = '',
  isActiveSeason = false,
  isLatestSeason = false,
}) {
  const teamDocumentId = clean(entry.birthTeamDocumentId)
  const team = teamsById.get(teamDocumentId) || null
  const teamSeason = team ? findTeamSeason(team, entry) : null
  const teamPlayer = teamSeason ? findTeamPlayer(teamSeason, player) : null
  const profiles = Array.isArray(entry.scoutProfiles) ? entry.scoutProfiles : []
  const groupBirthYear = numberOrNull(entry.birthYear)

  return {
    sourceTarget: clean(sourceTarget),
    isActiveSeason: Boolean(isActiveSeason),
    isLatestSeason: Boolean(isLatestSeason),
    temporalRole: isActiveSeason
      ? 'active'
      : isLatestSeason ? 'latest' : 'history',
    seasonId: clean(entry.seasonId),
    seasonKey: clean(entry.seasonKey),
    seasonStatus: clean(entry.seasonStatus),
    clubId: clean(entry.clubId || team?.clubId),
    clubName: clean(entry.clubName),
    teamName: clean(entry.teamName || team?.displayName),
    birthTeamId: clean(entry.birthTeamId || team?.birthTeamId),
    birthTeamDocumentId: teamDocumentId,
    birthTeamSlot: numberOrNull(firstPresent(entry.birthTeamSlot, team?.birthTeamSlot)),
    leagueId: clean(entry.leagueId),
    leagueName: clean(entry.leagueName),
    leagueLevel: numberOrNull(entry.leagueLevel),
    clubLevel: numberOrNull(entry.clubLevel),
    clubStrengthLevel: numberOrNull(entry.clubStrengthLevel),
    ageGroupId: clean(entry.ageGroupId),
    ageGroupLabel: resolveAgeGroupLabel({
      ageGroupId: entry.ageGroupId,
      ageGroupLabel: entry.ageGroupLabel,
    }),
    groupBirthYear,
    isPlayingUp: resolvePlayingUp({
      playerBirthYear: player.birthYear,
      groupBirthYear,
      isYoungerAgeGroup: entry.isYoungerAgeGroup,
    }),
    primaryPosition: clean(entry.primaryPosition),
    positionLayer: clean(entry.positionLayer),
    stats: enrichStats({ entry, teamSeason, teamPlayer }),
    profiles: profiles.map(normalizeProfile),
    combinations: Array.isArray(entry.scoutCombinations)
      ? entry.scoutCombinations.map(normalizeCombination)
      : [],
    profileHierarchy: valueOrNull(entry.scoutProfileHierarchy),
    profileCaseStrength: valueOrNull(entry.scoutProfileCaseStrength),
    playerInterest: valueOrNull(entry.scoutPlayerInterest),
    scoutEvidence: Array.isArray(entry.scoutEvidence) ? entry.scoutEvidence : [],
    opportunity: valueOrNull(entry.scoutOpportunity),
    verification: valueOrNull(entry.scoutVerification),
    progression: valueOrNull(entry.scoutProfileProgression),
    trajectory: valueOrNull(entry.scoutTrajectory),
    transferContext: valueOrNull(entry.scoutTransferContext),
    futureCompetitionPath: isActiveSeason
      ? valueOrNull(entry.futureCompetitionPath)
      : null,
    engineVersion: clean(entry.scoutEngineVersion),
    statsLoadMeasurementHistory: Array.isArray(entry.scoutStatsLoadMeasurementHistory)
      ? entry.scoutStatsLoadMeasurementHistory
      : [],
  }
}

function buildContext({ player = {}, teams = [] } = {}) {
  const teamsById = new Map(teams.map(team => [clean(team.id), team]))
  const history = Array.isArray(player.history) ? player.history : []
  const current = Array.isArray(player.current) ? player.current : []
  const activeEntry = resolveActivePlayerEntry(player)
  const latestEntry = resolveLatestPlayerEntry(player)

  return {
    player: {
      playerId: clean(player.playerId || player.id),
      playerDocumentId: clean(player.id || player.playerDocumentId),
      externalPlayerId: clean(player.externalPlayerId),
      fullName: clean(player.fullName || player.displayName),
      birthYear: numberOrNull(player.birthYear),
      birthDate: player.birthDate || null,
      primaryPosition: clean(player.primaryPosition),
      positionLayer: clean(player.positionLayer),
    },
    entries: [
      ...history.map(entry => buildEntry({
        entry,
        player,
        teamsById,
        sourceTarget: 'history',
        isActiveSeason: entry === activeEntry,
        isLatestSeason: entry === latestEntry,
      })),
      ...current.map(entry => buildEntry({
        entry,
        player,
        teamsById,
        sourceTarget: 'current',
        isActiveSeason: entry === activeEntry,
        isLatestSeason: entry === latestEntry,
      })),
    ],
    events: Array.isArray(player.events) ? player.events : [],
    verification: player.verification || null,
    playerReview: player.playerReview || null,
    manualImmediacyDecision: player.manualImmediacyDecision || null,
  }
}

module.exports = { buildContext }
