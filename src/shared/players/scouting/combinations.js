// src/shared/players/scouting/combinations.js

import {
  SCOUT_INTEREST,
} from './ids.js'

export const SCOUT_PROFILE_COMBINATIONS = [
  {
    id: 'elite_finisher',
    idIcon: 'elite',
    label: 'מסיים עילית',
    group: 'attack',
    description: 'שילוב של סקורר ומנצל כל דקה על המגרש',
    interest: SCOUT_INTEREST.SUPER,
    profileIds: ['clear_scorer', 'killer_efficiency'],
  },
  {
    id: 'stable_attacking_starter',
    idIcon: 'secondaryThreat',
    label: 'שחקן התקפה יציב',
    group: 'attack',
    description: 'שילוב של שחקן קבוע בהרכב וספק מספרים משני',
    interest: SCOUT_INTEREST.SUPER,
    profileIds: ['secondary_threat', 'lineup_banker'],
  },
  {
    id: 'two_way_defensive_threat',
    idIcon: 'backThreat',
    label: 'הגנה ומספרים',
    group: 'defense_midfield',
    description: 'שילוב של שחקן הגנה קבוע בהרכב ועם תרומה התקפית של מספרים',
    interest: SCOUT_INTEREST.SUPER,
    profileIds: ['back_threat', 'pro_anchor'],
  },
  {
    id: 'restricted_role',
    idIcon: 'blockedTopTeam',
    label: 'שחקן שלא נספר',
    group: 'all',
    interest: SCOUT_INTEREST.SUPER,
    description: 'שילוב של שחקן שנכנס כחילוף קבוע ומקבל מעט דקות',
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
