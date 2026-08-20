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
  PLAYER_SCOUT_IMMEDIACY_EVALUATION_RESULT,
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

const buildEvaluation = ({
  id,
  result,
  points = 0,
  reason = '',
  profileId = '',
  details = {},
}) => ({
  id,
  result,
  points,
  reason,
  ...(profileId ? { profileId } : {}),
  details,
})

const buildNotApplicableEvaluation = ({ id, reason, details = {} }) => (
  buildEvaluation({
    id,
    result: PLAYER_SCOUT_IMMEDIACY_EVALUATION_RESULT.NOT_APPLICABLE,
    reason,
    details,
  })
)

const buildNoChangeEvaluation = ({ id, reason, profileId = '', details = {} }) => (
  buildEvaluation({
    id,
    result: PLAYER_SCOUT_IMMEDIACY_EVALUATION_RESULT.NO_CHANGE,
    reason,
    profileId,
    details,
  })
)

const buildBoostEvaluation = ({ id, points = 1, profileId = '', details = {} }) => (
  buildEvaluation({
    id,
    result: PLAYER_SCOUT_IMMEDIACY_EVALUATION_RESULT.BOOST,
    points,
    reason: 'condition_met',
    profileId,
    details,
  })
)

const buildReductionEvaluation = ({ id, points = 1, profileId = '', details = {} }) => (
  buildEvaluation({
    id,
    result: PLAYER_SCOUT_IMMEDIACY_EVALUATION_RESULT.REDUCTION,
    points: -Math.abs(points),
    reason: 'condition_met',
    profileId,
    details,
  })
)

const buildEarlyAgeGroupEvaluation = ({ immediacyContext, currentSeasonStatus }) => {
  if (immediacyContext.isEarlyAgeGroup === true) {
    return buildBoostEvaluation({
      id: PLAYER_SCOUT_IMMEDIACY_BOOST.EARLY_AGE_GROUP,
      details: {},
    })
  }

  const seasonStatus = String(currentSeasonStatus || '').trim().toLowerCase()

  if (seasonStatus === 'completed') {
    return buildNotApplicableEvaluation({
      id: PLAYER_SCOUT_IMMEDIACY_BOOST.EARLY_AGE_GROUP,
      reason: 'completed_season',
      details: {
        isEarlyAgeGroup: false,
        currentSeasonStatus: seasonStatus,
      },
    })
  }

  return buildNoChangeEvaluation({
    id: PLAYER_SCOUT_IMMEDIACY_BOOST.EARLY_AGE_GROUP,
    reason: 'age_group_not_early',
    details: {
      isEarlyAgeGroup: false,
    },
  })
}

const buildProfileCombinationEvaluation = ({ profileCaseStrength, signals }) => {
  const combinationIds = Array.isArray(profileCaseStrength?.combinationIds)
    ? profileCaseStrength.combinationIds
    : []

  if (profileCaseStrength?.hasDefinedCombination) {
    return buildBoostEvaluation({
      id: PLAYER_SCOUT_IMMEDIACY_BOOST.PROFILE_COMBINATION,
      details: {
        combinationIds,
      },
    })
  }

  if (signals.length < 2) {
    return buildNotApplicableEvaluation({
      id: PLAYER_SCOUT_IMMEDIACY_BOOST.PROFILE_COMBINATION,
      reason: 'multiple_profiles_required',
      details: {
        profileCount: signals.length,
      },
    })
  }

  return buildNoChangeEvaluation({
    id: PLAYER_SCOUT_IMMEDIACY_BOOST.PROFILE_COMBINATION,
    reason: 'no_defined_combination',
    details: {
      profileCount: signals.length,
      combinationIds,
    },
  })
}

const buildIdealClubRangeEvaluation = (metrics = {}) => {
  const clubStrengthLevel = toNumber(metrics.clubStrengthLevel || metrics.clubLevel, 0)

  if (!clubStrengthLevel) {
    return buildNotApplicableEvaluation({
      id: PLAYER_SCOUT_IMMEDIACY_BOOST.IDEAL_CLUB_RANGE,
      reason: 'club_strength_unavailable',
    })
  }

  if (clubStrengthLevel >= IDEAL_CLUB_MIN && clubStrengthLevel <= IDEAL_CLUB_MAX) {
    return buildBoostEvaluation({
      id: PLAYER_SCOUT_IMMEDIACY_BOOST.IDEAL_CLUB_RANGE,
      details: {
        clubStrengthLevel,
      },
    })
  }

  return buildNoChangeEvaluation({
    id: PLAYER_SCOUT_IMMEDIACY_BOOST.IDEAL_CLUB_RANGE,
    reason: 'club_strength_outside_ideal_range',
    details: {
      clubStrengthLevel,
      min: IDEAL_CLUB_MIN,
      max: IDEAL_CLUB_MAX,
    },
  })
}

