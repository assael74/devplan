// src/features/playersDatabase/domain/orchestration/buildPlayerScoutState.js

import {
  buildDbPlayerScoutResult,
  PLAYER_SCOUT_ACTIVE_ENGINE,
} from './buildDbPlayerScoutResult.js'
import { normalizePlayerStats } from '../../model/playerStats.model.js'
import { buildPlayerScoutCalculationContract } from '../contracts/playerScoutInput.contract.js'
import { resolvePlayerFutureCompetitionPath } from './playerFutureCompetitionPath.js'
import { buildPreviousProfileDistancesFromMeasurement } from '../../model/playerScoutMeasurement.model.js'

const buildScoutPlayer = ({ player = {}, primaryPosition = '', positionLayer = '', numShirt = '' } = {}) => {
  const playerStats = normalizePlayerStats(player)

  return {
    ...player,
    primaryPosition,
    position: primaryPosition,
    positionLayer,
    numShirt,
    games: playerStats.games,
    goals: playerStats.goals,
    yellowCards: playerStats.yellowCards,
    minutes: playerStats.minutes,
    starts: playerStats.starts,
    subIn: playerStats.substituteIn,
    subOut: playerStats.substitutedOut,
    playerStats,
  }
}

const resolveManualReview = ({ player, manualReview }) => {
  if (manualReview && typeof manualReview === 'object') return manualReview
  if (player?.playerReview && typeof player.playerReview === 'object') return player.playerReview
  if (player?.manualReview && typeof player.manualReview === 'object') return player.manualReview

  return null
}

const resolveManualImmediacyDecision = ({ player, manualImmediacyDecision }) => {
  if (manualImmediacyDecision && typeof manualImmediacyDecision === 'object') {
    return manualImmediacyDecision
  }
  if (player?.manualImmediacyDecision && typeof player.manualImmediacyDecision === 'object') {
    return player.manualImmediacyDecision
  }
  if (player?.scoutOpportunity?.manualDecision && typeof player.scoutOpportunity.manualDecision === 'object') {
    return player.scoutOpportunity.manualDecision
  }

  return null
}

const isEarlyAgeGroup = ageGroupId => {
  const match = String(ageGroupId || '').trim().toLowerCase().match(/^u(\d+)$/)
  if (!match) return false

  return Number(match[1]) <= 14
}

const resolveImmediacyContext = ({ player, team, season, immediacyContext }) => {
  const seasonStatus = String(season?.seasonStatus || team?.seasonStatus || '').trim().toLowerCase()
  const isCurrentSeason = seasonStatus !== 'completed'

  return {
    ...(immediacyContext && typeof immediacyContext === 'object' ? immediacyContext : {}),
    isEarlyAgeGroup: isCurrentSeason && (
      immediacyContext?.isEarlyAgeGroup === true ||
      player?.isEarlyAgeGroup === true ||
      team?.isEarlyAgeGroup === true ||
      season?.isEarlyAgeGroup === true ||
      isEarlyAgeGroup(season?.ageGroupId || team?.ageGroupId)
    ),
    leagueLevel:
      immediacyContext?.leagueLevel ||
      team?.leagueLevel ||
      team?.league?.leagueLevel ||
      season?.leagueLevel ||
      null,
  }
}

export const isScoutCalculationExcludedRosterStatus = player => (
  String(player?.rosterStatus || '').trim() === 'retired'
)

export const isOperationalRosterPlayer = player => {
  const rosterStatus = String(player?.rosterStatus || '').trim()

  return rosterStatus !== 'retired' && rosterStatus !== 'transferredOut'
}

export const createEmptyPlayerScoutComputedState = () => ({
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
  scoutProfileCaseStrength: null,
  playerReview: null,
  scoutTrajectory: null,
  scoutTransferContext: null,
  scoutEngineVersion: PLAYER_SCOUT_ACTIVE_ENGINE,
})

const resolvePlayerSeasonStints = player => {
  if (Array.isArray(player?.playerSeasonStints)) return player.playerSeasonStints
  if (Array.isArray(player?.seasonStints)) return player.seasonStints

  const current = Array.isArray(player?.current) ? player.current : []
  const history = Array.isArray(player?.history) ? player.history : []
  const combined = [...history, ...current]

  return combined.length > 1 ? combined : []
}

const resolvePreviousProfileDistances = player => (
  buildPreviousProfileDistancesFromMeasurement(
    player?.scoutStatsLoadMeasurements?.previous
  )
)

