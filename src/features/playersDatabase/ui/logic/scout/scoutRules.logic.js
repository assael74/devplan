// features/playersDatabase/ui/logic/scout/scoutRules.logic.js

import {
  SCOUT_RULE_METRIC_DISPLAY,
  SCOUT_RULE_OPERATOR_DISPLAY,
} from './scoutDisplay.constants.js'
import {
  cleanScoutDisplayValue,
  countScoutItems,
} from './scoutDisplay.utils.js'

const PERCENT_METRICS = new Set([
  'goalsShareOfTeam',
  'minutesPct',
  'startsPct',
  'subInPct',
  'subOutPct',
  'scoringGamesPct',
])

const formatScoutRuleMetricValue = (metric, value) => {
  const numberValue = Number(value)

  if (PERCENT_METRICS.has(metric) && Number.isFinite(numberValue)) {
    return `${Math.round(numberValue * 100)}%`
  }

  return String(value)
}

export const formatScoutRuleValue = rule => {
  if (rule.op === 'between') {
    return [rule.min, rule.max]
      .map(value => formatScoutRuleMetricValue(rule.metric, value))
      .join('-')
  }

  if (Array.isArray(rule.values)) return rule.values.join(', ')

  if (rule.value !== undefined) {
    return formatScoutRuleMetricValue(rule.metric, rule.value)
  }

  return ''
}

export const formatScoutRule = rule => {
  const metric = SCOUT_RULE_METRIC_DISPLAY[rule?.metric] || cleanScoutDisplayValue(rule?.metric)
  const operator = SCOUT_RULE_OPERATOR_DISPLAY[rule?.op] || cleanScoutDisplayValue(rule?.op)
  const value = formatScoutRuleValue(rule || {})

  return [metric, operator, value].filter(Boolean).join(' ')
}

export const formatScoutRules = rules => (
  (Array.isArray(rules) ? rules : [])
    .map(formatScoutRule)
    .filter(Boolean)
    .join(', ')
)

export const buildProfileRuleItems = profile => (
  (Array.isArray(profile?.rules) ? profile.rules : [])
    .map((rule, index) => ({
      key: `${rule?.metric || 'rule'}-${index}`,
      value: formatScoutRule(rule),
    }))
    .filter(item => item.value)
)

export const buildProfileRulesTooltip = profile => formatScoutRules(profile?.rules)

export const buildProfileRulesLabel = profile => {
  const rulesCount = countScoutItems(profile?.rules)
  return rulesCount ? `${rulesCount} חוקים` : ''
}
