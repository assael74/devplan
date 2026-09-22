// src/shared/scouting/players/rules.js

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

const resolveThreshold = (rule = {}) => {
  if (rule.op === 'between') {
    return {
      min: rule.min,
      max: rule.max,
    }
  }

  if (rule.op === 'in') return Array.isArray(rule.values) ? rule.values : []
  if (rule.op === 'truthy') return true
  if (rule.op === 'falsy') return false

  return rule.value
}

const buildRuleEvidence = ({ rule, actual, matched }) => ({
  metric: rule.metric,
  reason: rule.reason || rule.metric,
  op: rule.op,
  actual,
  threshold: resolveThreshold(rule),
  matched,
})

export const evaluateScoutRules = ({ profile, metrics }) => {
  const rules = Array.isArray(profile?.rules) ? profile.rules : []
  const evidence = rules.map((rule) => {
    const actual = metrics?.[rule.metric]

    return buildRuleEvidence({
      rule,
      actual,
      matched: isMatch({ value: actual, rule }),
    })
  })
  const matchedEvidence = evidence.filter(item => item.matched)
  const missedRules = evidence.filter(item => !item.matched)

  return {
    matched: evidence.length > 0 && missedRules.length === 0,
    matchedCount: matchedEvidence.length,
    totalCount: evidence.length,
    score: evidence.length ? Math.round((matchedEvidence.length / evidence.length) * 100) : 0,
    reasons: matchedEvidence.map(item => item.reason),
    missedRules,
    matchEvidence: evidence,
  }
}
