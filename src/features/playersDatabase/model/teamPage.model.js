// features/playersDatabase/model/teamPage.model.js

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../catalog/clubs.catalog.js'
import { buildTeamDisplayName } from '../catalog/teamDisplay.js'
import { normalizePlayerIdentity, resolvePlayerOptionValue } from './playerIdentity.model.js'
import { normalizePlayerStats } from './playerStats.model.js'
import { isSameSeason, normalizeSeasonLookupKey, normalizeSeasonIdentity } from './season.model.js'
import { normalizeTeamIdentity, resolveTeamLookupKey } from './teamIdentity.model.js'
import { buildTeamStatsAliases, normalizeTeamStats } from './teamStats.model.js'
import { cleanValue, toNumberOrZero } from './value.model.js'
import { buildTeamScoutLeagueModel, TEAM_SCOUT_NORMALIZATION_MODE, TEAM_SCOUT_SORT_MODE } from '../../../shared/teams/scout/index.js'
import {
  buildScoutProfileCombinations,
  SCOUT_PROFILES,
} from '../../../shared/players/scouting/index.js'

const buildSeasonOption = ({ season, target }) => {
  const identity = normalizeSeasonIdentity({ season })

  return {
    target,
    season,
    seasonId: identity.seasonId,
    seasonKey: normalizeSeasonLookupKey(
      identity.seasonKey || identity.seasonId
    ),
  }
}

export const buildTeamPageSeasonOptions = league => {
  const options = []

  if (league?.current?.seasonId || league?.current?.seasonKey) {
    options.push(buildSeasonOption({
      season: league.current,
      target: 'current',
    }))
  }

  const history = Array.isArray(league?.history) ? league.history : []
  history.forEach(season => {
    if (!season?.seasonId && !season?.seasonKey) return

    options.push(buildSeasonOption({
      season,
      target: 'history',
    }))
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
    row,
  ]))
}

export const findTeamPageSeasonDoc = ({ teamDoc, selectedSeasonOption }) => {
  if (!teamDoc || !selectedSeasonOption) return null

  const fieldKey = selectedSeasonOption.target === 'history' ? 'history' : 'current'
  const rows = Array.isArray(teamDoc[fieldKey]) ? teamDoc[fieldKey] : []

  return rows.find(row => isSameSeason(row, selectedSeasonOption)) || null
}

const getClubIdFromTeamId = teamId =>
  cleanValue(teamId).split('_').filter(Boolean)[0] || ''

