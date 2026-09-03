// src/features/playersDatabase/ui/pages/teamPage/logic/teamStatsScout.logic.js

import {
  adaptPlayerScoutEngineResult,
  buildDbPlayerScoutResult,
  buildPlayerScoutCalculationContract,
  buildPlayerLineClassificationState,
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
  scoutCandidateSignals: [],
  scoutSpotlights: [],
  scoutOpportunity: null,
  scoutVerification: null,
  scoutProfileProgression: null,
  scoutProfileHierarchy: null,
  scoutTrajectory: null,
  scoutTransferContext: null,
  scoutEngineVersion: 'scouting-v2',
  scoutCalculationContract: null,
  lineClassification: null,
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

  if (!clean(row?.fullName) || status === 'retired') {
    return buildEmptyStatsScoutPreview()
  }

  try {
    const statsPlayer = buildStatsPlayer(row)
    const baseContract = buildPlayerScoutCalculationContract({
      player: statsPlayer,
      team,
      season,
    })
    const lineClassification = buildPlayerLineClassificationState({
      player: {
        ...statsPlayer,
        playerStats: {
          ...statsPlayer.playerStats,
          teamMinutes: baseContract.context?.seasonMinutes || 0,
          teamGames: baseContract.context?.teamGames || 0,
        },
      },
    })
    const contract = buildPlayerScoutCalculationContract({
      player: {
        ...statsPlayer,
        lineClassification,
      },
      team,
      season,
    })
    const result = buildDbPlayerScoutResult({
      player: contract.player,
      team: contract.team,
      season: contract.season,
      perspective: 'players_database_stats_preview',
    })
    const rawSignals = Array.isArray(result?.signals) ? result.signals : []
    const orderedProfileIds = Array.isArray(result?.profileHierarchy?.orderedProfileIds)
      ? result.profileHierarchy.orderedProfileIds
      : []
    const signalByProfileId = new Map(
      rawSignals.map(signal => [signal.profileId, signal])
    )
    const orderedSignals = orderedProfileIds
      .map(profileId => signalByProfileId.get(profileId))
      .filter(Boolean)
    const orderedSignalIds = new Set(
      orderedSignals.map(signal => signal.profileId)
    )
    const scoutSignals = [
      ...orderedSignals,
      ...rawSignals.filter(signal => !orderedSignalIds.has(signal.profileId)),
    ]
    const scout = adaptPlayerScoutEngineResult({
      ...result,
      signals: scoutSignals,
    })
    return {
      scout,
      scoutSignals,
      scoutProfiles: scoutSignals,
      scoutCombinations: scout.combinations,
      bestScoutSignal: result?.bestSignal || scout.profileHierarchy?.primarySignal || null,
      scoutCandidateSignals: Array.isArray(result?.candidateSignals)
        ? result.candidateSignals
        : [],
      scoutSpotlights: Array.isArray(result?.spotlights)
        ? result.spotlights
        : [],
      scoutOpportunity: result?.opportunity || null,
      scoutVerification: result?.verification || null,
      scoutProfileProgression: scout.profileProgression,
      scoutProfileHierarchy: scout.profileHierarchy,
      scoutTrajectory: scout.trajectory,
      scoutTransferContext: scout.transferContext,
      scoutEngineVersion: result?.engineVersion || 'scouting-v2',
      scoutCalculationContract: contract.context,
      lineClassification,
    }
  } catch (error) {
    console.warn('playersDatabase stats scout profile failed', error)
    return buildEmptyStatsScoutPreview()
  }
}
