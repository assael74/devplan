import { resolveScoutProfileDefinition } from '../../../../../shared/scouting/players/profiles.js'
import { formatScoutRule } from '../../logic/scout/scoutRules.logic.js'

const clean = value => String(value || '').trim()

const CONDITION_ICON_BY_METRIC = {
  goals: 'goals',
  goalsPer90: 'goals',
  goalsPerGameDuration: 'goals',
  goalsShareOfTeam: 'goals',
  minutes: 'timePlayed',
  minutesPct: 'timePlayed',
  minutesPerGame: 'timePlayed',
}

const clampPercent = value => {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return null

  return Math.round(Math.min(100, Math.max(0, numericValue)))
}

const resolveDate = value => {
  if (!value) return null
  if (typeof value?.toDate === 'function') return value.toDate()

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const formatCreatedAt = value => {
  const date = resolveDate(value)
  if (!date) return ''

  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

const resolveRuleProgress = ({ rule, evidence }) => {
  if (!evidence) return null
  if (evidence.matched) return 100

  const actual = Number(evidence.actual)
  if (!Number.isFinite(actual)) return 0

  if (rule.op === 'gte' || rule.op === 'gt') {
    const threshold = Number(rule.value)
    return threshold > 0 ? clampPercent((actual / threshold) * 100) : 0
  }

  if (rule.op === 'lte' || rule.op === 'lt') {
    const threshold = Number(rule.value)
    if (actual <= threshold) return 100
    return actual > 0 ? clampPercent((threshold / actual) * 100) : 0
  }

  if (rule.op === 'between') {
    const min = Number(rule.min)
    const max = Number(rule.max)
    if (actual >= min && actual <= max) return 100
    if (actual < min) return min > 0 ? clampPercent((actual / min) * 100) : 0
    return actual > 0 ? clampPercent((max / actual) * 100) : 0
  }

  return 0
}

const resolveRuleEvidence = ({ profile, rule }) => (
  (Array.isArray(profile?.matchEvidence) ? profile.matchEvidence : [])
    .find(evidence => evidence?.metric === rule.metric && evidence?.op === rule.op) || null
)

const DEPTH_FACTOR_BY_METRIC = {
  goals: ['goalsDepth', 'lowGoalsDepth', 'goalsSampleDepth'],
  minutesPct: ['minutesDepth'],
  minutes: ['minutesDepth', 'minutesSampleDepth'],
  goalsPerGameDuration: ['rateDepth'],
}

const resolveDepthFactorPct = ({ profile, metric }) => {
  const factors = profile?.profileStrength?.factors || profile?.profileDepth?.factors || {}
  const factorName = (DEPTH_FACTOR_BY_METRIC[metric] || [])
    .find(name => Number.isFinite(Number(factors?.[name])))

  return factorName ? clampPercent(Number(factors[factorName]) * 100) : null
}

const buildDepthConditions = ({ profile, profileRules }) => {
  const depthRules = Array.isArray(profile?.profileDepth?.rules) && profile.profileDepth.rules.length
    ? profile.profileDepth.rules
    : profileRules

  return depthRules
    .map((depthRule, index) => {
      const profileRule = profileRules.find(rule => rule.metric === depthRule?.metric)

      return {
        key: `${depthRule?.metric || 'depth-rule'}-${index}`,
        iconId: CONDITION_ICON_BY_METRIC[depthRule?.metric] || 'stats',
        label: profileRule
          ? formatScoutRule(profileRule)
          : clean(depthRule?.reason || depthRule?.metric),
        progressPct: clampPercent(depthRule?.depthPct) ?? resolveDepthFactorPct({
          profile,
          metric: depthRule?.metric,
        }),
      }
    })
    .filter(condition => condition.label)
}

export const buildScoutProfileTooltipModel = ({
  profileId = '',
  profile = null,
} = {}) => {
  const source = profile && typeof profile === 'object' ? profile : {}
  const definition = resolveScoutProfileDefinition(profileId || source.profileId || source.id)
  const resolvedProfileId = clean(profileId || source.profileId || source.id)
  const sourceDefinition = resolveScoutProfileDefinition(
    source.sourcePreliminaryProfileId || definition?.sourcePreliminaryProfileId
  )

  if (!definition && !resolvedProfileId) return null

  const usesSourceProfileRules = !definition?.rules?.length && sourceDefinition?.rules?.length
  const rules = usesSourceProfileRules ? sourceDefinition.rules : (definition?.rules || [])
  const createdAt = formatCreatedAt(
    source?.createdAt || source?.source?.calculatedAt || source?.calculatedAt
  )

  return {
    profileId: resolvedProfileId,
    label: clean(source?.profileLabel || source?.label) || definition?.label || resolvedProfileId,
    iconId: clean(definition?.idIcon) || 'performanceProfile',
    createdAt,
    conditionsLabel: 'תנאים שיצרו את הפרופיל',
    conditions: rules.map((rule, index) => {
      const evidence = resolveRuleEvidence({ profile: source, rule })

      return {
        key: `${rule.metric || 'rule'}-${index}`,
        iconId: CONDITION_ICON_BY_METRIC[rule.metric] || 'stats',
        label: formatScoutRule(rule) || clean(rule.reason),
        progressPct: resolveRuleProgress({ rule, evidence }),
      }
    }),
    depthConditions: buildDepthConditions({
      profile: source,
      profileRules: rules,
    }),
  }
}
