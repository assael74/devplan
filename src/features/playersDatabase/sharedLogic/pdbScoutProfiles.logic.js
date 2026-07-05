// src/features/playersDatabase/sharedLogic/pdbScoutProfiles.logic.js

import { SCOUT_PROFILES } from '../../../shared/players/scouting/index.js'

const clean = value => String(value ?? '').trim()

const unique = values =>
  Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map(clean)
        .filter(Boolean)
    )
  )

export const SCOUT_METRIC_LABELS = {
  isYoungerAgeGroup: 'שחקן משנתון צעיר',
  startsPct: 'אחוז פתיחות',
  subOut: 'הוחלף החוצה',
  minutesPct: 'אחוז דקות',
  yellowCards: 'כרטיסים צהובים',
  goals: 'שערים',
  goalsShareOfTeam: 'חלק מהשערים של הקבוצה',
  goalsPer90: 'שערים ל-90',
}

export const SCOUT_OPERATOR_LABELS = {
  truthy: 'קיים',
  eq: 'שווה ל',
  gte: 'לפחות',
  lte: 'עד',
  gt: 'מעל',
  lt: 'מתחת',
  between: 'בין',
}

export const SCOUT_LEVEL_LABELS = {
  below_level: 'מחפש שנתון נמוך יותר',
  same_level: 'מחפש באותו שנתון',
  above_level: 'מחפש שנתון גבוה יותר',
}

export const SCOUT_TEAM_FILTER_LABELS = {
  any_team: 'כל קבוצה',
  attack_positive: 'קבוצות התקפה',
  attack_positive_or_goals_gte_10: 'קבוצות התקפה או קבוצה עם 10+ שערים',
  any_positive: 'כל קבוצה עם סימן חיובי',
  clear_positive: 'קבוצות עם יתרון ברור',
  defense_positive: 'קבוצות הגנה',
}

const scoutProfileById = SCOUT_PROFILES.reduce((result, profile) => {
  result[profile.id] = profile

  if (profile.idIcon) {
    result[profile.idIcon] = profile
  }

  return result
}, {})

const getScoutProfileContext = profile => {
  if (!profile) return ''

  const level =
    SCOUT_LEVEL_LABELS[profile.searchLevels?.[0]] || 'פרופיל סקאוט'

  const teamFilter = profile.teamFilter
    ? SCOUT_TEAM_FILTER_LABELS[profile.teamFilter] || profile.teamFilter
    : ''

  const interest = profile.interest
    ? profile.interest === 'super_interesting'
      ? 'עניין גבוה'
      : 'עניין רגיל'
    : ''

  return [level, teamFilter, interest].filter(Boolean).join(' | ')
}

export const getScoutProfile = profileId =>
  scoutProfileById[clean(profileId)] || null

export const getScoutProfileIconId = profileId =>
  getScoutProfile(profileId)?.idIcon || ''

export const getProfileLabel = profileId =>
  getScoutProfile(profileId)?.label || ''

export const formatScoutRule = rule => {
  if (!rule) return ''

  const metric = SCOUT_METRIC_LABELS[rule.metric] || rule.metric
  const operator = SCOUT_OPERATOR_LABELS[rule.op] || rule.op

  if (rule.op === 'between') {
    return `${metric} ${operator} ${rule.min} - ${rule.max}`
  }

  if (rule.op === 'truthy') {
    return metric
  }

  return `${metric} ${operator} ${rule.value}`
}

export const getScoutProfileTooltipData = profileId => {
  const profile = getScoutProfile(profileId)

  if (!profile) {
    return {
      title: clean(profileId) || '-',
      context: '',
      rules: [],
    }
  }

  const sourceRules = Array.isArray(profile.deepRules) && profile.deepRules.length
    ? profile.deepRules
    : Array.isArray(profile.rules)
      ? profile.rules
      : []

  return {
    title: profile.label,
    context: getScoutProfileContext(profile),
    rules: sourceRules.map(formatScoutRule).filter(Boolean),
  }
}

export const getScoutProfileRows = (profileCounts = {}) =>
  SCOUT_PROFILES.map(profile => ({
    profileId: clean(profile.id),
    label: clean(profile.label) || clean(profile.id),
    idIcon: clean(profile.idIcon),
    count: Number(profileCounts?.[profile.id]) || 0,
  }))

export const getScoutProfileBreakdownRows = (profileCounts = {}) =>
  getScoutProfileRows(profileCounts)
    .filter(row => row.count > 0 && row.profileId)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'he'))

export const getPlayerProfileInfo = player =>
  player.scoutProfiles?.[player.profileId] ||
  player.eligibleScoutProfiles?.[player.profileId] ||
  player.rawScoutProfiles?.[player.profileId] ||
  {}

export const getPlayerProfileChips = player => {
  if (
    Array.isArray(player.matchedProfileIds) &&
    player.matchedProfileIds.length
  ) {
    return player.matchedProfileIds
      .map((profileId, index) => ({
        id: clean(profileId),
        label:
          clean(player.matchedProfileLabels?.[index]) ||
          getProfileLabel(profileId) ||
          player.profileLabel ||
          '',
        idIcon: getScoutProfileIconId(profileId),
      }))
      .filter(item => item.label)
  }

  const rows = [player.scoutProfiles || {}, player.eligibleScoutProfiles || {}]
    .flatMap(map => Object.values(map))
    .map(item => {
      const id = clean(item.profileId || item.id || item.profileLabel)

      return {
        id,
        label: clean(item.profileLabel || item.label),
        score: item.score,
        idIcon: clean(item.idIcon) || getScoutProfileIconId(id),
      }
    })
    .filter(item => item.label)

  const uniqueRows = Array.from(
    rows
      .reduce((map, item) => {
        if (!map.has(item.label)) {
          map.set(item.label, item)
        }

        return map
      }, new Map())
      .values()
  )

  if (uniqueRows.length) {
    return uniqueRows
  }

  if (!player.profileLabel) {
    return []
  }

  const id = clean(player.profileId || player.profileLabel)

  return [
    {
      id,
      label: player.profileLabel,
      idIcon: getScoutProfileIconId(id),
    },
  ]
}

export const resolveProfileLabel = (row = {}, profileId = '') =>
  row.scoutProfiles?.[profileId]?.profileLabel ||
  row.eligibleScoutProfiles?.[profileId]?.profileLabel ||
  row.rawScoutProfiles?.[profileId]?.profileLabel ||
  row.matchedProfileLabels?.[
    row.matchedProfileIds?.indexOf(profileId)
  ] ||
  row.profileLabel ||
  ''

export const getMatchedProfileIds = row =>
  unique([
    ...(row.scoutProfileIds || []),
    ...(row.rawScoutProfileIds || []),
  ])
