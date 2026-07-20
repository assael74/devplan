// src/shared/players/scouting/rules.js

const toNum = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const isMatch = ({ value, rule }) => {
  const n = toNum(value, null)

  if (rule.op === 'truthy') return Boolean(value)
  if (rule.op === 'falsy') return !Boolean(value)
  if (rule.op === 'eq') return value === rule.value || n === rule.value
  if (!Number.isFinite(n)) return false
  if (rule.op === 'gte') return n >= rule.value
  if (rule.op === 'lte') return n <= rule.value
  if (rule.op === 'in') return Array.isArray(rule.values) && rule.values.includes(n)
  if (rule.op === 'gt') return n > rule.value
  if (rule.op === 'lt') return n < rule.value
  if (rule.op === 'between') return n >= rule.min && n <= rule.max

  return false
}

const getProfileRules = ({ profile, searchDistance = 0 }) => {
  const deepRules = Array.isArray(profile?.deepRules) ? profile.deepRules : []

  if (searchDistance >= 2 && deepRules.length) return deepRules

  return Array.isArray(profile?.rules) ? profile.rules : []
}

export const evaluateScoutRules = ({ profile, metrics, searchDistance = 0 }) => {
  const rules = getProfileRules({ profile, searchDistance })
  const matched = []
  const missed = []

  rules.forEach((rule) => {
    const value = metrics?.[rule.metric]

    if (isMatch({ value, rule })) {
      matched.push({
        metric: rule.metric,
        reason: rule.reason || rule.metric,
        value,
      })
      return
    }

    missed.push({
      metric: rule.metric,
      reason: rule.reason || rule.metric,
      value,
    })
  })

  return {
    matched: matched.length === rules.length,
    matchedCount: matched.length,
    totalCount: rules.length,
    score: rules.length ? Math.round((matched.length / rules.length) * 100) : 0,
    reasons: matched.map((item) => item.reason),
    matchedRules: matched,
    missedRules: missed,
  }
}