const buildIdealLeagueLevelEvaluation = (immediacyContext = {}) => {
  const leagueLevel = toNumber(immediacyContext.leagueLevel, 0)

  if (!leagueLevel) {
    return buildNotApplicableEvaluation({
      id: PLAYER_SCOUT_IMMEDIACY_BOOST.IDEAL_LEAGUE_LEVEL,
      reason: 'league_level_unavailable',
    })
  }

  if (leagueLevel === IDEAL_LEAGUE_LEVEL) {
    return buildBoostEvaluation({
      id: PLAYER_SCOUT_IMMEDIACY_BOOST.IDEAL_LEAGUE_LEVEL,
      details: {
        leagueLevel,
      },
    })
  }

  return buildNoChangeEvaluation({
    id: PLAYER_SCOUT_IMMEDIACY_BOOST.IDEAL_LEAGUE_LEVEL,
    reason: 'league_level_not_ideal',
    details: {
      leagueLevel,
      targetLeagueLevel: IDEAL_LEAGUE_LEVEL,
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

const buildFutureLevelRiskEvaluation = ({
  futureCompetitionPath,
  currentSeasonKey,
  currentSeasonStatus,
}) => {
  const safePath = futureCompetitionPath || {}
  const currentPathSeasonKey = safePath.current?.seasonKey || ''
  const normalizedCurrentSeason = normalizeSeasonIdentity(currentSeasonKey)
  const normalizedPathSeason = normalizeSeasonIdentity(currentPathSeasonKey)
  const seasonStatus = String(currentSeasonStatus || '').trim().toLowerCase()
  const details = {
    currentSeasonKey,
    pathSeasonKey: currentPathSeasonKey,
    currentSeasonStatus: seasonStatus,
    outlook: safePath.outlook || '',
  }

  if (seasonStatus === 'completed') {
    return buildNotApplicableEvaluation({
      id: PLAYER_SCOUT_IMMEDIACY_BOOST.FUTURE_LEVEL_RISK,
      reason: 'completed_season',
      details,
    })
  }
  if (!normalizedCurrentSeason || !normalizedPathSeason) {
    return buildNotApplicableEvaluation({
      id: PLAYER_SCOUT_IMMEDIACY_BOOST.FUTURE_LEVEL_RISK,
      reason: 'future_path_unavailable',
      details,
    })
  }
  if (normalizedCurrentSeason !== normalizedPathSeason) {
    return buildNotApplicableEvaluation({
      id: PLAYER_SCOUT_IMMEDIACY_BOOST.FUTURE_LEVEL_RISK,
      reason: 'future_path_season_mismatch',
      details,
    })
  }
  if (safePath.outlook !== FUTURE_COMPETITION_OUTLOOK.RISK) {
    return buildNoChangeEvaluation({
      id: PLAYER_SCOUT_IMMEDIACY_BOOST.FUTURE_LEVEL_RISK,
      reason: 'future_outlook_not_risk',
      details,
    })
  }

  return buildBoostEvaluation({
    id: PLAYER_SCOUT_IMMEDIACY_BOOST.FUTURE_LEVEL_RISK,
    details: {
      currentLeagueLevel: safePath.current?.leagueLevel || null,
      steps: Array.isArray(safePath.steps) ? safePath.steps : [],
    },
  })
}

const buildPlayingUpValidationEvaluation = (signals = []) => {
  const signal = signals.find(item => item.profileId === PROMOTED_TALENT_PROFILE_ID)

  if (!signal) {
    return buildNotApplicableEvaluation({
      id: PLAYER_SCOUT_IMMEDIACY_BOOST.PLAYING_UP_VALIDATION,
      reason: 'promoted_talent_profile_required',
    })
  }

  const games = toNumber(signal.metrics?.games, 0)
  const details = {
    profileId: PROMOTED_TALENT_PROFILE_ID,
    games,
    minGames: PLAYING_UP_MIN_GAMES,
  }

  if (games < PLAYING_UP_MIN_GAMES) {
    return buildNoChangeEvaluation({
      id: PLAYER_SCOUT_IMMEDIACY_BOOST.PLAYING_UP_VALIDATION,
      reason: 'playing_up_sample_too_small',
      profileId: PROMOTED_TALENT_PROFILE_ID,
      details,
    })
  }

  return buildBoostEvaluation({
    id: PLAYER_SCOUT_IMMEDIACY_BOOST.PLAYING_UP_VALIDATION,
    profileId: PROMOTED_TALENT_PROFILE_ID,
    details: {
      profileId: PROMOTED_TALENT_PROFILE_ID,
      games,
    },
  })
}

const buildProfilePersistenceEvaluation = ({ signalPersistence, signals }) => {
  const profileRepeat = signalPersistence.profileRepeat || {}

  if (profileRepeat.seasons >= 2) {
    return buildBoostEvaluation({
      id: PLAYER_SCOUT_IMMEDIACY_BOOST.PROFILE_PERSISTENCE,
      points: profileRepeat.seasons >= 3 ? 2 : 1,
      profileId: profileRepeat.profileId,
      details: profileRepeat,
    })
  }

  if (!signals.length || !profileRepeat.profileId) {
    return buildNotApplicableEvaluation({
      id: PLAYER_SCOUT_IMMEDIACY_BOOST.PROFILE_PERSISTENCE,
      reason: 'current_profile_required',
    })
  }

  if (profileRepeat.seasons < 2) {
    return buildNoChangeEvaluation({
      id: PLAYER_SCOUT_IMMEDIACY_BOOST.PROFILE_PERSISTENCE,
      reason: 'profile_not_repeated',
      profileId: profileRepeat.profileId,
      details: profileRepeat,
    })
  }

}

const buildCombinationPersistenceEvaluation = ({ signalPersistence, combinations }) => {
  const combinationRepeat = signalPersistence.combinationRepeat || {}

  if (combinationRepeat.seasons >= 2) {
    return buildBoostEvaluation({
      id: PLAYER_SCOUT_IMMEDIACY_BOOST.PROFILE_COMBINATION_PERSISTENCE,
      points: combinationRepeat.seasons >= 3 ? 2 : 1,
      details: combinationRepeat,
    })
  }

  if (!combinations.length || !combinationRepeat.combinationId) {
    return buildNotApplicableEvaluation({
      id: PLAYER_SCOUT_IMMEDIACY_BOOST.PROFILE_COMBINATION_PERSISTENCE,
      reason: 'current_combination_required',
    })
  }

  if (combinationRepeat.seasons < 2) {
    return buildNoChangeEvaluation({
      id: PLAYER_SCOUT_IMMEDIACY_BOOST.PROFILE_COMBINATION_PERSISTENCE,
      reason: 'combination_not_repeated',
      details: combinationRepeat,
    })
  }

}

const buildSignalDecayEvaluation = ({ signalPersistence, source }) => {
  const decay = signalPersistence.decay || {}

  if (source !== PLAYER_SCOUT_IMMEDIACY_SOURCE.NONE) {
    return buildNotApplicableEvaluation({
      id: PLAYER_SCOUT_IMMEDIACY_REDUCTION.SIGNAL_DECAY,
      reason: 'current_signal_exists',
      details: decay,
    })
  }
  if (!decay.lastSignalSeasonKey) {
    return buildNotApplicableEvaluation({
      id: PLAYER_SCOUT_IMMEDIACY_REDUCTION.SIGNAL_DECAY,
      reason: 'no_historical_signal',
      details: decay,
    })
  }
  if (decay.seasonsWithoutSignal < 1) {
    return buildNoChangeEvaluation({
      id: PLAYER_SCOUT_IMMEDIACY_REDUCTION.SIGNAL_DECAY,
      reason: 'no_completed_decay_season',
      details: decay,
    })
  }

  return buildReductionEvaluation({
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

const resolveBoosts = evaluations => evaluations
  .filter(item => item.result === PLAYER_SCOUT_IMMEDIACY_EVALUATION_RESULT.BOOST)
  .map(item => ({
    id: item.id,
    points: item.points,
    details: item.details,
  }))

const resolveReductions = evaluations => evaluations
  .filter(item => item.result === PLAYER_SCOUT_IMMEDIACY_EVALUATION_RESULT.REDUCTION)
  .map(item => ({
    id: item.id,
    points: Math.abs(item.points),
    details: item.details,
  }))

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
  const positiveEvaluations = [
    buildEarlyAgeGroupEvaluation({
      immediacyContext,
      currentSeasonStatus,
    }),
    buildProfileCombinationEvaluation({
      profileCaseStrength,
      signals: safeSignals,
    }),
    buildIdealClubRangeEvaluation(metrics),
    buildIdealLeagueLevelEvaluation(immediacyContext),
    buildFutureLevelRiskEvaluation({
      futureCompetitionPath,
      currentSeasonKey,
      currentSeasonStatus,
    }),
    buildPlayingUpValidationEvaluation(safeSignals),
    buildProfilePersistenceEvaluation({
      signalPersistence,
      signals: safeSignals,
    }),
    buildCombinationPersistenceEvaluation({
      signalPersistence,
      combinations: safeCombinations,
    }),
  ]
  const evaluations = [
    ...positiveEvaluations,
    buildSignalDecayEvaluation({
      signalPersistence,
      source,
    }),
  ]
  const boosts = resolveBoosts(evaluations)
  const reductions = resolveReductions(evaluations)
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
    evaluations,
    signalPersistence,
  }
}
