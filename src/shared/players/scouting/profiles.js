// src/shared/players/scouting/profiles.js

import {
  SCOUT_INTEREST,
  SCOUT_LEVEL,
  SCOUT_REVIEW,
  SCOUT_WARNING,
  TEAM_FILTER,
} from './ids.js'

const DEP_LOW = 'low'
const DEP_MED = 'medium'
const DEP_HIGH = 'high'

const below = [SCOUT_LEVEL.BELOW]
const sameBelow = [SCOUT_LEVEL.SAME, SCOUT_LEVEL.BELOW]
const allLevels = [SCOUT_LEVEL.SAME, SCOUT_LEVEL.BELOW, SCOUT_LEVEL.ABOVE]

export const SCOUT_PROFILES = [
  {
    id: 'game_changer',
    label: 'משנה המשחק / סופר-סאב',
    group: 'all',
    interest: SCOUT_INTEREST.SUPER,
    searchLevels: allLevels,
    teamFilter: TEAM_FILTER.ANY,
    rules: [{ metric: 'subInPct', op: 'gte', value: 0.35, reason: 'high_sub_in_share' }],
    deps: { position: DEP_LOW, team: DEP_LOW, penalties: DEP_LOW },
  },
  {
    id: 'promoted_talent',
    label: 'הכישרון המוקפץ',
    group: 'all',
    interest: SCOUT_INTEREST.SUPER,
    searchLevels: below,
    teamFilter: TEAM_FILTER.ANY,
    rules: [{ metric: 'isYoungerAgeGroup', op: 'truthy', reason: 'younger_age_group' }],
    deps: { position: DEP_LOW, team: DEP_LOW, penalties: DEP_LOW },
  },
  {
    id: 'lineup_banker',
    label: 'באנקר הרכב',
    group: 'all',
    interest: SCOUT_INTEREST.INTERESTING,
    searchLevels: below,
    teamFilter: TEAM_FILTER.ANY_POSITIVE,
    rules: [
      { metric: 'startsPct', op: 'gte', value: 0.9, reason: 'near_full_starter' },
      { metric: 'subOut', op: 'eq', value: 0, reason: 'never_subbed_out' },
    ],
    deps: { position: DEP_LOW, team: DEP_MED, penalties: DEP_LOW },
    reviews: [SCOUT_REVIEW.FITNESS],
  },
  {
    id: 'last_station',
    label: 'התחנה האחרונה',
    group: 'defense_keeper',
    interest: SCOUT_INTEREST.INTERESTING,
    searchLevels: below,
    teamFilter: TEAM_FILTER.DEFENSE_POSITIVE,
    rules: [
      { metric: 'minutesPct', op: 'gte', value: 0.85, reason: 'very_high_minutes' },
      { metric: 'yellowCards', op: 'between', min: 0, max: 1, reason: 'very_low_cards' },
    ],
    deps: { position: DEP_HIGH, team: DEP_MED, penalties: DEP_LOW },
    reviews: [SCOUT_REVIEW.VIDEO_POSITION],
  },
  {
    id: 'back_threat',
    label: 'האיום מאחור',
    group: 'defense_keeper',
    interest: SCOUT_INTEREST.INTERESTING,
    searchLevels: below,
    teamFilter: TEAM_FILTER.DEFENSE_POSITIVE,
    rules: [{ metric: 'goals', op: 'gte', value: 5, reason: 'defensive_goal_threat' }],
    deps: { position: DEP_HIGH, team: DEP_MED, penalties: DEP_HIGH },
    warnings: [SCOUT_WARNING.ROLE_INFERENCE],
    reviews: [SCOUT_REVIEW.VIDEO_POSITION, SCOUT_REVIEW.PENALTIES],
  },
  {
    id: 'pro_anchor',
    label: 'העוגן המקצועי',
    group: 'defense_midfield',
    interest: SCOUT_INTEREST.INTERESTING,
    searchLevels: below,
    teamFilter: TEAM_FILTER.CLEAR_POSITIVE,
    rules: [{ metric: 'minutesPct', op: 'gte', value: 0.9, reason: 'max_minutes_load' }],
    deps: { position: DEP_MED, team: DEP_MED, penalties: DEP_LOW },
    reviews: [SCOUT_REVIEW.VIDEO_ROLE, SCOUT_REVIEW.FITNESS],
  },
  {
    id: 'single_engine',
    label: 'המנוע הבודד',
    group: 'midfield',
    interest: SCOUT_INTEREST.SUPER,
    searchLevels: below,
    teamFilter: TEAM_FILTER.ANY,
    rules: [
      { metric: 'goalsShareOfTeam', op: 'gte', value: 0.4, reason: 'high_team_goals_share' },
      { metric: 'startsPct', op: 'gte', value: 0.85, reason: 'max_starter_load' },
    ],
    deps: { position: DEP_HIGH, team: DEP_HIGH, penalties: DEP_HIGH },
    reviews: [SCOUT_REVIEW.VIDEO_ROLE, SCOUT_REVIEW.PENALTIES],
  },
  {
    id: 'clear_scorer',
    label: 'הסקורר המובהק',
    group: 'attack',
    interest: SCOUT_INTEREST.SUPER,
    searchLevels: below,
    teamFilter: TEAM_FILTER.ANY,
    rules: [{ metric: 'goals', op: 'gte', value: 10, reason: 'double_digit_goals' }],
    deps: { position: DEP_LOW, team: DEP_LOW, penalties: DEP_HIGH },
    reviews: [SCOUT_REVIEW.PENALTIES],
  },
  {
    id: 'killer_efficiency',
    label: 'ניצול מצבים קטלני',
    group: 'attack',
    interest: SCOUT_INTEREST.SUPER,
    searchLevels: sameBelow,
    teamFilter: TEAM_FILTER.ANY,
    rules: [
      { metric: 'goals', op: 'gte', value: 5, reason: 'enough_goal_sample' },
      { metric: 'goalsPer90', op: 'gte', value: 0.65, reason: 'elite_goals_per_90' },
    ],
    deps: { position: DEP_MED, team: DEP_LOW, penalties: DEP_HIGH },
    reviews: [SCOUT_REVIEW.PENALTIES],
  },
  {
    id: 'target_worker',
    label: 'חלוץ העבודה / שחקן המטרה',
    group: 'attack',
    interest: SCOUT_INTEREST.INTERESTING,
    searchLevels: below,
    teamFilter: TEAM_FILTER.ANY,
    rules: [
      { metric: 'goals', op: 'between', min: 5, max: 9, reason: 'medium_goal_output' },
      { metric: 'minutesPct', op: 'gte', value: 0.85, reason: 'max_minutes_load' },
    ],
    deps: { position: DEP_MED, team: DEP_LOW, penalties: DEP_MED },
    reviews: [SCOUT_REVIEW.VIDEO_ROLE],
  },
  {
    id: 'secondary_threat',
    label: 'האיום המשני',
    group: 'attack',
    interest: SCOUT_INTEREST.INTERESTING,
    searchLevels: sameBelow,
    teamFilter: TEAM_FILTER.ANY,
    rules: [{ metric: 'goals', op: 'between', min: 7, max: 9, reason: 'near_double_digit_goals' }],
    deps: { position: DEP_MED, team: DEP_LOW, penalties: DEP_MED },
  },
]
