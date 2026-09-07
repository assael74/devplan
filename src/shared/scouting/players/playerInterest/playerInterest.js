import { SCOUT_PROFILE_COMBINATIONS } from '../combinations.js'
import { PLAYER_INTEREST_LEVEL, PLAYER_INTEREST_REASON } from './playerInterest.model.js'

const clean = value => String(value || '').trim()

const resolveSeasonOrder = value => {
  const match = clean(value).match(/(?:^|[^0-9])(\d{2,4})\s*[\/_-]\s*(\d{2,4})(?:$|[^0-9])/)
  if (!match) return 0
  const first = Number(match[1])
  return first < 100 ? first + 2000 : first
}

const getProfileIds = value => new Set(
  (Array.isArray(value?.profileIds) ? value.profileIds : [])
    .map(profileId => clean(profileId))
    .filter(Boolean)
)

const hasSharedProfile = (first, second) => [...first].some(profileId => second.has(profileId))

const isConsecutive = (previous, current) => {
  const previousOrder = Number(previous?.seasonOrder) || resolveSeasonOrder(previous?.seasonKey)
  const currentOrder = Number(current?.seasonOrder) || resolveSeasonOrder(current?.seasonKey)
  return !previousOrder || !currentOrder || currentOrder === previousOrder + 1
}

const getHistoricalSummaries = ({ playerTrajectory, currentSeasonKey }) => {
  const currentOrder = resolveSeasonOrder(currentSeasonKey)

  return (Array.isArray(playerTrajectory?.seasonSummaries) ? playerTrajectory.seasonSummaries : [])
    .filter(summary => {
      const summaryOrder = Number(summary?.seasonOrder) || resolveSeasonOrder(summary?.seasonKey)
      return currentOrder ? summaryOrder < currentOrder : clean(summary?.seasonKey) !== clean(currentSeasonKey)
    })
    .slice()
    .sort((left, right) => (
      (Number(left?.seasonOrder) || resolveSeasonOrder(left?.seasonKey)) -
      (Number(right?.seasonOrder) || resolveSeasonOrder(right?.seasonKey))
    ))
}

const resolveCombination = ({ currentCombinations, lastHistoricalSummary }) => {
  const current = Array.isArray(currentCombinations) ? currentCombinations[0] : null
  if (current?.id) return { combination: current, source: 'current' }

  const profileIds = getProfileIds(lastHistoricalSummary)
  const historical = SCOUT_PROFILE_COMBINATIONS.find(combination => (
    (combination.profileIds || []).every(profileId => profileIds.has(profileId))
  ))
  return historical ? { combination: historical, source: 'historical' } : null
}

const getProfileDepth = profile => {
  const value = profile?.profileStrength?.depthPct ?? profile?.strength?.depthPct ?? profile?.depthPct
  const depth = Number(value)
  return Number.isFinite(depth) ? depth : null
}

const hasCurrentCombinationDepth = ({ signals, combination }) => {
  const profileIds = new Set(combination?.profileIds || [])
  return (Array.isArray(signals) ? signals : []).some(signal => (
    profileIds.has(clean(signal?.profileId)) && getProfileDepth(signal) >= 50
  ))
}

const hasHistoricalCombinationDepth = ({ playerSeasonStints, summary, combination }) => {
  const profileIds = new Set(combination?.profileIds || [])
  const seasonKey = clean(summary?.seasonKey)

  return (Array.isArray(playerSeasonStints) ? playerSeasonStints : []).some(stint => {
    if (clean(stint?.seasonKey || stint?.season) !== seasonKey) return false
    return (Array.isArray(stint?.scoutProfiles) ? stint.scoutProfiles : []).some(profile => (
      profileIds.has(clean(profile?.profileId || profile?.id)) && getProfileDepth(profile) >= 50
    ))
  })
}

const buildFactor = ({ id, points, active, details = {} }) => ({
  id,
  points: active ? points : 0,
  active,
  details,
})

