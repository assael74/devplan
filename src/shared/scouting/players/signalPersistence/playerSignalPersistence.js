// src/shared/scouting/players/signalPersistence/playerSignalPersistence.js

import {
  SCOUT_PROFILE_COMBINATIONS,
} from '../combinations.js'

import {
  PLAYER_SIGNAL_PERSISTENCE,
} from './playerSignalPersistence.model.js'

const unique = (values = []) => [...new Set(values.filter(Boolean))]

const normalizeSeasonKey = value => String(value || '').trim()

const normalizeSeasonStatus = value => String(value || '').trim().toLowerCase()

const resolveSeasonOrder = (value = '') => {
  const seasonKey = normalizeSeasonKey(value)
  const match = seasonKey.match(/(?:^|[^0-9])(\d{2,4})\s*[\/_-]\s*(\d{2,4})(?:$|[^0-9])/)

  if (!match) return 0

  const first = Number(match[1])
  return first < 100 ? 2000 + first : first
}

const isCompletedSeason = summary => normalizeSeasonStatus(summary?.seasonStatus) === 'completed'

const getProfileIds = summary => new Set(
  Array.isArray(summary?.profileIds) ? summary.profileIds : []
)

const getNearProfileIds = summary => new Set(
  Array.isArray(summary?.nearProfileIds) ? summary.nearProfileIds : []
)

const hasAnySignal = summary => (
  getProfileIds(summary).size > 0 || getNearProfileIds(summary).size > 0
)

const hasCombination = (summary, combination = {}) => {
  const profileIds = getProfileIds(summary)

  return (combination.profileIds || []).every(profileId => profileIds.has(profileId))
}

const getSeasonOrder = summary => Number(summary?.seasonOrder) || resolveSeasonOrder(summary?.seasonKey)

const buildHistoricalContext = ({ playerTrajectory, currentSeasonKey }) => {
  const summaries = Array.isArray(playerTrajectory?.seasonSummaries)
    ? [...playerTrajectory.seasonSummaries]
    : []
  const normalizedCurrentSeasonKey = normalizeSeasonKey(currentSeasonKey)

  summaries.sort((a, b) => getSeasonOrder(a) - getSeasonOrder(b))

  const currentSummary = summaries.find(summary => (
    normalizeSeasonKey(summary.seasonKey) === normalizedCurrentSeasonKey
  ))
  const currentSeasonOrder = getSeasonOrder(currentSummary) || resolveSeasonOrder(currentSeasonKey)

  if (currentSeasonOrder) {
    return {
      currentSeasonOrder,
      historicalSummaries: summaries.filter(summary => getSeasonOrder(summary) < currentSeasonOrder),
    }
  }

  return {
    currentSeasonOrder: 0,
    historicalSummaries: summaries.filter(summary => {
      return normalizeSeasonKey(summary.seasonKey) !== normalizedCurrentSeasonKey
    }),
  }
}

const countConsecutiveProfileSeasons = ({
  profileId,
  historicalSummaries,
  currentSeasonOrder,
}) => {
  let seasons = 1
  let expectedSeasonOrder = currentSeasonOrder ? currentSeasonOrder - 1 : 0

  for (let index = historicalSummaries.length - 1; index >= 0; index -= 1) {
    const summary = historicalSummaries[index]
    const summarySeasonOrder = getSeasonOrder(summary)

    if (expectedSeasonOrder && summarySeasonOrder !== expectedSeasonOrder) break
    if (!getProfileIds(summary).has(profileId)) break

    seasons += 1
    if (expectedSeasonOrder) expectedSeasonOrder -= 1
  }

  return seasons
}

