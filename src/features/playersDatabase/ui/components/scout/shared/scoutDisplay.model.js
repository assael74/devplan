// features/playersDatabase/ui/components/scout/shared/scoutDisplay.model.js

import { resolveScoutProfileDefinition } from '../../../../../../shared/scouting/players/profiles.js'
import { SCOUT_PROFILE_COMBINATIONS } from '../../../../../../shared/scouting/players/combinations.js'
import { buildScoutProfileTooltip } from '../../../logic/scout/scoutProfileDisplay.logic.js'

const clean = value => String(value || '').trim()

const COMBINATION_BY_ID = SCOUT_PROFILE_COMBINATIONS.reduce((result, combination) => {
  result[combination.id] = combination
  return result
}, {})

const cleanDisplayLabel = value => {
  const label = clean(value)

  return label === '-' ? '' : label
}

const uniqueById = values => {
  const seen = new Set()

  return (Array.isArray(values) ? values : []).filter(value => {
    const id = clean(
      value?.id ||
      value?.combinationId ||
      value?.profileId
    )

    if (!id || seen.has(id)) return false
    seen.add(id)
    return true
  })
}

const resolveProfileId = profile => clean(
  profile?.profileId ||
  profile?.id
)

const resolveProfileLabel = profile => clean(
  profile?.profileLabel ||
  profile?.label ||
  profile?.name ||
  resolveProfileId(profile)
) || 'פרופיל סקאוט'

const resolveProfileShortLabel = profile => clean(
  profile?.profileShortLabel ||
  profile?.shortLabel
)

const resolveProfileIconId = profile => {
  const definition = resolveScoutProfileDefinition(resolveProfileId(profile))

  return clean(profile?.idIcon) || definition?.idIcon || 'performanceProfile'
}

const resolveCombinationIconId = combination => {
  const id = clean(combination?.id || combination?.combinationId)
  return clean(combination?.idIcon) || clean(COMBINATION_BY_ID[id]?.idIcon) || 'performanceProfile'
}

const resolveCombinationProfileIds = combination => (
  Array.isArray(combination?.profileIds)
    ? combination.profileIds
    : Array.isArray(combination?.matchedProfileIds)
      ? combination.matchedProfileIds
      : []
).map(clean).filter(Boolean)

export const buildScoutNearProfileLabel = player => {
  const nearProfile = (
    player?.scoutProfileProgression?.nearestProfile ||
    (Array.isArray(player?.scoutCandidateSignals)
      ? player.scoutCandidateSignals[0]
      : null)
  )
  const label = cleanDisplayLabel(
    nearProfile?.profileLabel ||
    nearProfile?.label ||
    nearProfile?.profileId
  )

  return label ? `קרוב · ${label}` : ''
}

const resolveDisplayProfileIds = display => (
  Array.isArray(display?.baseProfiles)
    ? display.baseProfiles
    : []
).map(resolveProfileId).filter(Boolean)

const buildProfileTooltipItem = profile => {
  const id = resolveProfileId(profile)
  const definition = resolveScoutProfileDefinition(id)

  return {
    id,
    label: resolveProfileLabel(profile),
    description: clean(profile?.description) || buildScoutProfileTooltip(definition || profile),
  }
}

const buildProfileTooltipItems = ({ profiles, display }) => {
  const profileItems = uniqueById(profiles).map(buildProfileTooltipItem)
  const seen = new Set(profileItems.map(item => item.id))
  const displayItems = (
    Array.isArray(display?.baseProfiles)
      ? display.baseProfiles
      : []
  ).map(buildProfileTooltipItem).filter(item => {
    if (!item.id || seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })

  return [
    ...profileItems,
    ...displayItems,
  ]
}

export const buildScoutDisplayItems = ({
  profiles = [],
  combinations = [],
} = {}) => {
  const safeProfiles = uniqueById(profiles)
  const safeCombinations = uniqueById(combinations)
  const coveredProfileIds = new Set(
    safeCombinations.flatMap(resolveCombinationProfileIds)
  )

  return [
    ...safeCombinations.map(combination => ({
      type: 'combination',
      id: clean(combination.id || combination.combinationId),
      iconId: resolveCombinationIconId(combination),
      label: clean(combination.label || combination.id) || 'פרופיל משולב',
      description: clean(combination.description),
      profileIds: resolveCombinationProfileIds(combination),
      source: combination,
    })),
    ...safeProfiles
      .filter(profile => !coveredProfileIds.has(resolveProfileId(profile)))
      .map(profile => ({
        type: 'profile',
        id: resolveProfileId(profile),
        iconId: resolveProfileIconId(profile),
        label: resolveProfileLabel(profile),
        shortLabel: resolveProfileShortLabel(profile),
        source: profile,
      })),
  ]
}

export const buildScoutCompactView = ({
  profiles = [],
  combinations = [],
  display = {},
  fallbackLabel = '',
  player = null,
} = {}) => {
  const displayItems = buildScoutDisplayItems({
    profiles,
    combinations,
  })
  const isDisplayCombination = display.type === 'combination' || Boolean(
    COMBINATION_BY_ID[clean(display.id || display.combinationId)]
  )
  const displayProfileIds = new Set(resolveDisplayProfileIds(display))
  const fallbackCombination = isDisplayCombination
    ? {
      type: 'combination',
      id: clean(display.id),
      iconId: resolveCombinationIconId(display),
      label: clean(display.label) || 'פרופיל משולב',
      profileIds: Array.from(displayProfileIds),
      source: display,
    }
    : null
  const primaryItem = fallbackCombination || displayItems[0]
  const isCombination = primaryItem?.type === 'combination'
  const baseLabel = (
    cleanDisplayLabel(primaryItem?.label) ||
    cleanDisplayLabel(display.label) ||
    buildScoutNearProfileLabel(player) ||
    cleanDisplayLabel(fallbackLabel)
  )
  const compactBaseLabel = (
    cleanDisplayLabel(primaryItem?.shortLabel) ||
    baseLabel
  )
  const extraCount = displayItems.length
    ? Math.max(0, displayItems.length - 1)
    : isCombination
      ? uniqueById(profiles).filter(profile => (
        !displayProfileIds.has(resolveProfileId(profile))
      )).length
      : Math.max(0, uniqueById(profiles).length - 1)

  return {
    primaryItem,
    displayItems,
    label: extraCount > 0
      ? `${baseLabel} +${extraCount}`
      : baseLabel,
    compactLabel: extraCount > 0
      ? `${compactBaseLabel} +${extraCount}`
      : compactBaseLabel,
    variant: isCombination
      ? 'combination'
      : 'default',
    isCombination,
    tooltipTitle: (
      cleanDisplayLabel(display.label) ||
      cleanDisplayLabel(primaryItem?.label) ||
      buildScoutNearProfileLabel(player) ||
      'פרופילי סקאוט'
    ),
    tooltipItems: buildProfileTooltipItems({
      profiles,
      display,
    }),
  }
}
