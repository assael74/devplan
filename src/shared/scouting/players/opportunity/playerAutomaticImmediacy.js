// src/shared/scouting/players/opportunity/playerAutomaticImmediacy.js

import {
  FUTURE_COMPETITION_OUTLOOK,
} from '../../common/futureCompetition/index.js'

import {
  buildPlayerSignalPersistence,
} from '../signalPersistence/index.js'

import {
  PLAYER_SCOUT_ACTION_STATUS,
  PLAYER_SCOUT_IMMEDIACY_BOOST,
  PLAYER_SCOUT_IMMEDIACY_REDUCTION,
  PLAYER_SCOUT_IMMEDIACY_SOURCE,
} from './playerOpportunity.model.js'

const PRIORITY_SCORE = 3
const IMMEDIATE_SCORE = 6
const IDEAL_CLUB_MIN = 1.5
const IDEAL_CLUB_MAX = 2.5
const IDEAL_LEAGUE_LEVEL = 2
const PLAYING_UP_MIN_GAMES = 10
const PROMOTED_TALENT_PROFILE_ID = 'promoted_talent'

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const resolveSource = ({ signals, candidateSignals }) => {
  if (signals.length) return PLAYER_SCOUT_IMMEDIACY_SOURCE.PROFILE
  if (candidateSignals.length) return PLAYER_SCOUT_IMMEDIACY_SOURCE.NEAR_PROFILE

  return PLAYER_SCOUT_IMMEDIACY_SOURCE.NONE
}

const resolveCurrentMetrics = ({ signals, currentMetrics }) => {
  if (currentMetrics && typeof currentMetrics === 'object') return currentMetrics

  return signals[0]?.metrics || {}
}

const buildBoost = ({ id, points = 1, details = {} }) => ({
  id,
  points,
  details,
})

const buildReduction = ({ id, points = 1, details = {} }) => ({
  id,
  points,
  details,
})

const buildEarlyAgeGroupBoost = (immediacyContext = {}) => {
  if (immediacyContext.isEarlyAgeGroup !== true) return null

  return buildBoost({
    id: PLAYER_SCOUT_IMMEDIACY_BOOST.EARLY_AGE_GROUP,
  })
}

const buildProfileCombinationBoost = (profileCaseStrength = {}) => {
  if (!profileCaseStrength.hasDefinedCombination) return null

  return buildBoost({
    id: PLAYER_SCOUT_IMMEDIACY_BOOST.PROFILE_COMBINATION,
    details: {
      combinationIds: Array.isArray(profileCaseStrength.combinationIds)
        ? profileCaseStrength.combinationIds
        : [],
    },
  })
}

const buildIdealClubRangeBoost = (metrics = {}) => {
  const clubStrengthLevel = toNumber(metrics.clubStrengthLevel || metrics.clubLevel, 0)

  if (clubStrengthLevel < IDEAL_CLUB_MIN || clubStrengthLevel > IDEAL_CLUB_MAX) return null

  return buildBoost({
    id: PLAYER_SCOUT_IMMEDIACY_BOOST.IDEAL_CLUB_RANGE,
    details: {
      clubStrengthLevel,
    },
  })
}

const buildIdealLeagueLevelBoost = (immediacyContext = {}) => {
  const leagueLevel = toNumber(immediacyContext.leagueLevel, 0)

  if (leagueLevel !== IDEAL_LEAGUE_LEVEL) return null

  return buildBoost({
    id: PLAYER_SCOUT_IMMEDIACY_BOOST.IDEAL_LEAGUE_LEVEL,
    details: {
      leagueLevel,
    },
  })
}

const normalizeSeasonIdentity = value => {
  const text = String(value || '').trim().toLowerCase()
  const match = text.match(/(?:^|[^0-9])(\d{2,4})\s*[\/_-]\s*(\d{2,4})(?:$|[^0-9])/)

  if (!match) return text

  const first = Number(match[1])
  return String(first < 100 ? 2000 + first : first)
}

const buildFutureLevelRiskBoost = ({
  futureCompetitionPath,
  currentSeasonKey,
  currentSeasonStatus,
}) => {
  const safePath = futureCompetitionPath || {}
  const currentPathSeasonKey = safePath.current?.seasonKey || ''
  const normalizedCurrentSeason = normalizeSeasonIdentity(currentSeasonKey)
  const normalizedPathSeason = normalizeSeasonIdentity(currentPathSeasonKey)

  if (String(currentSeasonStatus || '').trim().toLowerCase() === 'completed') return null
  if (!normalizedCurrentSeason || !normalizedPathSeason) return null
  if (normalizedCurrentSeason !== normalizedPathSeason) return null
  if (safePath.outlook !== FUTURE_COMPETITION_OUTLOOK.RISK) return null

  return buildBoost({
    id: PLAYER_SCOUT_IMMEDIACY_BOOST.FUTURE_LEVEL_RISK,
    details: {
      currentLeagueLevel: safePath.current?.leagueLevel || null,
      steps: Array.isArray(safePath.steps) ? safePath.steps : [],
    },
  })
}

