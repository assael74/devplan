// src/shared/scouting/players/profileHierarchy/playerProfileRelationships.js

const GOAL_OUTPUT_LADDER = [
  'secondary_threat',
  'double_digit_threat',
  'clear_scorer',
]

const GOAL_OUTPUT_RANK = new Map(
  GOAL_OUTPUT_LADDER.map((profileId, index) => [profileId, index + 1])
)

export const PLAYER_PROFILE_RELATIONSHIP_FAMILY = Object.freeze({
  GOAL_OUTPUT: 'goal_output',
})

export const PLAYER_PROFILE_RELATIONSHIPS = Object.freeze({
  [PLAYER_PROFILE_RELATIONSHIP_FAMILY.GOAL_OUTPUT]: Object.freeze({
    type: 'exclusive_ladder',
    profileIds: Object.freeze([...GOAL_OUTPUT_LADDER]),
  }),
})

const cleanProfileId = signal => String(signal?.profileId || signal?.id || '').trim()

const resolveGoalOutputWinnerId = signals => {
  return (Array.isArray(signals) ? signals : []).reduce((winnerId, signal) => {
    const profileId = cleanProfileId(signal)
    const rank = GOAL_OUTPUT_RANK.get(profileId) || 0
    const winnerRank = GOAL_OUTPUT_RANK.get(winnerId) || 0

    return rank > winnerRank ? profileId : winnerId
  }, '')
}

export const resolvePlayerProfileRelationships = ({ signals = [] } = {}) => {
  const safeSignals = Array.isArray(signals) ? signals : []
  const goalOutputWinnerId = resolveGoalOutputWinnerId(safeSignals)
  const suppressedProfileIds = safeSignals
    .map(cleanProfileId)
    .filter(profileId => (
      GOAL_OUTPUT_RANK.has(profileId) &&
      profileId !== goalOutputWinnerId
    ))
  const suppressedProfileIdSet = new Set(suppressedProfileIds)

  return {
    activeSignals: safeSignals.filter(signal => (
      !suppressedProfileIdSet.has(cleanProfileId(signal))
    )),
    suppressedProfileIds: [...new Set(suppressedProfileIds)],
    exclusiveFamilyWinners: {
      [PLAYER_PROFILE_RELATIONSHIP_FAMILY.GOAL_OUTPUT]: goalOutputWinnerId,
    },
  }
}
