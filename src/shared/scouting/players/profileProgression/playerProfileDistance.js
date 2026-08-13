// src/shared/scouting/players/profileProgression/playerProfileDistance.js

import {
  PROFILE_DISTANCE_STATUS,
  PROFILE_DISTANCE_THRESHOLD,
  PROFILE_DISTANCE_TREND,
} from './playerProfileProgression.model.js'

const toFiniteNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const clamp01 = (value) => Math.max(0, Math.min(1, value))

const getGteDistance = ({ value, rule }) => {
  const current = toFiniteNumber(value)
  const target = toFiniteNumber(rule.value)

  if (!Number.isFinite(current) || !Number.isFinite(target) || target <= 0) {
    return {
      trackable: false,
      matched: false,
      distance: null,
    }
  }

  if (current >= target) {
    return {
      trackable: true,
      matched: true,
      distance: 0,
    }
  }

  return {
    trackable: true,
    matched: false,
    distance: clamp01((target - current) / target),
  }
}

const getBetweenDistance = ({ value, rule }) => {
  const current = toFiniteNumber(value)
  const min = toFiniteNumber(rule.min)
  const max = toFiniteNumber(rule.max)

  if (!Number.isFinite(current) || !Number.isFinite(min) || !Number.isFinite(max)) {
    return {
      trackable: false,
      matched: false,
      distance: null,
    }
  }

  if (current >= min && current <= max) {
    return {
      trackable: true,
      matched: true,
      distance: 0,
    }
  }

  if (current < min && min > 0) {
    return {
      trackable: true,
      matched: false,
      distance: clamp01((min - current) / min),
    }
  }

  return {
    trackable: false,
    matched: false,
    distance: null,
  }
}

const getHardRuleDistance = ({ value, rule }) => {
  if (rule.op === 'truthy') {
    return {
      trackable: false,
      matched: Boolean(value),
      distance: Boolean(value) ? 0 : null,
    }
  }

  if (rule.op === 'falsy') {
    return {
      trackable: false,
      matched: !Boolean(value),
      distance: !Boolean(value) ? 0 : null,
    }
  }

  if (rule.op === 'eq') {
    const current = toFiniteNumber(value)
    const target = toFiniteNumber(rule.value)
    const matched = value === rule.value || (
      Number.isFinite(current) &&
      Number.isFinite(target) &&
      current === target
    )

    return {
      trackable: false,
      matched,
      distance: matched ? 0 : null,
    }
  }

  if (rule.op === 'lte' || rule.op === 'lt') {
    const current = toFiniteNumber(value)
    const target = toFiniteNumber(rule.value)
    const matched = Number.isFinite(current) && Number.isFinite(target)
      ? rule.op === 'lte' ? current <= target : current < target
      : false

    return {
      trackable: false,
      matched,
      distance: matched ? 0 : null,
    }
  }

  return {
    trackable: false,
    matched: false,
    distance: null,
  }
}

const getRuleDistance = ({ value, rule }) => {
  if (rule.op === 'gte' || rule.op === 'gt') {
    return getGteDistance({ value, rule })
  }

  if (rule.op === 'between') {
    return getBetweenDistance({ value, rule })
  }

  return getHardRuleDistance({ value, rule })
}

const resolveDistanceStatus = (distance) => {
  if (!Number.isFinite(distance)) return PROFILE_DISTANCE_STATUS.UNAVAILABLE
  if (distance <= PROFILE_DISTANCE_THRESHOLD.VERY_CLOSE) return PROFILE_DISTANCE_STATUS.VERY_CLOSE
  if (distance <= PROFILE_DISTANCE_THRESHOLD.NEAR) return PROFILE_DISTANCE_STATUS.NEAR

  return PROFILE_DISTANCE_STATUS.OUTSIDE
}

const resolveDistanceTrend = ({ currentDistance, previousDistance }) => {
  if (!Number.isFinite(currentDistance) || !Number.isFinite(previousDistance)) {
    return {
      delta: null,
      trend: PROFILE_DISTANCE_TREND.UNKNOWN,
    }
  }

  const delta = currentDistance - previousDistance
  const absoluteDelta = Math.abs(delta)

  if (absoluteDelta <= PROFILE_DISTANCE_THRESHOLD.STABLE_DELTA) {
    return {
      delta,
      trend: PROFILE_DISTANCE_TREND.STABLE,
    }
  }

  if (delta <= -PROFILE_DISTANCE_THRESHOLD.FAST_CLOSING_DELTA) {
    return {
      delta,
      trend: PROFILE_DISTANCE_TREND.CLOSING_FAST,
    }
  }

  if (delta < 0) {
    return {
      delta,
      trend: PROFILE_DISTANCE_TREND.CLOSING,
    }
  }

  return {
    delta,
    trend: PROFILE_DISTANCE_TREND.MOVING_AWAY,
  }
}

export const buildPlayerProfileDistance = ({ profile, rules, metrics, previousDistance }) => {
  const safeRules = Array.isArray(rules) ? rules : []
  const ruleDistances = safeRules.map((rule) => {
    const value = metrics?.[rule.metric]
    const result = getRuleDistance({ value, rule })

    return {
      metric: rule.metric,
      reason: rule.reason || rule.metric,
      op: rule.op,
      value,
      target: rule.value,
      min: rule.min,
      max: rule.max,
      ...result,
    }
  })
  const hardRuleBlocked = ruleDistances.some((item) => !item.trackable && !item.matched)
  const trackableMisses = ruleDistances.filter((item) => item.trackable && !item.matched)
  const profileMatched = ruleDistances.length > 0 && ruleDistances.every((item) => item.matched)
  const distance = hardRuleBlocked || !trackableMisses.length
    ? profileMatched ? 0 : null
    : Math.max(...trackableMisses.map((item) => item.distance))
  const status = resolveDistanceStatus(distance)
  const trendResult = resolveDistanceTrend({
    currentDistance: distance,
    previousDistance,
  })

  return {
    profileId: profile.id,
    profileLabel: profile.label,
    group: profile.group,
    matched: profileMatched,
    distance,
    distancePct: Number.isFinite(distance) ? Math.round(distance * 100) : null,
    status,
    previousDistance: Number.isFinite(previousDistance) ? previousDistance : null,
    previousDistancePct: Number.isFinite(previousDistance) ? Math.round(previousDistance * 100) : null,
    distanceDelta: trendResult.delta,
    distanceDeltaPct: Number.isFinite(trendResult.delta) ? Math.round(trendResult.delta * 100) : null,
    trend: trendResult.trend,
    hardRuleBlocked,
    ruleDistances,
  }
}
