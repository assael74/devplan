// features/playersDatabase/model/teamPage.model.js

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../catalog/clubs.catalog.js'
import { buildTeamDisplayName } from '../catalog/teamDisplay.js'
import {
  adaptBirthTeamDocumentSeason,
  adaptLeagueTableTeam,
  adaptPlayerDocumentSeason,
  adaptTeamScoutEngineRow,
} from '../domain/index.js'
import { normalizeSeasonLookupKey, normalizeSeasonIdentity, isSameSeason } from './season.model.js'
import { normalizeTeamIdentity, resolveTeamLookupKey } from './teamIdentity.model.js'
import { cleanValue } from './value.model.js'
import {
  buildTeamScoutLeagueModel,
  TEAM_SCOUT_NORMALIZATION_MODE,
  TEAM_SCOUT_SORT_MODE,
} from '../../../shared/teams/scout/index.js'

const buildSeasonOption = ({ season, target }) => {
  const identity = normalizeSeasonIdentity({ season })

  return {
    target,
    season,
    seasonId: identity.seasonId,
    seasonKey: normalizeSeasonLookupKey(identity.seasonKey || identity.seasonId),
  }
}

export const buildTeamPageSeasonOptions = (league, teamDoc = {}) => {
  const options = []
  const seen = new Set()

  const pushOption = option => {
    const key = `${option.target}-${option.seasonKey || option.seasonId}`
    if (!option.seasonKey && !option.seasonId) return
    if (seen.has(key)) return

    seen.add(key)
    options.push(option)
  }

  if (league?.current?.seasonId || league?.current?.seasonKey) {
    pushOption(buildSeasonOption({ season: league.current, target: 'current' }))
  }

  const history = Array.isArray(league?.history) ? league.history : []
  history.forEach(season => {
    if (!season?.seasonId && !season?.seasonKey) return
    pushOption(buildSeasonOption({ season, target: 'history' }))
  })

  const teamCurrent = Array.isArray(teamDoc?.current) ? teamDoc.current : []
  teamCurrent.forEach(season => {
    if (!season?.seasonId && !season?.seasonKey) return
    pushOption(buildSeasonOption({ season, target: 'current' }))
  })

  const teamHistory = Array.isArray(teamDoc?.history) ? teamDoc.history : []
  teamHistory.forEach(season => {
    if (!season?.seasonId && !season?.seasonKey) return
    pushOption(buildSeasonOption({ season, target: 'history' }))
  })

  return options.filter(option => option.seasonKey || option.seasonId)
}

const findTeamRow = ({ season, teamId }) => {
  const rows = Array.isArray(season?.tableRank) ? season.tableRank : []
  const key = cleanValue(teamId)

  return rows.find(row => {
    const identity = normalizeTeamIdentity({ team: row })
    return [
      identity.teamId,
      identity.birthTeamId,
      identity.teamDocumentId,
      identity.birthTeamDocumentId,
      identity.teamSlotId,
    ].includes(key)
  }) || null
}

const buildScoutResultMap = ({ tableRank = [], leagueDoc = {}, season = {} } = {}) => {
  const result = buildTeamScoutLeagueModel({
    leagueLevel: leagueDoc?.level,
    leagueNumGames: season?.leagueTotalRound || 30,
    rows: tableRank,
    normalizationMode: TEAM_SCOUT_NORMALIZATION_MODE.AUTO,
    sortMode: TEAM_SCOUT_SORT_MODE.TABLE,
  })

  return new Map((result.rows || []).map(row => [
    resolveTeamLookupKey(row) || cleanValue(row.clubId || row.rank),
    adaptTeamScoutEngineRow({
      row,
      source: {
        normalization: result.normalization,
        leagueLevel: leagueDoc?.level,
        leagueGames: season?.leagueTotalRound || 30,
      },
    }),
  ]))
}

export const findTeamPageSeasonDoc = ({ teamDoc, selectedSeasonOption }) => {
  if (!teamDoc || !selectedSeasonOption) return null

  const fieldKey = selectedSeasonOption.target === 'history' ? 'history' : 'current'
  const rows = Array.isArray(teamDoc[fieldKey]) ? teamDoc[fieldKey] : []
  return rows.find(row => isSameSeason(row, selectedSeasonOption)) || null
}

const getClubIdFromTeamId = teamId => cleanValue(teamId).split('_').filter(Boolean)[0] || ''