const resolveBestProfileRepeat = ({
  signals,
  historicalSummaries,
  currentSeasonOrder,
  excludedProfileIds = [],
}) => {
  const excludedIds = new Set(excludedProfileIds)

  return signals.reduce((best, signal) => {
    if (excludedIds.has(signal.profileId)) return best

    const seasons = countConsecutiveProfileSeasons({
      profileId: signal.profileId,
      historicalSummaries,
      currentSeasonOrder,
    })

    if (seasons <= best.seasons) return best

    return {
      profileId: signal.profileId,
      seasons,
    }
  }, {
    profileId: '',
    seasons: 0,
  })
}

const countConsecutiveCombinationSeasons = ({
  combination,
  historicalSummaries,
  currentSeasonOrder,
}) => {
  let seasons = 1
  let expectedSeasonOrder = currentSeasonOrder ? currentSeasonOrder - 1 : 0

  for (let index = historicalSummaries.length - 1; index >= 0; index -= 1) {
    const summary = historicalSummaries[index]
    const summarySeasonOrder = getSeasonOrder(summary)

    if (expectedSeasonOrder && summarySeasonOrder !== expectedSeasonOrder) break
    if (!hasCombination(summary, combination)) break

    seasons += 1
    if (expectedSeasonOrder) expectedSeasonOrder -= 1
  }

  return seasons
}

const resolveBestCombinationRepeat = ({
  combinations,
  historicalSummaries,
  currentSeasonOrder,
}) => {
  return combinations.reduce((best, currentCombination) => {
    const definition = SCOUT_PROFILE_COMBINATIONS.find(item => item.id === currentCombination.id)

    if (!definition) return best

    const seasons = countConsecutiveCombinationSeasons({
      combination: definition,
      historicalSummaries,
      currentSeasonOrder,
    })

    if (seasons <= best.seasons) return best

    return {
      combinationId: currentCombination.id,
      profileIds: definition.profileIds || [],
      seasons,
    }
  }, {
    combinationId: '',
    profileIds: [],
    seasons: 0,
  })
}

const getCurrentTrackedProfileIds = ({ signals, candidateSignals }) => {
  return new Set(unique([
    ...signals.map(signal => signal.profileId),
    ...candidateSignals.map(signal => signal.profileId),
  ]))
}

const resolveLastHistoricalSignal = historicalSummaries => {
  for (let index = historicalSummaries.length - 1; index >= 0; index -= 1) {
    const summary = historicalSummaries[index]
    const profileIds = unique([
      ...(summary.profileIds || []),
      ...(summary.nearProfileIds || []),
    ])

    if (profileIds.length) {
      return {
        index,
        seasonKey: summary.seasonKey || '',
        seasonOrder: getSeasonOrder(summary),
        profileIds,
      }
    }
  }

  return null
}

const countCompletedEmptySeasonsAfterSignal = ({ historicalSummaries, lastSignal }) => {
  let seasonsWithoutSignal = 0
  let expectedSeasonOrder = lastSignal.seasonOrder ? lastSignal.seasonOrder + 1 : 0

  for (let index = lastSignal.index + 1; index < historicalSummaries.length; index += 1) {
    const summary = historicalSummaries[index]
    const summarySeasonOrder = getSeasonOrder(summary)

    if (expectedSeasonOrder && summarySeasonOrder !== expectedSeasonOrder) break
    if (hasAnySignal(summary)) break
    if (!isCompletedSeason(summary)) break

    seasonsWithoutSignal += 1
    if (expectedSeasonOrder) expectedSeasonOrder += 1
  }

  return {
    seasonsWithoutSignal,
    nextExpectedSeasonOrder: expectedSeasonOrder,
  }
}

