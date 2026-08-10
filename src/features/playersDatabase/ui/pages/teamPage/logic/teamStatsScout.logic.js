// src/features/playersDatabase/ui/pages/teamPage/logic/teamStatsScout.logic.js

import {
  adaptPlayerScoutEngineResult,
  buildDbPlayerScoutResult,
  buildPlayerScoutCalculationContract,
} from '../../../../domain/index.js'
import {
  clean,
  toNumber,
} from './teamPage.utils.js'

const buildEmptyStatsScoutPreview = () => ({
  scoutSignals: [],
  scoutProfiles: [],
  scoutCombinations: [],
  bestScoutSignal: null,
  scoutCalculationContract: null,
})

const buildStatsPlayer = row => {
  const playerStats = {
    games: toNumber(row.games),
    goals: toNumber(row.goals),
    yellowCards: toNumber(row.yellowCards),
    minutes: toNumber(row.minutes),
    starts: toNumber(row.starts),
    substituteIn: toNumber(row.substituteIn),
    substitutedOut: toNumber(row.substitutedOut),
    teamMinutes: toNumber(row.teamMinutes),
    teamGames: toNumber(row.teamGames),
    teamRank: row.teamRank === undefined ? null : row.teamRank,
    teamGoalsFor: toNumber(row.teamGoalsFor),
    teamGoalsAgainst: toNumber(row.teamGoalsAgainst),
  }

  return {
    ...row,
    ...playerStats,
    playerStats,
    subIn: playerStats.substituteIn,
    subOut: playerStats.substitutedOut,
    isYoungerAgeGroup:
      row.rosterStatus === 'youngerAgeGroup' ||
      Boolean(row.isYoungerAgeGroup),
  }
}

export const buildStatsScoutPreview = ({ row, team, season }) => {
  const status = clean(row?.rosterStatus || 'regular')

  if (!clean(row?.fullName) || status === 'retired' || status === 'transferredOut') {
    return buildEmptyStatsScoutPreview()
  }

  try {
    const contract = buildPlayerScoutCalculationContract({
      player: buildStatsPlayer(row),
      team,
      season,
    })
    const result = buildDbPlayerScoutResult({
      player: contract.player,
      team: contract.team,
      season: contract.season,
      perspective: 'players_database_stats_preview',
    })
    const scoutSignals = Array.isArray(result?.signals) ? result.signals : []
    const scout = adaptPlayerScoutEngineResult(result)

    return {
      scout,
      scoutSignals,
      scoutProfiles: scout.profiles.map(profile => ({
        profileId: profile.id,
        label: profile.label,
        profileScore: profile.score,
        profileReliability: profile.reliability.level,
        profileWarnings: profile.warnings,
        positionContext: profile.positionContext || '',
      })),
      scoutCombinations: scout.combinations,
      bestScoutSignal: result?.bestSignal || scoutSignals[0] || null,
      scoutCalculationContract: contract.context,
    }
  } catch (error) {
    console.warn('playersDatabase stats scout profile failed', error)
    return buildEmptyStatsScoutPreview()
  }
}
