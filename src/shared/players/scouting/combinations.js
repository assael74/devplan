// src/shared/players/scouting/combinations.js

export const SCOUT_PROFILE_COMBINATIONS = [
  {
    id: 'elite_finisher',
    label: 'מסיים עילית',
    profileIds: ['clear_scorer', 'killer_efficiency'],
  },
  {
    id: 'stable_attacking_starter',
    label: 'שחקן הרכב עם תרומה התקפית יציבה',
    profileIds: ['secondary_threat', 'lineup_banker'],
  },
  {
    id: 'stable_defensive_core',
    label: 'שחקן הגנתי מרכזי ויציב',
    profileIds: ['last_station', 'pro_anchor'],
  },
  {
    id: 'two_way_defensive_threat',
    label: 'שחקן הגנה בעל תרומה התקפית ויציבות',
    profileIds: ['back_threat', 'pro_anchor'],
  },
  {
    id: 'restricted_role',
    label: 'שחקן איכותי בתפקיד מוגבל',
    profileIds: ['underused_prospect', 'blocked_top_team'],
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
    .filter(combination =>
      (combination.profileIds || []).every(profileId => signalIds.has(profileId))
    )
    .map(combination => ({
      ...combination,
      matchedProfileIds: combination.profileIds || [],
    }))
}