const resolveInterestLevel = score => {
  if (score >= 5) return PLAYER_INTEREST_LEVEL.SUPER_INTERESTING
  if (score >= 3) return PLAYER_INTEREST_LEVEL.INTERESTING
  if (score === 2) return PLAYER_INTEREST_LEVEL.CURIOUS
  return PLAYER_INTEREST_LEVEL.REASONABLE
}

export const buildPlayerInterest = ({
  signals = [],
  combinations = [],
  opportunity = null,
  playerTrajectory = null,
  playerSeasonStints = [],
  currentSeasonKey = '',
} = {}) => {
  const safeSignals = Array.isArray(signals) ? signals : []
  const currentProfileIds = new Set(safeSignals.map(signal => clean(signal?.profileId)).filter(Boolean))
  const historicalSummaries = getHistoricalSummaries({ playerTrajectory, currentSeasonKey })
  const lastHistoricalSummary = historicalSummaries[historicalSummaries.length - 1] || null
  const previousHistoricalSummary = historicalSummaries[historicalSummaries.length - 2] || null
  const lastHistoricalProfileIds = getProfileIds(lastHistoricalSummary)
  const previousHistoricalProfileIds = getProfileIds(previousHistoricalSummary)
  const automaticImmediacy = clean(opportunity?.automaticActionStatus)
  const immediacyPoints = automaticImmediacy === 'immediate' ? 3 : automaticImmediacy === 'priority' ? 2 : 0
  const currentProfilePersistence = Boolean(lastHistoricalSummary) &&
    isConsecutive(lastHistoricalSummary, { seasonKey: currentSeasonKey }) &&
    hasSharedProfile(currentProfileIds, lastHistoricalProfileIds)
  const historicalProfilePersistence = Boolean(lastHistoricalSummary && previousHistoricalSummary) &&
    isConsecutive(previousHistoricalSummary, lastHistoricalSummary) &&
    hasSharedProfile(lastHistoricalProfileIds, previousHistoricalProfileIds)
  const matchedCombination = resolveCombination({ currentCombinations: combinations, lastHistoricalSummary })
  const combinationDepth = matchedCombination?.source === 'current'
    ? hasCurrentCombinationDepth({ signals: safeSignals, combination: matchedCombination.combination })
    : hasHistoricalCombinationDepth({ playerSeasonStints, summary: lastHistoricalSummary, combination: matchedCombination?.combination })
  const factors = [
    buildFactor({ id: PLAYER_INTEREST_REASON.IMMEDIACY, points: immediacyPoints, active: immediacyPoints > 0, details: { status: automaticImmediacy } }),
    buildFactor({ id: PLAYER_INTEREST_REASON.CURRENT_PROFILE_PERSISTENCE, points: 2, active: currentProfilePersistence, details: { seasonKey: clean(currentSeasonKey), comparedSeasonKey: clean(lastHistoricalSummary?.seasonKey) } }),
    buildFactor({ id: PLAYER_INTEREST_REASON.HISTORICAL_PROFILE_PERSISTENCE, points: 1, active: historicalProfilePersistence, details: { seasonKey: clean(lastHistoricalSummary?.seasonKey), comparedSeasonKey: clean(previousHistoricalSummary?.seasonKey) } }),
    buildFactor({ id: PLAYER_INTEREST_REASON.PROFILE_COMBINATION, points: 1, active: Boolean(matchedCombination), details: { combinationId: clean(matchedCombination?.combination?.id), source: matchedCombination?.source || '' } }),
    buildFactor({ id: PLAYER_INTEREST_REASON.COMBINATION_PROFILE_DEPTH, points: 1, active: Boolean(matchedCombination) && combinationDepth, details: { combinationId: clean(matchedCombination?.combination?.id), source: matchedCombination?.source || '' } }),
  ]
  const score = factors.reduce((total, factor) => total + factor.points, 0)

  return {
    assessmentScope: 'player_career',
    interestLevel: resolveInterestLevel(score),
    score,
    maxScore: 8,
    factors,
    reasons: factors.filter(factor => factor.active).map(factor => factor.id),
    limitingFactors: [],
    upgradeConditions: [],
  }
}
