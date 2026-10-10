// src/features/playersDatabase/ui/pages/teamPage/positionClassification/model/teamPositionScoutProfile.presentation.js

import { buildScoutProfileChipModel } from '../../../../components/scout/profile/scoutProfileChip.model.js'
import { buildScoutCompactView } from '../../../../components/scout/shared/scoutDisplay.model.js'

const buildPlayerScoutProfile = player => {
  const scout = player?.scout || {}
  const profiles = Array.isArray(player?.scoutProfiles)
    ? player.scoutProfiles
    : Array.isArray(player?.scoutSignals)
      ? player.scoutSignals
      : Array.isArray(scout.profiles)
        ? scout.profiles
        : []
  const combinations = Array.isArray(player?.scoutCombinations)
    ? player.scoutCombinations
    : Array.isArray(scout.combinations)
      ? scout.combinations
      : []
  const display = player?.scoutProfileDisplay || scout.display || {}
  const profilePlayer = {
    ...player,
    scoutProfiles: profiles,
    scoutCombinations: combinations,
    scoutProfileDisplay: display,
    profile: player?.profile || display.label || '',
  }

  return {
    player: profilePlayer,
    view: buildScoutCompactView({
      profiles,
      combinations,
      display,
      fallbackLabel: profilePlayer.profile,
      player: profilePlayer,
    }),
  }
}

const resolveProfileDepthPct = source => {
  const percentageCandidates = [
    source?.profileDepth?.depthPct,
    source?.profileStrength?.depthPct,
    source?.depthPct,
  ]
  const percentage = percentageCandidates.find(value => Number.isFinite(Number(value)))
  if (percentage !== undefined) return Number(percentage)

  const depthCandidates = [
    source?.profileDepth?.depth,
    source?.profileStrength?.depth,
    source?.depth,
  ]
  const depth = depthCandidates.find(value => Number.isFinite(Number(value)))
  return depth === undefined ? null : Number(depth) * 100
}

const resolveCombinationDepthPct = ({ combination, profiles }) => {
  const componentProfileIds = new Set(
    (Array.isArray(combination?.matchedProfileIds)
      ? combination.matchedProfileIds
      : Array.isArray(combination?.profileIds)
        ? combination.profileIds
        : [])
      .filter(Boolean)
  )
  const componentDepths = (Array.isArray(profiles) ? profiles : [])
    .filter(profile => componentProfileIds.has(profile?.profileId || profile?.id))
    .map(resolveProfileDepthPct)
    .filter(depthPct => depthPct !== null)

  return componentDepths.length ? Math.max(...componentDepths) : null
}

export const buildTableScoutProfileChip = player => {
  const profile = buildPlayerScoutProfile(player)
  const primaryProfile = profile.view.primaryItem

  if (!primaryProfile) return null

  const isCombination = primaryProfile.type === 'combination'
  const profiles = Array.isArray(profile.player?.scoutProfiles)
    ? profile.player.scoutProfiles
    : []
  const combinationDepthPct = isCombination
    ? resolveCombinationDepthPct({
      combination: primaryProfile.source,
      profiles,
    })
    : null
  const sourceDepthPct = combinationDepthPct !== null
    ? combinationDepthPct
    : resolveProfileDepthPct(primaryProfile.source)
  const displayDepthPctValue = resolveProfileDepthPct(
    profile.player?.scoutProfileDisplay
  )
  const displayDepthPct = sourceDepthPct === null && displayDepthPctValue !== null
    ? displayDepthPctValue
    : sourceDepthPct

  const chipProps = {
    profileId: primaryProfile.id,
    label: primaryProfile.shortLabel || primaryProfile.label,
    iconId: primaryProfile.iconId,
    profile: primaryProfile.source,
    profiles,
    depthPct: displayDepthPct,
    extraCount: isCombination ? 0 : Math.max(0, ((profile.view.displayItems && profile.view.displayItems.length) || 0) - 1),
    isCombination,
  }

  return buildScoutProfileChipModel(chipProps) ? chipProps : null
}