const getClubById = clubId =>
  PLAYERS_DATABASE_CLUBS_CATALOG.find(
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

const SCOUT_PROFILE_BY_ID = SCOUT_PROFILES.reduce((map, profile) => {
  map[profile.id] = profile
  return map
}, {})

const resolveScoutProfileLabel = profile => {
  const profileId = cleanValue(profile?.profileId || profile?.id)

  if (!profileId) return ''

  return cleanValue(
    profile?.label ||
    SCOUT_PROFILE_BY_ID[profileId]?.label ||
    profileId
  )
}

const buildScoutProfileDisplay = (player = {}) => {
  const scoutProfiles = Array.isArray(player.scoutProfiles)
    ? player.scoutProfiles
    : []
  const signals = scoutProfiles
    .map(profile => ({
      ...profile,
      profileId: cleanValue(profile?.profileId || profile?.id),
    }))
    .filter(profile => profile.profileId)
  const combinations = buildScoutProfileCombinations({ signals })
  const combination = combinations[0] || null

  if (combination) {
    const baseProfiles = (combination.matchedProfileIds || [])
      .map(profileId => ({
        id: profileId,
        label: SCOUT_PROFILE_BY_ID[profileId]?.label || profileId,
      }))

    return {
      type: 'combination',
      id: cleanValue(combination.id),
      label: cleanValue(combination.label),
      reliability: cleanValue(
        scoutProfiles[0]?.reliabilityLevel ||
        scoutProfiles[0]?.profileReliability
      ),
      baseProfiles,
    }
  }

  const primaryProfile = scoutProfiles[0] || null

  if (!primaryProfile) {
    return {
      type: 'none',
      id: '',
      label: '',
      reliability: '',
      baseProfiles: [],
    }
  }

  return {
    type: 'profile',
    id: cleanValue(primaryProfile.profileId || primaryProfile.id),
    label: resolveScoutProfileLabel(primaryProfile),
    reliability: cleanValue(
      primaryProfile.reliabilityLevel ||
      primaryProfile.profileReliability
    ),
    baseProfiles: [],
  }
}

export const normalizeTeamPagePlayerRow = (player = {}, index = 0) => {
  const identity = normalizePlayerIdentity(player)
  const playerStats = normalizePlayerStats(player)
  const scoutProfiles = Array.isArray(player.scoutProfiles)
    ? player.scoutProfiles
    : []
  const scoutProfileDisplay = buildScoutProfileDisplay(player)

  return {
    ...player,
    id: resolvePlayerOptionValue(player) || `${index}`,
    playerId: identity.playerId,
    playerDocumentId: identity.playerDocumentId,
    externalPlayerId: identity.externalPlayerId,
    playerUrl: cleanValue(player.playerUrl),
    number: cleanValue(player.numShirt || player.number || index + 1),
    numShirt: cleanValue(player.numShirt || player.number),
    fullName: identity.fullName,
    normalizedName: identity.normalizedName,
    positionLayer: cleanValue(player.positionLayer),
    primaryPosition: cleanValue(player.primaryPosition),
    playerStats,
    games: playerStats.games,
    goals: playerStats.goals,
    starts: playerStats.starts,
    yellowCards: playerStats.yellowCards,
    minutes: playerStats.minutes,
    profile: scoutProfileDisplay.label || '-',
    reliability: scoutProfileDisplay.reliability || '-',
    scoutProfiles,
    scoutProfileDisplay,
  }
}

export const buildTeamPageView = ({
  teamId,
  leagueDoc,
  teamDoc,
  selectedSeasonOption,
  selectedTeamSeason,
}) => {
  const season = selectedSeasonOption?.season || {}
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
  const scoutResult = buildScoutResultMap({
    tableRank,
    leagueDoc,
    season,
  }).get(resolveTeamLookupKey(teamRow) || resolveTeamLookupKey(teamIdentity))
  const rawStats = teamRow.teamStats || selectedTeamSeason?.teamStats || {}
  const teamStats = normalizeTeamStats(
    {
      ...selectedTeamSeason,
      ...teamRow,
      teamStats: rawStats,
    },
    {
      season,
      gamesCandidates: [rawStats.teamGamePlayed, teamRow.games],
      pointsCandidates: [rawStats.points, teamRow.points],
      goalsForCandidates: [rawStats.goalsFor, teamRow.goalsFor],
      goalsAgainstCandidates: [rawStats.goalsAgainst, teamRow.goalsAgainst],
    }
  )
  const statsAliases = buildTeamStatsAliases(teamStats)
  const games = teamStats.gamesPlayed
  const points = teamStats.points
  const goalsFor = teamStats.goalsFor
  const goalsAgainst = teamStats.goalsAgainst
  const successPercent = games
    ? Math.round((points / (games * 3)) * 100)
    : null
  const teamPlayers = Array.isArray(selectedTeamSeason?.teamPlayers)
    ? selectedTeamSeason.teamPlayers
    : []
  const playersCount = teamPlayers.length

  return {
    id: cleanValue(teamId),
    birthTeamId: teamIdentity.birthTeamId || cleanValue(teamId),
    teamDocumentId: teamIdentity.teamDocumentId || cleanValue(teamId),
    clubId: teamIdentity.clubId || getClubIdFromTeamId(teamId),
    name: resolveTeamName({ teamRow, teamDoc, teamId }),
    leagueId: cleanValue(leagueDoc?.id || season.leagueId),
    leagueName: cleanValue(leagueDoc?.leagueName || leagueDoc?.name || leagueDoc?.id || '-'),
    ageGroupId: cleanValue(teamRow.ageGroupId || selectedTeamSeason?.ageGroupId || season.ageGroupId || leagueDoc?.ageGroupId),
    ageGroupLabel: cleanValue(teamRow.ageGroupLabel || selectedTeamSeason?.ageGroupLabel || season.ageGroupLabel || leagueDoc?.ageGroupLabel),
    birthYear: season.birthYear || selectedTeamSeason?.birthYear || teamDoc?.birthYear || '-',
    seasonKey: selectedSeasonOption?.seasonKey || '-',
    tableRank: toNumberOrZero(teamRow.rank || teamRow.tableRank) || '-',
    games,
    points,
    successPercent,
    goalsFor,
    goalsAgainst,
    teamUrl: cleanValue(selectedTeamSeason?.teamUrl || teamRow.teamUrl),
    teamStats: {
      ...rawStats,
      ...teamStats,
      ...statsAliases,
    },
    attackPerGame: games ? (goalsFor / games).toFixed(2) : '-',
    defensePerGame: games ? (goalsAgainst / games).toFixed(2) : '-',
    offense: scoutResult?.offense || null,
    defense: scoutResult?.defense || null,
    playersStatus: playersCount ? `${playersCount}` : 'אין סגל',
    statsStatus: playersCount
      ? `${teamPlayers.filter(player => normalizePlayerStats(player).minutes > 0).length}`
      : '0',
  }
}

