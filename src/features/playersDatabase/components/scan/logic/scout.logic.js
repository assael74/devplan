// src/features/playersDatabase/components/scan/logic/scout.logic.js

import { SCOUT_PROFILES } from '../../../../../shared/players/scouting/index.js'
import {
  SCOUT_LEVEL_LABELS,
  SCOUT_METRIC_LABELS,
  SCOUT_OPERATOR_LABELS,
  SCOUT_PROFILE_ICON_FALLBACKS,
  SCOUT_TEAM_FILTER_LABELS,
} from './constants.js'
import { clean, unique } from './utils.js'

const scoutProfileById = SCOUT_PROFILES.reduce((acc, profile) => {
  acc[profile.id] = profile
  if (profile.idIcon) acc[profile.idIcon] = profile
  return acc
}, {})

export const getProfileLabel = profileId => scoutProfileById[clean(profileId)]?.label || clean(profileId)

export const getScoutProfile = profileId => scoutProfileById[clean(profileId)] || null

export const formatScoutRule = rule => {
  if (!rule) return ''
  const metric = SCOUT_METRIC_LABELS[rule.metric] || rule.metric
  const operator = SCOUT_OPERATOR_LABELS[rule.op] || rule.op
  if (rule.op === 'between') return `${metric} ${operator} ${rule.min} ל-${rule.max}`
  if (rule.op === 'truthy') return metric
  return `${metric} ${operator} ${rule.value}`
}

export const getScoutProfileTooltipData = profileId => {
  const profile = getScoutProfile(profileId)
  if (!profile) return { title: clean(profileId) || '-', context: '', rules: [] }

  const sourceRules = Array.isArray(profile.deepRules) && profile.deepRules.length ? profile.deepRules : Array.isArray(profile.rules) ? profile.rules : []
  const level = SCOUT_LEVEL_LABELS[profile.searchLevels?.[0]] || 'פרופיל סקאוט'
  const teamFilter = profile.teamFilter ? SCOUT_TEAM_FILTER_LABELS[profile.teamFilter] || profile.teamFilter : ''
  const interest = profile.interest ? profile.interest === 'super_interesting' ? 'עניין גבוה' : 'עניין רגיל' : ''

  return {
    title: profile.label,
    context: [level, teamFilter, interest].filter(Boolean).join(' | '),
    rules: sourceRules.map(formatScoutRule).filter(Boolean),
  }
}

export const getPlayerProfileInfo = player => player.scoutProfiles?.[player.profileId] || player.eligibleScoutProfiles?.[player.profileId] || player.rawScoutProfiles?.[player.profileId] || {}

export const getPlayerProfileChips = player => {
  if (Array.isArray(player.matchedProfileIds) && player.matchedProfileIds.length) {
    return player.matchedProfileIds.map((profileId, index) => ({
      id: clean(profileId),
      label: clean(player.matchedProfileLabels?.[index]) || getProfileLabel(profileId) || player.profileLabel || clean(profileId),
      idIcon: getScoutProfile(profileId)?.idIcon || SCOUT_PROFILE_ICON_FALLBACKS[clean(profileId)],
    }))
  }

  const rows = [player.scoutProfiles || {}, player.eligibleScoutProfiles || {}].flatMap(map => Object.values(map || {})).map(item => {
    const id = clean(item.profileId || item.id || item.profileLabel)
    return { id, label: clean(item.profileLabel || item.label), score: item.score, idIcon: clean(item.idIcon) || getScoutProfile(id)?.idIcon || SCOUT_PROFILE_ICON_FALLBACKS[id] }
  }).filter(item => item.label)

  const uniqueRows = Array.from(rows.reduce((map, item) => {
    if (!map.has(item.label)) map.set(item.label, item)
    return map
  }, new Map()).values())

  if (uniqueRows.length) return uniqueRows
  if (!player.profileLabel) return []

  const id = clean(player.profileId || player.profileLabel)
  return [{ id, label: player.profileLabel, idIcon: getScoutProfile(id)?.idIcon || SCOUT_PROFILE_ICON_FALLBACKS[id] }]
}

export const resolveProfileLabel = (row = {}, profileId = '') => row.scoutProfiles?.[profileId]?.profileLabel || row.eligibleScoutProfiles?.[profileId]?.profileLabel || row.rawScoutProfiles?.[profileId]?.profileLabel || row.matchedProfileLabels?.[row.matchedProfileIds?.indexOf(profileId)] || row.profileLabel || profileId

export const getMatchedProfileIds = row => unique([...(row.scoutProfileIds || []), ...(row.rawScoutProfileIds || [])])
