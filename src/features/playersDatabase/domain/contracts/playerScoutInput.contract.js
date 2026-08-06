// src/features/playersDatabase/domain/contracts/playerScoutInput.contract.js

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../catalog/clubs.catalog.js'
import { resolvePlayersDatabaseLeagueGameTime } from '../../catalog/leagues.catalog.js'
import {
  cleanDomainValue,
  firstDomainValue,
  toDomainNumber,
} from './domainValue.contract.js'

const DEFAULT_LEAGUE_GAMES = 30

const positiveNumber = (...values) => {
  for (const value of values) {
    const numberValue = toDomainNumber(value)
    if (numberValue !== null && numberValue > 0) return numberValue
  }

  return null
}

const resolveClub = clubId => PLAYERS_DATABASE_CLUBS_CATALOG.find(club => (
  cleanDomainValue(club.id) === cleanDomainValue(clubId)
)) || null

const resolveTeamPerformance = team => {
  const source = team.performance || team.teamScout || team.scout || {}

  return {
    source,
    offense:
      team.offense ||
      source.offense ||
      team.domain?.performance?.offense ||
      team.performanceView?.offense ||
      {},
    defense:
      team.defense ||
      source.defense ||
      team.domain?.performance?.defense ||
      team.performanceView?.defense ||
      {},
  }
}

const resolveAgeGroupId = ({ team, season }) => cleanDomainValue(firstDomainValue(
  season.ageGroupId,
  team.ageGroupId,
  team.league?.ageGroupId,
  team.domain?.league?.ageGroupId
))

const resolveTeamGames = ({ player, team, season }) => positiveNumber(
  player.teamGames,
  player.teamGamePlayed,
  season.teamGamePlayed,
  season.gamesPlayed,
  team.gamesPlayed,
  team.teamGamePlayed,
  team.games,
  team.teamStats?.gamesPlayed,
  team.teamStats?.teamGamePlayed
) || 0

const resolveTeamGoalsFor = ({ player, team, season }) => toDomainNumber(firstDomainValue(
  player.teamGoalsFor,
  team.goalsFor,
  team.teamStats?.goalsFor,
  season.goalsFor
), 0)

const resolveTeamGoalsAgainst = ({ player, team, season }) => toDomainNumber(firstDomainValue(
  player.teamGoalsAgainst,
  team.goalsAgainst,
  team.teamStats?.goalsAgainst,
  season.goalsAgainst
), 0)

export const createEmptyPlayerScoutCalculationContract = () => ({
  player: {},
  team: {},
  season: {},
  context: {
    ageGroupId: '',
    gameTime: null,
    leagueTotalRound: null,
    teamGames: null,
    seasonMinutes: null,
    clubLevel: null,
    birthTeamSlot: null,
    seasonStatus: '',
  },
  valid: false,
  issues: [],
})

export const buildPlayerScoutCalculationContract = ({
  player = {},
  team = {},
  season = {},
} = {}) => {
  const ageGroupId = resolveAgeGroupId({ team, season })
  const gameTime = resolvePlayersDatabaseLeagueGameTime(ageGroupId)
  const leagueTotalRound = positiveNumber(
    season.leagueTotalRound,
    season.leagueNumGames,
    team.leagueTotalRound,
    team.leagueNumGames,
    team.league?.leagueGames,
    team.domain?.league?.leagueGames
  ) || DEFAULT_LEAGUE_GAMES
  const teamGames = resolveTeamGames({ player, team, season })
  const clubId = cleanDomainValue(firstDomainValue(
    team.clubId,
    team.identity?.clubId,
    team.domain?.identity?.clubId
  ))
  const club = resolveClub(clubId)
  const clubLevel = toDomainNumber(firstDomainValue(
    team.clubLevel,
    team.club?.clubLevel,
    club?.clubLevel,
    player.clubLevel
  ))
  const birthTeamSlot = positiveNumber(
    team.birthTeamSlot,
    team.teamSlot,
    team.identity?.teamSlot,
    team.domain?.identity?.teamSlot,
    player.birthTeamSlot,
    player.teamSlot,
    player.teamNumber
  ) || 1
  const seasonStatus = cleanDomainValue(firstDomainValue(
    season.seasonStatus,
    team.seasonStatus,
    team.lifecycle?.isFinal === true ? 'completed' : ''
  )) || 'active'
  const performance = resolveTeamPerformance(team)
  const goalsFor = resolveTeamGoalsFor({ player, team, season })
  const goalsAgainst = resolveTeamGoalsAgainst({ player, team, season })
  const birthYear = toDomainNumber(firstDomainValue(player.birthYear, player.yearOfBirth))
  const teamBirthYear = toDomainNumber(firstDomainValue(
    team.birthYear,
    season.birthYear,
    team.season?.birthYear,
    team.domain?.season?.birthYear
  ))

  const normalizedTeam = {
    ...team,
    ...(team.teamStats || {}),
    clubId,
    clubLevel,
    ageGroupId,
    birthYear: teamBirthYear,
    birthTeamSlot,
    teamSlot: birthTeamSlot,
    teamNumber: birthTeamSlot,
    leagueTotalRound,
    leagueNumGames: leagueTotalRound,
    leagueGameTime: gameTime,
    gameTime,
    seasonStatus,
    gamesPlayed: teamGames,
    teamGamePlayed: teamGames,
    goalsFor,
    goalsAgainst,
    performance: performance.source,
    teamScout: performance.source,
    offense: performance.offense,
    defense: performance.defense,
    teamStats: {
      ...(team.teamStats || {}),
      gamesPlayed: teamGames,
      teamGamePlayed: teamGames,
      goalsFor,
      goalsAgainst,
    },
  }

  const normalizedPlayer = {
    ...player,
    birthYear,
    yearOfBirth: birthYear,
    teamBirthYear,
    clubLevel,
    birthTeamSlot,
    teamSlot: birthTeamSlot,
    teamNumber: birthTeamSlot,
    teamGames,
    teamGoalsFor: goalsFor,
    teamGoalsAgainst: goalsAgainst,
    subIn: toDomainNumber(firstDomainValue(
      player.subIn,
      player.substituteIn,
      player.playerStats?.substituteIn
    ), 0),
    subOut: toDomainNumber(firstDomainValue(
      player.subOut,
      player.substitutedOut,
      player.playerStats?.substitutedOut
    ), 0),
  }

  const normalizedSeason = {
    ...season,
    ageGroupId,
    birthYear: teamBirthYear,
    leagueTotalRound,
    leagueNumGames: leagueTotalRound,
    leagueGameTime: gameTime,
    gameTime,
    seasonStatus,
  }

  const issues = []
  if (!ageGroupId) issues.push('missing_age_group_id')
  if (!clubId) issues.push('missing_club_id')
  if (clubLevel === null) issues.push('missing_club_level')
  if (!teamGames) issues.push('missing_team_games')

  return {
    player: normalizedPlayer,
    team: normalizedTeam,
    season: normalizedSeason,
    context: {
      ageGroupId,
      gameTime,
      leagueTotalRound,
      teamGames,
      seasonMinutes: teamGames * gameTime,
      clubLevel,
      birthTeamSlot,
      seasonStatus,
      offensePriorityLevel: cleanDomainValue(
        performance.offense.priorityLevel || performance.offense.priority?.level
      ),
      defensePriorityLevel: cleanDomainValue(
        performance.defense.priorityLevel || performance.defense.priority?.level
      ),
    },
    valid: !issues.length,
    issues,
  }
}