const resolveDecay = ({
  historicalSummaries,
  currentTrackedProfileIds,
  currentSeasonKey,
  currentSeasonOrder,
  currentSeasonStatus,
}) => {
  if (currentTrackedProfileIds.size > 0) {
    return {
      seasonsWithoutSignal: 0,
      profileIds: [],
      lastSignalSeasonKey: '',
      currentSeasonKey,
      currentSeasonCounted: false,
    }
  }

  const lastSignal = resolveLastHistoricalSignal(historicalSummaries)

  if (!lastSignal) {
    return {
      seasonsWithoutSignal: 0,
      profileIds: [],
      lastSignalSeasonKey: '',
      currentSeasonKey,
      currentSeasonCounted: false,
    }
  }

  const historicalGap = countCompletedEmptySeasonsAfterSignal({
    historicalSummaries,
    lastSignal,
  })
  const currentCanContinueSequence = (
    currentSeasonOrder > 0 &&
    historicalGap.nextExpectedSeasonOrder > 0 &&
    currentSeasonOrder === historicalGap.nextExpectedSeasonOrder
  )
  const currentSeasonCounted = (
    currentCanContinueSequence &&
    normalizeSeasonStatus(currentSeasonStatus) === 'completed'
  )
  const seasonsWithoutSignal = (
    historicalGap.seasonsWithoutSignal +
    (currentSeasonCounted ? 1 : 0)
  )

  return {
    seasonsWithoutSignal,
    profileIds: lastSignal.profileIds,
    lastSignalSeasonKey: lastSignal.seasonKey,
    currentSeasonKey,
    currentSeasonCounted,
  }
}

export const buildPlayerSignalPersistence = ({
  signals = [],
  candidateSignals = [],
  combinations = [],
  playerTrajectory = null,
  currentSeasonKey = '',
  currentSeasonStatus = '',
} = {}) => {
  const safeSignals = Array.isArray(signals) ? signals : []
  const safeCandidateSignals = Array.isArray(candidateSignals) ? candidateSignals : []
  const safeCombinations = Array.isArray(combinations) ? combinations : []
  const historicalContext = buildHistoricalContext({
    playerTrajectory,
    currentSeasonKey,
  })
  const combinationRepeat = resolveBestCombinationRepeat({
    combinations: safeCombinations,
    historicalSummaries: historicalContext.historicalSummaries,
    currentSeasonOrder: historicalContext.currentSeasonOrder,
  })
  const repeatedCombinationProfileIds = combinationRepeat.seasons >= 2
    ? combinationRepeat.profileIds
    : []
  const profileRepeat = resolveBestProfileRepeat({
    signals: safeSignals,
    historicalSummaries: historicalContext.historicalSummaries,
    currentSeasonOrder: historicalContext.currentSeasonOrder,
    excludedProfileIds: repeatedCombinationProfileIds,
  })
  const decay = resolveDecay({
    historicalSummaries: historicalContext.historicalSummaries,
    currentTrackedProfileIds: getCurrentTrackedProfileIds({
      signals: safeSignals,
      candidateSignals: safeCandidateSignals,
    }),
    currentSeasonKey,
    currentSeasonOrder: historicalContext.currentSeasonOrder,
    currentSeasonStatus,
  })
  const reasons = []

  if (profileRepeat.seasons >= 3) {
    reasons.push(PLAYER_SIGNAL_PERSISTENCE.PROFILE_REPEAT_3_PLUS)
  } else if (profileRepeat.seasons === 2) {
    reasons.push(PLAYER_SIGNAL_PERSISTENCE.PROFILE_REPEAT_2)
  }

  if (combinationRepeat.seasons >= 3) {
    reasons.push(PLAYER_SIGNAL_PERSISTENCE.COMBINATION_REPEAT_3_PLUS)
  } else if (combinationRepeat.seasons === 2) {
    reasons.push(PLAYER_SIGNAL_PERSISTENCE.COMBINATION_REPEAT_2)
  }

  if (decay.seasonsWithoutSignal >= 2) {
    reasons.push(PLAYER_SIGNAL_PERSISTENCE.DECAY_2_PLUS)
  } else if (decay.seasonsWithoutSignal === 1) {
    reasons.push(PLAYER_SIGNAL_PERSISTENCE.DECAY_1)
  }

  return {
    profileRepeat,
    combinationRepeat,
    decay,
    reasons,
  }
}
