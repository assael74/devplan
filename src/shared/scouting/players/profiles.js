// src/shared/scouting/players/profiles.js

import {
  SCOUT_LEVEL,
  SCOUT_PROFILE_IDENTITY,
  SCOUT_REVIEW,
  SCOUT_WARNING,
  TEAM_FILTER,
} from './ids.js'

const DEP_LOW = 'low'
const DEP_MED = 'medium'
const DEP_HIGH = 'high'

// Calibration candidate only. Backtest must run before this threshold is treated as final.
export const PRELIMINARY_LOW_OUTPUT_MINUTES_PCT_CANDIDATE = 0.8

const sameBelow = [
  SCOUT_LEVEL.SAME,
  SCOUT_LEVEL.BELOW,
]

const clean = value => String(value || '').trim()

const PROFESSIONAL_PROFILE_IDENTITIES = new Set([
  SCOUT_PROFILE_IDENTITY.CORE,
  SCOUT_PROFILE_IDENTITY.OPPORTUNITY,
])

export const SCOUT_PROFILES = [
  {
    id: 'clear_scorer',
    idIcon: 'clearScorer',
    label: 'הסקורר המובהק',
    shortLabel: 'סקורר',
    group: 'attack',
    profileIdentity: SCOUT_PROFILE_IDENTITY.CORE,
    searchLevels: sameBelow,
    teamFilter: TEAM_FILTER.ANY,
    rules: [
      {
        metric: 'goals',
        op: 'gte',
        value: 15,
        reason: 'elite_goal_total',
      },
    ],
    deps: {
      position: DEP_LOW,
      team: DEP_LOW,
    },
  },
  {
    id: 'killer_efficiency',
    idIcon: 'killerEfficiency',
    label: 'ניצול מצבים קטלני',
    shortLabel: 'סקורר יעיל',
    group: 'attack',
    profileIdentity: SCOUT_PROFILE_IDENTITY.CORE,
    searchLevels: sameBelow,
    teamFilter: TEAM_FILTER.ATTACK_POSITIVE_OR_GOALS_GTE_10,
    rules: [
      {
        metric: 'minutes',
        op: 'gte',
        value: 600,
        reason: 'minimum_minutes_sample',
      },
      {
        metric: 'goals',
        op: 'gte',
        value: 5,
        reason: 'enough_goal_sample',
      },
      {
        metric: 'goalsPerGameDuration',
        op: 'gte',
        value: 0.65,
        distancePrecision: 2,
        reason: 'elite_goals_per_game_duration',
      },
    ],
    deps: {
      position: DEP_MED,
      team: DEP_LOW,
    },
  },
  {
    id: 'preliminary_low_output',
    idIcon: 'preliminaryLowOutput',
    label: 'שימוש גבוה · תפוקה נמוכה',
    shortLabel: 'מחפש זהות',
    group: 'all',
    profileIdentity: SCOUT_PROFILE_IDENTITY.PRELIMINARY,
    searchLevels: sameBelow,
    teamFilter: TEAM_FILTER.ANY_POSITIVE,
    openContext: {
      leagueLevelMax: 2,
      clubStrengthLevelMax: 2,
    },
    rules: [
      {
        metric: 'minutesPct',
        op: 'gte',
        value: PRELIMINARY_LOW_OUTPUT_MINUTES_PCT_CANDIDATE,
        reason: 'significant_minutes_low_output_candidate',
      },
      {
        metric: 'goals',
        op: 'lte',
        value: 2,
        reason: 'low_goal_output',
      },
    ],
    deps: {
      position: DEP_HIGH,
      team: DEP_MED,
    },
    warnings: [SCOUT_WARNING.POSITION_MISSING],
    reviews: [SCOUT_REVIEW.VIDEO_POSITION],
  },
  {
    id: 'last_station',
    idIcon: 'lastStation',
    label: 'התחנה האחרונה',
    shortLabel: 'תחנה אחרונה',
    group: 'defense_keeper',
    profileIdentity: SCOUT_PROFILE_IDENTITY.CORE,
    reclassificationOnly: true,
    sourcePreliminaryProfileId: 'preliminary_low_output',
    searchLevels: sameBelow,
    teamFilter: TEAM_FILTER.DEFENSE_POSITIVE,
    positionContext: 'defense_midfield',
    rules: [],
    deps: {
      position: DEP_HIGH,
      team: DEP_MED,
    },
    reviews: [SCOUT_REVIEW.VIDEO_POSITION],
  },
  {
    id: 'attacking_support',
    idIcon: 'attackingSupport',
    label: 'תמיכה התקפית',
    shortLabel: 'תמיכה התקפית',
    group: 'attack',
    profileIdentity: SCOUT_PROFILE_IDENTITY.CORE,
    reclassificationOnly: true,
    sourcePreliminaryProfileId: 'preliminary_low_output',
    searchLevels: sameBelow,
    teamFilter: TEAM_FILTER.ANY_POSITIVE,
    positionContext: 'attacking_support',
    rules: [],
    deps: {
      position: DEP_HIGH,
      team: DEP_MED,
    },
    reviews: [SCOUT_REVIEW.VIDEO_POSITION],
  },
  {
    id: 'back_threat',
    idIcon: 'backThreat',
    label: 'האיום מאחור',
    shortLabel: 'איום מאחור',
    group: 'defense_keeper',
    profileIdentity: SCOUT_PROFILE_IDENTITY.CORE,
    searchLevels: sameBelow,
    teamFilter: TEAM_FILTER.DEFENSE_POSITIVE,
    positionContext: 'defense_midfield',
    rules: [
      {
        metric: 'goals',
        op: 'between',
        min: 3,
        max: 5,
        depthDirection: 'higher',
        reason: 'defensive_goal_threat',
      },
      {
        metric: 'minutesPct',
        op: 'gte',
        value: 0.7,
        reason: 'high_minutes_share',
      },
    ],
    deps: {
      position: DEP_HIGH,
      team: DEP_MED,
    },
    warnings: [SCOUT_WARNING.ROLE_INFERENCE],
    reviews: [SCOUT_REVIEW.VIDEO_POSITION],
  },
  {
    id: 'promoted_talent',
    idIcon: 'promotedTalent',
    label: 'הכישרון המוקפץ',
    shortLabel: 'כישרון מוקפץ',
    group: 'all',
    profileIdentity: SCOUT_PROFILE_IDENTITY.CORE,
    searchLevels: sameBelow,
    teamFilter: TEAM_FILTER.ANY,
    rules: [
      {
        metric: 'isYoungerAgeGroup',
        op: 'truthy',
        reason: 'younger_age_group',
      },
      {
        metric: 'games',
        op: 'gte',
        value: 3,
        reason: 'minimum_games_sample',
      },
    ],
    deps: {
      position: DEP_LOW,
      team: DEP_LOW,
    },
  },
  {
    id: 'secondary_threat',
    idIcon: 'secondaryThreat',
    label: 'האיום המשני',
    shortLabel: 'איום משני',
    group: 'attack',
    profileIdentity: SCOUT_PROFILE_IDENTITY.CORE,
    searchLevels: sameBelow,
    teamFilter: TEAM_FILTER.ANY,
    rules: [
      {
        metric: 'goals',
        op: 'between',
        min: 6,
        max: 9,
        depthDirection: 'higher',
        reason: 'near_double_digit_goals',
      },
    ],
    deps: {
      position: DEP_MED,
      team: DEP_LOW,
    },
  },
  {
    id: 'double_digit_threat',
    idIcon: 'doubleDigitThreat',
    label: 'תפוקה דו־ספרתית',
    shortLabel: 'דו־ספרתי',
    group: 'attack',
    profileIdentity: SCOUT_PROFILE_IDENTITY.CORE,
    searchLevels: sameBelow,
    teamFilter: TEAM_FILTER.ATTACK_POSITIVE_OR_GOALS_GTE_10,
    rules: [
      {
        metric: 'goals',
        op: 'between',
        min: 10,
        max: 14,
        depthDirection: 'higher',
        reason: 'double_digit_goal_output',
      },
    ],
    deps: {
      position: DEP_LOW,
      team: DEP_LOW,
    },
  },
  {
    id: 'underused_prospect',
    idIcon: 'underusedProspect',
    label: 'שחקן איכותי שלא מקבל הזדמנות',
    shortLabel: 'לא מנוצל',
    group: 'opportunity',
    profileIdentity: SCOUT_PROFILE_IDENTITY.OPPORTUNITY,
    searchLevels: sameBelow,
    teamFilter: TEAM_FILTER.ANY,
    rules: [
      {
        metric: 'topClubOpportunityEligible',
        op: 'truthy',
        reason: 'top_club_or_level_two_first_team',
      },
      {
        metric: 'minutesPct',
        op: 'between',
        min: 0.05,
        max: 0.15,
        reason: 'low_minutes_share',
      },
      {
        metric: 'isYoungerAgeGroup',
        op: 'falsy',
        reason: 'not_younger_age_group',
      },
    ],
    deps: {
      position: DEP_MED,
      team: DEP_LOW,
    },
  },
  {
    id: 'blocked_top_team',
    idIcon: 'blockedTopTeam',
    label: 'שחקן איכותי שלא מצליח לפרוץ',
    shortLabel: 'טרם פרץ',
    group: 'opportunity',
    profileIdentity: SCOUT_PROFILE_IDENTITY.OPPORTUNITY,
    searchLevels: sameBelow,
    teamFilter: TEAM_FILTER.ANY_POSITIVE,
    rules: [
      {
        metric: 'games',
        op: 'gte',
        value: 10,
        reason: 'many_appearances',
      },
      {
        metric: 'minutesPerGame',
        op: 'lte',
        value: 25,
        reason: 'low_minutes_per_appearance',
      },
      {
        metric: 'subIn',
        op: 'gte',
        value: 6,
        reason: 'frequent_substitute_in',
      },
      {
        metric: 'starts',
        op: 'lte',
        value: 3,
        reason: 'few_starts',
      },
    ],
    deps: {
      position: DEP_LOW,
      team: DEP_MED,
    },
  },
]

export const resolveScoutProfileDefinition = profile => {
  const profileId = clean(
    typeof profile === 'string'
      ? profile
      : profile?.profileId || profile?.id
  )

  return SCOUT_PROFILES.find(item => clean(item.id) === profileId) || null
}

export const resolveScoutProfileIdentity = profile => {
  const explicitIdentity = clean(
    typeof profile === 'object'
      ? profile?.profileIdentity || profile?.identity
      : ''
  )
  if (explicitIdentity) return explicitIdentity

  const definition = resolveScoutProfileDefinition(profile)
  return clean(definition?.profileIdentity)
}

export const isProfessionalScoutProfile = profile => {
  if (typeof profile?.isProfessional === 'boolean') {
    return profile.isProfessional
  }

  const definition = resolveScoutProfileDefinition(profile)
  if (typeof definition?.isProfessional === 'boolean') {
    return definition.isProfessional
  }

  return PROFESSIONAL_PROFILE_IDENTITIES.has(
    resolveScoutProfileIdentity(profile)
  )
}
