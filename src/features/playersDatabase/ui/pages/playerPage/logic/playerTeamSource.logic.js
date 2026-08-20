// src/features/playersDatabase/ui/pages/playerPage/logic/playerTeamSource.logic.js

const clean = value => String(value || '').trim()

const normalizeSeasonKey = value => clean(value).replace(/_/g, '/')

const normalizePlayerId = value => clean(value).replace(/^external__/, '')

const hasPerformanceValue = performance => {
  if (!performance || typeof performance !== 'object') return false

  const hasNumber = value => (
    value !== null &&
    value !== undefined &&
    clean(value) !== '' &&
    Number.isFinite(Number(value))
  )
  const level = clean(performance.priorityLevel)

  return (
    hasNumber(performance.scoutPriorityScore) ||
    hasNumber(performance.rank) ||
    Boolean(level && level !== 'unavailable')
  )
}

const pickPerformance = (...values) => (
  values.find(hasPerformanceValue) || null
)

function collectTeamSeasons(teamDoc = {}) {
  const source = teamDoc && typeof teamDoc === 'object' ? teamDoc : {}
  const current = Array.isArray(source.current) ? source.current : []
  const history = Array.isArray(source.history) ? source.history : []

  return [...current, ...history]
}

function matchesPlayer(playerRow = {}, player = {}, row = {}) {
  const sourceIds = [
    playerRow.playerDocumentId,
    playerRow.playerId,
    playerRow.externalPlayerId,
    playerRow.id,
  ].map(normalizePlayerId).filter(Boolean)
  const targetIds = [
    player.playerDocumentId,
    player.playerId,
    player.externalPlayerId,
    player.id,
    row.playerDocumentId,
    row.playerId,
    row.externalPlayerId,
  ].map(normalizePlayerId).filter(Boolean)

  if (sourceIds.some(sourceId => targetIds.includes(sourceId))) return true

  const sourceName = clean(playerRow.fullName || playerRow.displayName).toLowerCase()
  const targetName = clean(row.fullName || player.fullName).toLowerCase()

  return Boolean(sourceName && targetName && sourceName === targetName)
}

function resolveTeamSeason(teamSource = {}, row = {}) {
  const selectedSeason = teamSource.selectedTeamSeason || null
  const teamView = teamSource.team && typeof teamSource.team === 'object'
    ? teamSource.team
    : {}
  const seasonKey = normalizeSeasonKey(row.seasonKey)
  const leagueId = clean(row.leagueId)
  const selectedViewMatches = (
    normalizeSeasonKey(teamView.seasonKey) === seasonKey &&
    (!leagueId || !teamView.leagueId || clean(teamView.leagueId) === leagueId)
  )

  if (selectedSeason && selectedViewMatches) return selectedSeason

  if (
    selectedSeason &&
    normalizeSeasonKey(selectedSeason.seasonKey || selectedSeason.seasonId) === seasonKey &&
    (!leagueId || !selectedSeason.leagueId || clean(selectedSeason.leagueId) === leagueId)
  ) {
    return selectedSeason
  }

  return collectTeamSeasons(teamSource.teamDoc).find(season => {
    const sameSeason = normalizeSeasonKey(
      season.seasonKey || season.seasonId
    ) === seasonKey
    const sameLeague = !leagueId || !season.leagueId || clean(season.leagueId) === leagueId

    return sameSeason && sameLeague
  }) || null
}

function resolveTeamPlayer(teamSeason = {}, player = {}, row = {}) {
  const source = teamSeason && typeof teamSeason === 'object' ? teamSeason : {}
  const rows = Array.isArray(source.teamPlayers)
    ? source.teamPlayers
    : []

  return rows.find(playerRow => matchesPlayer(playerRow, player, row)) || null
}

export function buildPlayerSeasonNumbersRow({ row = {}, player = {}, teamSource = {} }) {
  const teamSeason = resolveTeamSeason(teamSource, row)
  const teamPlayer = resolveTeamPlayer(teamSeason, player, row)
  const teamPlayerStats = teamPlayer && teamPlayer.playerStats && typeof teamPlayer.playerStats === 'object'
    ? teamPlayer.playerStats
    : {}
  const rowPlayerStats = row.playerStats && typeof row.playerStats === 'object'
    ? row.playerStats
    : {}
  const teamView = teamSource.team && typeof teamSource.team === 'object'
    ? teamSource.team
    : {}
  const sameSelectedSeason = normalizeSeasonKey(teamView.seasonKey) === normalizeSeasonKey(row.seasonKey)
  const selectedTeamStats = sameSelectedSeason && teamView.teamStats
    ? teamView.teamStats
    : {}

  return {
    ...row,
    games: Number(teamPlayerStats.games || rowPlayerStats.games || row.games || 0),
    starts: Number(teamPlayerStats.starts || rowPlayerStats.starts || row.starts || 0),
    minutes: Number(teamPlayerStats.minutes || rowPlayerStats.minutes || row.minutes || 0),
    goals: Number(teamPlayerStats.goals || rowPlayerStats.goals || row.goals || 0),
    teamGames: Number(
      teamPlayerStats.teamGames ||
      rowPlayerStats.teamGames ||
      selectedTeamStats.gamesPlayed ||
      selectedTeamStats.teamGamePlayed ||
      row.teamGames ||
      0
    ),
    teamRank: Number(
      teamPlayerStats.teamRank ||
      rowPlayerStats.teamRank ||
      (sameSelectedSeason ? teamView.tableRank : 0) ||
      row.teamRank ||
      0
    ),
    teamGoalsFor: Number(
      teamPlayerStats.teamGoalsFor ||
      rowPlayerStats.teamGoalsFor ||
      selectedTeamStats.goalsFor ||
      row.teamGoalsFor ||
      0
    ),
    teamGoalsAgainst: Number(
      teamPlayerStats.teamGoalsAgainst ||
      rowPlayerStats.teamGoalsAgainst ||
      selectedTeamStats.goalsAgainst ||
      row.teamGoalsAgainst ||
      0
    ),
    teamAttackPerformance: pickPerformance(
      teamPlayerStats.teamAttackPerformance,
      rowPlayerStats.teamAttackPerformance,
      row.teamAttackPerformance,
      sameSelectedSeason ? teamView.offense : null
    ),
    teamDefensePerformance: pickPerformance(
      teamPlayerStats.teamDefensePerformance,
      rowPlayerStats.teamDefensePerformance,
      row.teamDefensePerformance,
      sameSelectedSeason ? teamView.defense : null
    ),
    teamAttackRank: Number(
      teamPlayerStats.teamAttackPerformance?.rank ||
      rowPlayerStats.teamAttackPerformance?.rank ||
      row.teamAttackPerformance?.rank ||
      (sameSelectedSeason ? teamView.offense?.rank : 0) ||
      row.teamAttackRank ||
      0
    ),
    teamDefenseRank: Number(
      teamPlayerStats.teamDefensePerformance?.rank ||
      rowPlayerStats.teamDefensePerformance?.rank ||
      row.teamDefensePerformance?.rank ||
      (sameSelectedSeason ? teamView.defense?.rank : 0) ||
      row.teamDefenseRank ||
      0
    ),
    teamAvatarUrl: clean(
      teamView.avatarUrl ||
      teamView.logoUrl ||
      teamSource.teamDoc?.avatarUrl ||
      teamSource.teamDoc?.logoUrl
    ),
  }
}
