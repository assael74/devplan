// src/shared/scouting/players/evidence/playerScoutEvidence.js

export const PLAYER_SCOUT_EVIDENCE_ID = Object.freeze({
  HIGH_MINUTES_USAGE: 'high_minutes_usage',
  HIGH_STARTING_USAGE: 'high_starting_usage',
  FULL_MATCH_RETENTION: 'full_match_retention',
  HIGH_TEAM_GOAL_SHARE: 'high_team_goal_share',
})

const toFiniteNumber = value => {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const buildEvidence = ({
  id,
  category,
  metric,
  value,
  op,
  threshold,
} = {}) => ({
  id,
  category,
  metric,
  value,
  op,
  threshold,
})

export const buildPlayerScoutEvidence = ({ metrics = {} } = {}) => {
  const minutesPct = toFiniteNumber(metrics.minutesPct)
  const startsPct = toFiniteNumber(metrics.startsPct)
  const subOut = toFiniteNumber(metrics.subOut)
  const starts = toFiniteNumber(metrics.starts)
  const goalsShareOfTeam = toFiniteNumber(metrics.goalsShareOfTeam)
  const evidence = []

  if (Number.isFinite(minutesPct) && minutesPct >= 0.9) {
    evidence.push(buildEvidence({
      id: PLAYER_SCOUT_EVIDENCE_ID.HIGH_MINUTES_USAGE,
      category: 'usage',
      metric: 'minutesPct',
      value: minutesPct,
      op: 'gte',
      threshold: 0.9,
    }))
  }

  if (Number.isFinite(startsPct) && startsPct >= 0.9) {
    evidence.push(buildEvidence({
      id: PLAYER_SCOUT_EVIDENCE_ID.HIGH_STARTING_USAGE,
      category: 'usage',
      metric: 'startsPct',
      value: startsPct,
      op: 'gte',
      threshold: 0.9,
    }))
  }

  if (
    Number.isFinite(subOut) &&
    subOut === 0 &&
    Number.isFinite(starts) &&
    starts > 0
  ) {
    evidence.push(buildEvidence({
      id: PLAYER_SCOUT_EVIDENCE_ID.FULL_MATCH_RETENTION,
      category: 'usage',
      metric: 'subOut',
      value: subOut,
      op: 'eq',
      threshold: 0,
    }))
  }

  if (Number.isFinite(goalsShareOfTeam) && goalsShareOfTeam >= 0.4) {
    evidence.push(buildEvidence({
      id: PLAYER_SCOUT_EVIDENCE_ID.HIGH_TEAM_GOAL_SHARE,
      category: 'production_context',
      metric: 'goalsShareOfTeam',
      value: goalsShareOfTeam,
      op: 'gte',
      threshold: 0.4,
    }))
  }

  return evidence
}
