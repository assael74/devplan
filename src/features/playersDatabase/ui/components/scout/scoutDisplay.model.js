// features/playersDatabase/ui/components/scout/scoutDisplay.model.js

const clean = value => String(value || '').trim()

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

const buildProfileTooltipItems = ({ profiles, display }) => {
  const profileItems = uniqueById(profiles).map(profile => ({
    id: resolveProfileId(profile),
    label: resolveProfileLabel(profile),
  }))
  const seen = new Set(profileItems.map(item => item.id))
  const displayItems = (
    Array.isArray(display?.baseProfiles)
      ? display.baseProfiles
      : []
  ).map(profile => ({
    id: resolveProfileId(profile),
    label: resolveProfileLabel(profile),
  })).filter(item => {
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
      iconId: clean(combination.idIcon) || 'performanceProfile',
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
        iconId: 'performanceProfile',
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
  const isDisplayCombination = display.type === 'combination'
  const displayProfileIds = new Set(resolveDisplayProfileIds(display))
  const fallbackCombination = isDisplayCombination
    ? {
      type: 'combination',
      id: clean(display.id),
      iconId: 'performanceProfile',
      label: clean(display.label) || 'פרופיל משולב',
      profileIds: Array.from(displayProfileIds),
      source: display,
    }
    : null
  const primaryItem = displayItems[0] || fallbackCombination
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
