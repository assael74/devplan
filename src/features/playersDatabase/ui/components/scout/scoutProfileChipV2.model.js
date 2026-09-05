import { resolveScoutProfileDefinition } from '../../../../../shared/scouting/players/profiles.js'

const clean = value => String(value || '').trim()

const clampDepthPct = value => {
  const depth = Number(value)

  if (!Number.isFinite(depth)) return null

  return Math.min(100, Math.max(0, depth))
}

export const resolveScoutProfileDepthPct = source => {
  const percentage = [
    source?.profileDepth?.depthPct,
    source?.profileStrength?.depthPct,
    source?.depthPct,
  ].find(value => Number.isFinite(Number(value)))

  if (percentage !== undefined) return Number(percentage)

  const depth = [
    source?.profileDepth?.depth,
    source?.profileStrength?.depth,
    source?.depth,
  ].find(value => Number.isFinite(Number(value)))

  return depth === undefined ? null : Number(depth) * 100
}

export const buildScoutProfileChipV2Model = ({
  profileId = '',
  label = '',
  iconId = '',
  depthPct,
  extraCount = 0,
  isFilter = false,
  isCombination = false,
  shortLabel = false,
  tooltip = '',
} = {}) => {
  const providedDepthPct = clampDepthPct(depthPct)
  const resolvedDepthPct = providedDepthPct === null && isFilter ? 100 : providedDepthPct

  // עומק חסר אינו פרופיל סקאוט להצגה, למעט צ'יפ פילטר שמוצג מלא.
  if (resolvedDepthPct === null || resolvedDepthPct <= 0) return null

  const definition = resolveScoutProfileDefinition(profileId)
  const resolvedLabel = shortLabel
    ? definition?.shortLabel || clean(label) || definition?.label || 'פרופיל סקאוט'
    : clean(label) || definition?.shortLabel || definition?.label || 'פרופיל סקאוט'
  const resolvedExtraCount = Math.max(0, Number.parseInt(extraCount, 10) || 0)

  return {
    profileId: clean(profileId),
    iconId: clean(iconId) || definition?.idIcon || 'performanceProfile',
    label: resolvedLabel,
    fullLabel: definition?.label || resolvedLabel,
    depthPct: Math.round(resolvedDepthPct),
    extraCount: resolvedExtraCount,
    endLabel: resolvedExtraCount > 0 ? `+${resolvedExtraCount}` : `${Math.round(resolvedDepthPct)}%`,
    showEndLabel: !isFilter || resolvedExtraCount > 0,
    isFilter,
    isCombination,
    tooltip: clean(tooltip),
  }
}
