// features/playersDatabase/ui/logic/scoutDisplay.logic.js

import {
  buildScoutProfileCombinations,
  SCOUT_PROFILES,
} from '../../../../shared/players/scouting/index.js'
import {
  TEAM_SCOUT_PRIORITY_LEVEL,
} from '../../../../shared/teams/scout/index.js'

export const SCOUT_PRIORITY_DISPLAY = {
  elite: { label: 'יעד מוביל', tone: 'elite' },
  high: { label: 'עדיפות גבוהה', tone: 'high' },
  positive: { label: 'חיובי', tone: 'positive' },
  neutral: { label: 'רגיל', tone: 'neutral' },
  low: { label: 'עדיפות נמוכה', tone: 'low' },
}

const SCOUT_PROFILE_GROUP_LABELS = {
  attack: 'התקפי',
  defense_keeper: 'הגנתי',
  defense_midfield: 'הגנתי / קישור',
  attack_creation: 'יצירה והתקפה',
  opportunity: 'הזדמנות',
  all: 'כללי',
}

const SCOUT_PROFILE_BY_ID = SCOUT_PROFILES.reduce((map, profile) => {
  map[profile.id] = profile
  return map
}, {})

const cleanValue = value => String(value || '').trim()

const resolveScoutProfileLabel = profile => {
  const profileId = cleanValue(profile?.profileId || profile?.id)

  if (!profileId) return ''

  return cleanValue(
    profile?.label ||
    SCOUT_PROFILE_BY_ID[profileId]?.label ||
    profileId
  )
}

const resolveScoutProfileDescription = profile => {
  const groupLabel = SCOUT_PROFILE_GROUP_LABELS[profile?.group] || ''
  const interest = cleanValue(profile?.interest)

  if (groupLabel && interest) {
    return `${groupLabel} · ${interest}`
  }

  return groupLabel || interest || 'פרופיל נבחר'
}

export function resolveScoutPriority(value) {
  return SCOUT_PRIORITY_DISPLAY[value] || SCOUT_PRIORITY_DISPLAY.neutral
}

export function formatRate(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'
  return `${Math.round(Number(value))}%`
}

export function buildPlayerScoutProfileOptions(profiles = SCOUT_PROFILES) {
  return (Array.isArray(profiles) ? profiles : []).map(profile => ({
    value: profile.id,
    label: cleanValue(profile.label || profile.id),
    description: resolveScoutProfileDescription(profile),
    iconId: profile.idIcon || 'performanceProfile',
  }))
}

export function buildTeamScoutPriorityOptions() {
  return [
    TEAM_SCOUT_PRIORITY_LEVEL.ELITE,
    TEAM_SCOUT_PRIORITY_LEVEL.HIGH,
    TEAM_SCOUT_PRIORITY_LEVEL.POSITIVE,
    TEAM_SCOUT_PRIORITY_LEVEL.NEUTRAL,
    TEAM_SCOUT_PRIORITY_LEVEL.LOW,
  ].map(value => ({
    value,
    label: resolveScoutPriority(value).label,
    description: 'ביצוע לפי רמת עדיפות',
  }))
}

export function buildScoutProfileDisplay(profiles = []) {
  const scoutProfiles = Array.isArray(profiles) ? profiles : []
  const signals = scoutProfiles
    .map(profile => ({
      ...profile,
      profileId: cleanValue(profile?.profileId || profile?.id),
    }))
    .filter(profile => profile.profileId)
  const combinations = buildScoutProfileCombinations({ signals })
  const combination = combinations[0] || null

  if (combination) {
    return {
      type: 'combination',
      id: cleanValue(combination.id),
      label: cleanValue(combination.label),
      reliability: cleanValue(
        scoutProfiles[0]?.reliabilityLevel ||
        scoutProfiles[0]?.profileReliability
      ),
      baseProfiles: (combination.matchedProfileIds || []).map(profileId => ({
        id: profileId,
        label: SCOUT_PROFILE_BY_ID[profileId]?.label || profileId,
      })),
    }
  }

  const primaryProfile = scoutProfiles[0] || null

  if (!primaryProfile) {
    return {
      type: 'none',
      id: '',
      label: '',
      reliability: '',
      baseProfiles: [],
    }
  }

  return {
    type: 'profile',
    id: cleanValue(primaryProfile.profileId || primaryProfile.id),
    label: resolveScoutProfileLabel(primaryProfile),
    reliability: cleanValue(
      primaryProfile.reliabilityLevel ||
      primaryProfile.profileReliability
    ),
    baseProfiles: [],
  }
}
