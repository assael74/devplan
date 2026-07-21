// features/playersDatabase/ui/pages/teamPage/logic/teamStatsScout.logic.js

import { buildPlayerScoutResult } from '../../../../../../shared/players/scouting/index.js'
import { normalizeTeamStats } from '../../../../model/teamStats.model.js'
import { clean, toNumber } from './teamPage.utils.js'

const buildEmptyStatsScoutPreview = () => ({
  scoutSignals: [],
  scoutProfiles: [],
  scoutCombinations: [],
  bestScoutSignal: null,
})

const pickFirstValue = (...values) => values.find(value => (
  value !== null
  && value !== undefined
  && value !== ''
))

const buildStatsScoutPlayerInput = (row, teamContext = {}) => {
  const teamStats = teamContext.teamStats || {}
  const teamGames = pickFirstValue(
    row.teamGames,
    row.teamGamePlayed,
    teamContext.gamesPlayed,
    teamContext.teamGamePlayed,
    teamStats.gamesPlayed,
    teamStats.teamGamePlayed,
  )
  const teamGoalsFor = pickFirstValue(
    row.teamGoalsFor,
    teamContext.goalsFor,
    teamStats.goalsFor,
  )
  const teamGoalsAgainst = pickFirstValue(
    row.teamGoalsAgainst,
    teamContext.goalsAgainst,
    teamStats.goalsAgainst,
  )
  const teamRank = pickFirstValue(
    row.teamRank,
    teamContext.rank,
    teamContext.tableRank,
    teamContext.position,
  )
  const teamAttackPerformance = pickFirstValue(
    row.teamAttackPerformance,
    teamContext.attackPerformance,
    teamStats.attackPerformance,
    teamContext.offense?.priorityRate,
    teamContext.offense?.scoutPriorityRate,
  )
  const teamDefensePerformance = pickFirstValue(
    row.teamDefensePerformance,
    teamContext.defensePerformance,
    teamStats.defensePerformance,
    teamContext.defense?.priorityRate,
    teamContext.defense?.scoutPriorityRate,
  )

  const playerStats = {
    games: toNumber(row.games),
    goals: toNumber(row.goals),
    yellowCards: toNumber(row.yellowCards),
    minutes: toNumber(row.minutes),
    starts: toNumber(row.starts),
    substituteIn: toNumber(row.substituteIn),
    substitutedOut: toNumber(row.substitutedOut),
    teamMinutes: toNumber(row.teamMinutes),
    teamGames: toNumber(teamGames),
    teamRank: teamRank ?? null,
    teamGoalsFor: toNumber(teamGoalsFor),
    teamGoalsAgainst: toNumber(teamGoalsAgainst),
    teamAttackPerformance: teamAttackPerformance ?? null,
    teamDefensePerformance: teamDefensePerformance ?? null,
  }

  return {
    ...row,
    ...playerStats,
    birthYear: pickFirstValue(row.birthYear, teamContext.birthYear),
    teamBirthYear: pickFirstValue(teamContext.birthYear, teamContext.ageGroupYear),
    clubLevel: pickFirstValue(row.clubLevel, teamContext.clubLevel),
    teamNumber: pickFirstValue(row.teamNumber, teamContext.teamNumber),
    subIn: playerStats.substituteIn,
    subOut: playerStats.substitutedOut,
    playerStats,
    isYoungerAgeGroup: row.rosterStatus === 'youngerAgeGroup' || Boolean(row.isYoungerAgeGroup),
  }
}

const buildStatsScoutTeamInput = ({ team = {}, season = {} } = {}) => {
  const normalizedStats = normalizeTeamStats(team, {
    season,
    gamesCandidates: [
      team.gamesPlayed,
      team.teamGamePlayed,
      team.teamStats?.teamGamePlayed,
      team.teamStats?.gamesPlayed,
      season.teamGamePlayed,
      season.gamesPlayed,
    ],
    goalsForCandidates: [team.goalsFor, team.teamStats?.goalsFor, season.goalsFor],
    goalsAgainstCandidates: [
      team.goalsAgainst,
      team.teamStats?.goalsAgainst,
      season.goalsAgainst,
    ],
  })

  return {
    ...team,
    ...(team.teamStats || {}),
    leagueTotalRound: pickFirstValue(team.leagueTotalRound, season.leagueTotalRound),
    leagueGameTime: pickFirstValue(team.leagueGameTime, season.leagueGameTime),
    leagueNumGames: pickFirstValue(team.leagueTotalRound, season.leagueTotalRound),
    gamesPlayed: normalizedStats.gamesPlayed,
    teamGamePlayed: normalizedStats.gamesPlayed,
    goalsFor: normalizedStats.goalsFor,
    goalsAgainst: normalizedStats.goalsAgainst,
    teamStats: {
      ...(team.teamStats || {}),
      teamGamePlayed: normalizedStats.gamesPlayed,
      gamesPlayed: normalizedStats.gamesPlayed,
      goalsFor: normalizedStats.goalsFor,
      goalsAgainst: normalizedStats.goalsAgainst,
    },
  }
}

const buildStatsScoutProfilePreview = signal => ({
  profileId: clean(signal?.profileId),
  label: clean(signal?.profileLabel || signal?.label || signal?.profileId),
  profileScore: Number.isFinite(Number(signal?.score)) ? Number(signal.score) : null,
  profileReliability: signal?.reliability?.level || signal?.reliabilityLevel || '',
})

export const buildStatsScoutPreview = ({ row, team, season }) => {
  const status = clean(row?.rosterStatus || 'regular')

  if (!clean(row?.fullName) || status === 'retired' || status === 'transferredOut') {
    return buildEmptyStatsScoutPreview()
  }

  try {
    const teamInput = buildStatsScoutTeamInput({ team, season })
    const result = buildPlayerScoutResult({
      player: buildStatsScoutPlayerInput(row, teamInput),
      team: teamInput,
      season,
      perspective: 'players_database_stats_preview',
    })
    const scoutSignals = Array.isArray(result?.signals) ? result.signals : []

    return {
      scoutSignals,
      scoutProfiles: scoutSignals.map(buildStatsScoutProfilePreview),
      scoutCombinations: Array.isArray(result?.combinations) ? result.combinations : [],
      bestScoutSignal: result?.bestSignal || scoutSignals[0] || null,
    }
  } catch (error) {
    console.warn('playersDatabase stats scout profile failed', error)
    return buildEmptyStatsScoutPreview()
  }
}