export const buildPlayerScoutState = ({
  player = {},
  team = {},
  season = {},
  perspective = 'players_database',
  verificationAnswers = null,
  immediacyContext = null,
  manualReview = null,
  manualImmediacyDecision = null,
  futureCompetitionPath = null,
  clubBirthTeams = [],
} = {}) => {
  if (isScoutCalculationExcludedRosterStatus(player)) {
    return {
      ...player,
      ...createEmptyPlayerScoutComputedState(),
      scoutCalculationStatus: 'success',
    }
  }

  const contract = buildPlayerScoutCalculationContract({
    player: buildScoutPlayer({
      player,
      primaryPosition: player.primaryPosition || '',
      positionLayer: player.positionLayer || '',
      numShirt: player.numShirt || '',
    }),
    team,
    season,
  })
  const playerSeasonStints = resolvePlayerSeasonStints(player)
  const previousProfileDistances = resolvePreviousProfileDistances(player)
  const resolvedVerificationAnswers = Array.isArray(verificationAnswers)
    ? verificationAnswers
    : Array.isArray(contract.player?.verificationAnswers)
      ? contract.player.verificationAnswers
      : []
  const resolvedManualReview = resolveManualReview({ player, manualReview })
  const resolvedManualImmediacyDecision = resolveManualImmediacyDecision({
    player,
    manualImmediacyDecision,
  })
  const resolvedImmediacyContext = resolveImmediacyContext({
    player,
    team: contract.team,
    season: contract.season,
    immediacyContext,
  })
  const resolvedFutureCompetitionPath = resolvePlayerFutureCompetitionPath({
    player: contract.player,
    team: contract.team,
    season: contract.season,
    futureCompetitionPath,
    clubBirthTeams,
  })
  const scoutResult = buildDbPlayerScoutResult({
    player: contract.player,
    team: contract.team,
    season: contract.season,
    perspective,
    playerSeasonStints,
    previousProfileDistances,
    futureCompetitionPath: resolvedFutureCompetitionPath,
    verificationAnswers: resolvedVerificationAnswers,
    immediacyContext: resolvedImmediacyContext,
    manualReview: resolvedManualReview,
    manualImmediacyDecision: resolvedManualImmediacyDecision,
  })
  const engineVersion = scoutResult?.engineVersion || PLAYER_SCOUT_ACTIVE_ENGINE
  const rawSignals = Array.isArray(scoutResult?.signals)
    ? scoutResult.signals.map(signal => ({
        ...signal,
        engineVersion,
      }))
    : []
  const orderedProfileIds = Array.isArray(
    scoutResult?.profileHierarchy?.orderedProfileIds
  ) ? scoutResult.profileHierarchy.orderedProfileIds : []
  const signalByProfileId = new Map(
    rawSignals.map(signal => [signal.profileId, signal])
  )
  const orderedSignals = orderedProfileIds
    .map(profileId => signalByProfileId.get(profileId))
    .filter(Boolean)
  const orderedSignalIds = new Set(
    orderedSignals.map(signal => signal.profileId)
  )
  const signals = [
    ...orderedSignals,
    ...rawSignals.filter(signal => !orderedSignalIds.has(signal.profileId)),
  ]

  return {
    ...player,
    scoutSignals: signals,
    scoutProfiles: signals,
    scoutCombinations: Array.isArray(scoutResult?.combinations)
      ? scoutResult.combinations
      : [],
    bestScoutSignal: scoutResult?.bestSignal || null,
    scoutCandidateSignals: Array.isArray(scoutResult?.candidateSignals)
      ? scoutResult.candidateSignals
      : [],
    scoutSpotlights: Array.isArray(scoutResult?.spotlights)
      ? scoutResult.spotlights
      : [],
    scoutOpportunity: scoutResult?.opportunity || null,
    scoutVerification: scoutResult?.verification || null,
    scoutProfileProgression: scoutResult?.profileProgression || null,
    scoutProfileHierarchy: scoutResult?.profileHierarchy || null,
    scoutProfileCaseStrength: scoutResult?.profileCaseStrength || null,
    futureCompetitionPath: scoutResult?.futureCompetitionPath || resolvedFutureCompetitionPath,
    playerReview: scoutResult?.playerReview || resolvedManualReview,
    manualImmediacyDecision: resolvedManualImmediacyDecision,
    scoutTrajectory: scoutResult?.playerTrajectory || null,
    scoutTransferContext: scoutResult?.playerTrajectory?.latestTransfer || null,
    scoutEngineVersion: engineVersion,
    scoutCalculationStatus: 'success',
  }
}
