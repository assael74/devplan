// src/shared/scouting/players/combinations.js

export const SCOUT_PROFILE_COMBINATIONS = [
  {
    id: 'elite_finisher',
    idIcon: 'elite',
    label: 'מסיים עילית',
    group: 'attack',
    description: 'שילוב של סקורר ומנצל כל דקה על המגרש',
    profileIds: ['clear_scorer', 'killer_efficiency'],
  },
  {
    id: 'promoted_attacking_support',
    idIcon: 'promotedTalent',
    label: 'כישרון מוקפץ תומך',
    group: 'development_attack',
    description: 'שחקן צעיר מהשנתון שמקבל תפקיד התקפי תומך משמעותי',
    profileIds: ['promoted_talent', 'attacking_support'],
  },
]

export const buildScoutProfileCombinations = ({
  signals = [],
  combinations = SCOUT_PROFILE_COMBINATIONS,
} = {}) => {
  const signalIds = new Set(
    (Array.isArray(signals) ? signals : [])
      .map(signal => signal.profileId)
      .filter(Boolean)
  )

  return (Array.isArray(combinations) ? combinations : [])
    .filter(combination => (
      (combination.profileIds || []).every(profileId => signalIds.has(profileId))
    ))
    .map(combination => ({
      ...combination,
      matchedProfileIds: combination.profileIds || [],
    }))
}
