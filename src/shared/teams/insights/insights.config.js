// src/shared/teams/insights/insights.config.js

export const TEAM_INSIGHTS_THRESHOLDS = {
  weakRatingBelow: 5.95,
  weakTvaBelow: -0.25,

  topRatingFrom: 6.25,
  topTvaFrom: 0.75,

  strongScoreFrom: 6.1,
  okScoreFrom: 6.0,
  weakScoreBelow: 5.95,

  positiveTvaFrom: 1,
  negativeTvaBelow: 0,

  warningDamageScore: 0.75,
  highDamageScore: 1.5,
  severeDamageScore: 2,

  minGroupMinutes: 90,
  minCheckedPlayers: 1,
}

export const TEAM_ROLE_RISK_RULES = {
  key: {
    info: 0,
    warning: 1,
    danger: 2,
  },

  core: {
    info: 1,
    warning: 2,
    danger: 3,
  },

  rotation: {
    info: 2,
    warning: 3,
    danger: 5,
  },

  fringe: {
    info: 2,
    warning: 4,
    danger: 5,
  },

  none: {
    info: 1,
    warning: 2,
    danger: 3,
  },
}

export const DEFAULT_RISK_RULES = {
  info: 1,
  warning: 2,
  danger: 4,
}

export const TEAM_QUALITY_TONES = {
  strong: 'success',
  ok: 'success',
  limited: 'neutral',
  weak: 'warning',
  bad: 'danger',
  noSample: 'neutral',
}

export const TEAM_RISK_TONES = {
  none: 'success',
  info: 'primary',
  warning: 'warning',
  danger: 'danger',
}
