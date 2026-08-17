// src/shared/scouting/players/profileHierarchy/playerProfileDepth.js

const toFiniteNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const getGteDepth = ({ value, target }) => {
  const current = toFiniteNumber(value)
  const threshold = toFiniteNumber(target)

  if (!Number.isFinite(current) || !Number.isFinite(threshold) || threshold <= 0) return null
  if (current < threshold) return null

  return Math.max(0, (current - threshold) / threshold)
}

const getLteDepth = ({ value, target }) => {
  const current = toFiniteNumber(value)
  const threshold = toFiniteNumber(target)

  if (!Number.isFinite(current) || !Number.isFinite(threshold) || threshold <= 0) return null
  if (current > threshold) return null

  return Math.max(0, (threshold - current) / threshold)
}

const getRuleDepth = ({ rule, metrics }) => {
  const value = metrics?.[rule.metric]

  if (rule.op === 'gte' || rule.op === 'gt') {
    return getGteDepth({ value, target: rule.value })
  }

  if (rule.op === 'lte' || rule.op === 'lt') {
    return getLteDepth({ value, target: rule.value })
  }

  return null
}

export const buildPlayerProfileDepth = ({ profile, metrics } = {}) => {
  const rules = Array.isArray(profile?.rules) ? profile.rules : []
  const measurableRules = rules
    .map((rule) => {
      const depth = getRuleDepth({ rule, metrics })

      if (!Number.isFinite(depth)) return null

      return {
        metric: rule.metric,
        reason: rule.reason || rule.metric,
        depth,
        depthPct: Math.round(depth * 100),
      }
    })
    .filter(Boolean)
  const depth = measurableRules.length
    ? Math.min(...measurableRules.map(item => item.depth))
    : 0

  return {
    depth,
    depthPct: Math.round(depth * 100),
    measurableRuleCount: measurableRules.length,
    rules: measurableRules,
  }
}