const getClubById = clubId => PLAYERS_DATABASE_CLUBS_CATALOG.find(
  club => cleanValue(club.id) === cleanValue(clubId)
) || null

const resolveTeamName = ({ teamRow = {}, teamDoc = {}, teamId = '' } = {}) => {
  const identity = normalizeTeamIdentity({
    team: teamRow,
    fallback: {
      ...teamDoc,
      teamId,
      clubId: teamDoc?.clubId || getClubIdFromTeamId(teamId),
    },
  })
  const club = getClubById(identity.clubId)

  return buildTeamDisplayName({
    clubName: club?.name || teamRow.clubName || teamDoc?.displayName || teamRow.displayName || teamRow.teamName,
    clubId: identity.clubId,
    teamId: identity.birthTeamId || identity.teamId || teamId,
    teamSlot: identity.birthTeamSlot || identity.teamSlot,
  }) || cleanValue(teamId || '-')
}

export const normalizeTeamPagePlayerRow = (playerSeason = {}, index = 0) => {
  const actual = playerSeason.stats?.actual || {}
  const scout = playerSeason.scout || {}
  const display = scout.display || {}

  return {
    ...playerSeason,
    id: playerSeason.identity?.playerId || playerSeason.identity?.playerDocumentId || `${index}`,
    playerId: playerSeason.identity?.playerId || '',
    playerDocumentId: playerSeason.identity?.playerDocumentId || '',
    externalPlayerId: playerSeason.identity?.externalPlayerId || '',
    playerUrl: playerSeason.metadata?.playerUrl || '',
    number: playerSeason.position?.shirtNumber || `${index + 1}`,
    numShirt: playerSeason.position?.shirtNumber || '',
    fullName: playerSeason.identity?.displayName || '',
    normalizedName: playerSeason.identity?.normalizedName || '',
    positionLayer: playerSeason.position?.layer || '',
    primaryPosition: playerSeason.position?.primary || '',
    playerStats: {
      ...actual,
      teamMinutes: playerSeason.stats?.context?.teamMinutes,
      teamGames: playerSeason.stats?.context?.teamGames,
      teamRank: playerSeason.stats?.context?.teamRank,
      teamGoalsFor: playerSeason.stats?.context?.teamGoalsFor,
      teamGoalsAgainst: playerSeason.stats?.context?.teamGoalsAgainst,
    },
    games: actual.games || 0,
    goals: actual.goals || 0,
    starts: actual.starts || 0,
    yellowCards: actual.yellowCards || 0,
    minutes: actual.minutes || 0,
    profile: display.label || '-',
    reliability: display.reliability?.level || '-',
    scoutProfiles: scout.profiles || [],
    scoutProfileDisplay: display,
  }
}

export const adaptTeamPagePlayerRow = ({
  player = {},
  index = 0,
  selectedSeasonOption = null,
  teamSeason = null,
} = {}) => {
  const playerSeason = adaptPlayerDocumentSeason({
    playerDocument: player,
    seasonDocument: player,
    target: selectedSeasonOption?.target || 'current',
    team: {
      birthTeamId: teamSeason?.identity?.teamId,
      birthTeamDocumentId: teamSeason?.identity?.teamDocumentId,
      clubId: teamSeason?.identity?.clubId,
      leagueId: teamSeason?.league?.leagueId,
      leagueLevel: teamSeason?.league?.leagueLevel,
      ageGroupId: teamSeason?.league?.ageGroupId,
      ageGroupLabel: teamSeason?.league?.ageGroupLabel,
      birthTeamSlot: player.birthTeamSlot,
      displayName: teamSeason?.identity?.displayName,
      teamUrl: teamSeason?.metadata?.teamUrl,
    },
    teamScout: teamSeason?.performance || null,
  })

  return normalizeTeamPagePlayerRow(playerSeason, index)
}