const buildPlayingUpValidationBoost = (signals = []) => {
  const signal = signals.find(item => item.profileId === PROMOTED_TALENT_PROFILE_ID)
  const games = toNumber(signal?.metrics?.games, 0)

  if (!signal || games < PLAYING_UP_MIN_GAMES) return null

  return buildBoost({
    id: PLAYER_SCOUT_IMMEDIACY_BOOST.PLAYING_UP_VALIDATION,
    details: {
      profileId: PROMOTED_TALENT_PROFILE_ID,
      games,
    },
  })
}

const buildProfilePersistenceBoost = (signalPersistence = {}) => {
  const profileRepeat = signalPersistence.profileRepeat || {}
  if (profileRepeat.seasons < 2) return null

  return buildBoost({
    id: PLAYER_SCOUT_IMMEDIACY_BOOST.PROFILE_PERSISTENCE,
    points: profileRepeat.seasons >= 3 ? 2 : 1,
    details: profileRepeat,
  })
}

const buildCombinationPersistenceBoost = (signalPersistence = {}) => {
  const combinationRepeat = signalPersistence.combinationRepeat || {}

  if (combinationRepeat.seasons < 2) return null

  return buildBoost({
    id: PLAYER_SCOUT_IMMEDIACY_BOOST.PROFILE_COMBINATION_PERSISTENCE,
    points: combinationRepeat.seasons >= 3 ? 2 : 1,
    details: combinationRepeat,
  })
}

const buildSignalDecayReduction = (signalPersistence = {}) => {
  const decay = signalPersistence.decay || {}

  if (decay.seasonsWithoutSignal < 1) return null

  return buildReduction({
    id: PLAYER_SCOUT_IMMEDIACY_REDUCTION.SIGNAL_DECAY,
    points: decay.seasonsWithoutSignal >= 2 ? 2 : 1,
    details: decay,
  })
}

const resolveActionStatus = netScore => {
  if (netScore >= IMMEDIATE_SCORE) return PLAYER_SCOUT_ACTION_STATUS.IMMEDIATE
  if (netScore >= PRIORITY_SCORE) return PLAYER_SCOUT_ACTION_STATUS.PRIORITY
  return PLAYER_SCOUT_ACTION_STATUS.WATCH
}

export const buildPlayerAutomaticImmediacy = ({
  signals = [],
  candidateSignals = [],
  combinations = [],
  profileCaseStrength = {},
  playerTrajectory = null,
  futureCompetitionPath = null,
  currentMetrics = null,
  immediacyContext = {},
  currentSeasonKey = '',
  currentSeasonStatus = '',
} = {}) => {
  const safeSignals = Array.isArray(signals) ? signals : []
  const safeCandidateSignals = Array.isArray(candidateSignals) ? candidateSignals : []
  const safeCombinations = Array.isArray(combinations) ? combinations : []
  const source = resolveSource({
    signals: safeSignals,
    candidateSignals: safeCandidateSignals,
  })
  const signalPersistence = buildPlayerSignalPersistence({
    signals: safeSignals,
    candidateSignals: safeCandidateSignals,
    combinations: safeCombinations,
    playerTrajectory,
    currentSeasonKey,
    currentSeasonStatus,
  })
  const metrics = resolveCurrentMetrics({
    signals: safeSignals,
    currentMetrics,
  })
  const boosts = [
    buildEarlyAgeGroupBoost(immediacyContext),
    buildProfileCombinationBoost(profileCaseStrength),
    buildIdealClubRangeBoost(metrics),
    buildIdealLeagueLevelBoost(immediacyContext),
    buildFutureLevelRiskBoost({
      futureCompetitionPath,
      currentSeasonKey,
      currentSeasonStatus,
    }),
    buildPlayingUpValidationBoost(safeSignals),
    buildProfilePersistenceBoost(signalPersistence),
    buildCombinationPersistenceBoost(signalPersistence),
  ].filter(Boolean)
  const reductions = [
    buildSignalDecayReduction(signalPersistence),
  ].filter(Boolean)
  const boostScore = boosts.reduce((sum, boost) => sum + boost.points, 0)
  const reductionScore = reductions.reduce((sum, reduction) => sum + reduction.points, 0)
  const netScore = boostScore - reductionScore

  return {
    baseActionStatus: PLAYER_SCOUT_ACTION_STATUS.WATCH,
    automaticActionStatus: resolveActionStatus(netScore),
    source,
    boostScore,
    reductionScore,
    netScore,
    boosts,
    reductions,
    signalPersistence,
  }
}
