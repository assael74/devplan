// src/features/playersDatabase/ui/logic/scout/scoutOptions.logic.js

import {
  SCOUT_PROFILE_COMBINATIONS,
  SCOUT_PROFILES,
} from '../../../../../shared/players/scouting/index.js'
import { TEAM_SCOUT_PRIORITY_LEVEL } from '../../../../../shared/scouting/teams/index.js'
import {
  SCOUT_INTEREST_DISPLAY,
  SCOUT_PROFILE_GROUP_LABELS,
} from './scoutDisplay.constants.js'
import {
  cleanScoutDisplayValue,
  resolveScoutDisplayLabel,
} from './scoutDisplay.utils.js'
import {
  buildScoutProfileTooltipFromFields,
  resolveScoutProfileDescription,
} from './scoutProfileDisplay.logic.js'
import { resolveScoutPriority } from './scoutPriority.logic.js'

const SCOUT_PROFILE_BY_ID = SCOUT_PROFILES.reduce((map, profile) => {
  map[profile.id] = profile
  return map
}, {})

const buildScoutCombinationDescription = combination => (
  (Array.isArray(combination?.profileIds) ? combination.profileIds : [])
    .map(profileId => SCOUT_PROFILE_BY_ID[profileId]?.label || profileId)
    .filter(Boolean)
    .join(' + ')
)

export function buildPlayerScoutProfileOptions(profiles = SCOUT_PROFILES) {
  const profileOptions = (Array.isArray(profiles) ? profiles : []).map(profile => ({
    value: profile.id,
    label: cleanScoutDisplayValue(profile.label || profile.id),
    description: resolveScoutProfileDescription(profile),
    tooltip: buildScoutProfileTooltipFromFields(profile),
    iconId: profile.idIcon || 'performanceProfile',
    isCombination: false,
    profile,
  }))

  const combinationOptions = SCOUT_PROFILE_COMBINATIONS.map(combination => {
    const explanation = cleanScoutDisplayValue(combination.description) || buildScoutCombinationDescription(combination)
    const interest = resolveScoutDisplayLabel(SCOUT_INTEREST_DISPLAY, combination.interest)
    const groupLabel = SCOUT_PROFILE_GROUP_LABELS[combination.group] || ''
    const description = [groupLabel, interest].filter(Boolean).join(' · ')

    return {
      value: combination.id,
      label: cleanScoutDisplayValue(combination.label || combination.id),
      description,
      tooltip: explanation || cleanScoutDisplayValue(combination.id),
      iconId: combination.idIcon || 'performanceProfile',
      variant: 'combination',
      isCombination: true,
      profileIds: Array.isArray(combination.profileIds) ? combination.profileIds : [],
      profile: combination,
    }
  })

  return [
    ...profileOptions,
    ...combinationOptions,
  ]
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