export const buildTeamPageView = ({
  teamId,
  leagueDoc,
  teamDoc,
  selectedSeasonOption,
  selectedTeamSeason,
}) => {
  const season = selectedSeasonOption?.season || {}
  const target = selectedSeasonOption?.target || 'current'
  const teamRow = findTeamRow({ season, teamId }) || {}
  const tableRank = Array.isArray(season?.tableRank) ? season.tableRank : []
  const teamIdentity = normalizeTeamIdentity({
    team: teamRow,
    fallback: {
      ...teamDoc,
      teamId,
      teamDocumentId: teamDoc?.id,
      birthTeamId: teamDoc?.birthTeamId || teamId,
    },
  })

  const performance = buildScoutResultMap({ tableRank, leagueDoc, season }).get(
    resolveTeamLookupKey(teamRow) || resolveTeamLookupKey(teamIdentity)
  ) || null

  const leagueTeamSeason = adaptLeagueTableTeam({
    leagueDocument: leagueDoc || {},
    seasonDocument: season,
    tableRow: teamRow,
    target,
  })
  const birthTeamSeason = adaptBirthTeamDocumentSeason({
    teamDocument: teamDoc || {},
    seasonDocument: selectedTeamSeason || {},
    target,
    league: leagueDoc || {},
  })

  const actual = leagueTeamSeason.completeness?.hasStats
    ? leagueTeamSeason.stats.actual
    : birthTeamSeason.stats.actual
  const canonicalTeamSeason = {
    ...birthTeamSeason,
    identity: {
      ...birthTeamSeason.identity,
      ...leagueTeamSeason.identity,
      displayName: resolveTeamName({ teamRow, teamDoc, teamId }),
    },
    season: { ...birthTeamSeason.season, ...leagueTeamSeason.season },
    league: { ...birthTeamSeason.league, ...leagueTeamSeason.league },
    stats: { actual, projected: birthTeamSeason.stats.projected },
    ranking: leagueTeamSeason.ranking,
    performance: performance || birthTeamSeason.performance,
    scoutProfilesSummary: leagueTeamSeason.scoutProfilesSummary,
    completeness: {
      ...birthTeamSeason.completeness,
      ...leagueTeamSeason.completeness,
      hasPerformance: Boolean(performance),
    },
  }

  const games = actual.gamesPlayed || 0
  const points = actual.points || 0
  const goalsFor = actual.goalsFor || 0
  const goalsAgainst = actual.goalsAgainst || 0
  const successPercent = games ? Math.round((points / (games * 3)) * 100) : null
  const teamPlayers = Array.isArray(selectedTeamSeason?.teamPlayers)
    ? selectedTeamSeason.teamPlayers
    : []
  const playersCount = teamPlayers.length

  return {
    ...canonicalTeamSeason,
    domain: canonicalTeamSeason,
    id: cleanValue(teamId),
    birthTeamId: canonicalTeamSeason.identity.teamId || cleanValue(teamId),
    teamDocumentId: canonicalTeamSeason.identity.teamDocumentId || cleanValue(teamId),
    clubId: canonicalTeamSeason.identity.clubId || getClubIdFromTeamId(teamId),
    name: canonicalTeamSeason.identity.displayName,
    leagueId: canonicalTeamSeason.league.leagueId,
    leagueName: cleanValue(leagueDoc?.leagueName || leagueDoc?.name || leagueDoc?.id || '-'),
    ageGroupId: canonicalTeamSeason.league.ageGroupId,
    ageGroupLabel: canonicalTeamSeason.league.ageGroupLabel,
    birthYear: canonicalTeamSeason.season.birthYear || '-',
    seasonKey: canonicalTeamSeason.season.seasonKey || '-',
    tableRank: canonicalTeamSeason.ranking.tableRank || '-',
    games,
    points,
    successPercent,
    goalsFor,
    goalsAgainst,
    teamUrl: canonicalTeamSeason.metadata.teamUrl,
    teamStats: {
      teamGamePlayed: games,
      gamesPlayed: games,
      points,
      goalsFor,
      goalsAgainst,
      goalsForPerGame: actual.goalsForPerGame,
      goalsAgainstPerGame: actual.goalsAgainstPerGame,
      attackPerformance: canonicalTeamSeason.performance.offense.priorityRate,
      defensePerformance: canonicalTeamSeason.performance.defense.priorityRate,
    },
    attackPerGame: games ? (goalsFor / games).toFixed(2) : '-',
    defensePerGame: games ? (goalsAgainst / games).toFixed(2) : '-',
    offense: canonicalTeamSeason.performance.offense,
    defense: canonicalTeamSeason.performance.defense,
    playersStatus: playersCount ? `${playersCount}` : 'אין סגל',
    statsStatus: playersCount
      ? `${teamPlayers.filter(player => Number(player?.playerStats?.minutes || player?.minutes || 0) > 0).length}`
      : '0',
  }
}
