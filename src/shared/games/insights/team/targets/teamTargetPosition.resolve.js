// shared/games/insights/team/targets/teamTargetPosition.resolve.js

import {
  getTeamGamesTargetProfileById,
  getTeamGamesTargetProfileLabel,
  resolveTeamGamesTargetProfileByPosition,
  resolveTeamGamesTargetProfileByRange,
} from './teamTargets.selectors.js'

export const TEAM_TARGET_POSITION_INPUT_TYPES = {
  EXACT: 'exact',
  RANGE: 'range',
  LABEL: 'label',
}

const toNumber = (value, fallback = null) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const normalizeInputType = (type) => {
  if (type === TEAM_TARGET_POSITION_INPUT_TYPES.EXACT) {
    return TEAM_TARGET_POSITION_INPUT_TYPES.EXACT
  }

  if (type === TEAM_TARGET_POSITION_INPUT_TYPES.RANGE) {
    return TEAM_TARGET_POSITION_INPUT_TYPES.RANGE
  }

  if (type === TEAM_TARGET_POSITION_INPUT_TYPES.LABEL) {
    return TEAM_TARGET_POSITION_INPUT_TYPES.LABEL
  }

  return TEAM_TARGET_POSITION_INPUT_TYPES.LABEL
}

const buildExactDisplayLabel = (value) => {
  const n = toNumber(value)

  if (!n) return ''

  return `מקום ${n}`
}

const buildRangeDisplayLabel = (range = []) => {
  const min = toNumber(range?.[0])
  const max = toNumber(range?.[1])

  if (!min || !max) return ''

  if (min === max) return `מקום ${min}`

  return `מקומות ${min}–${max}`
}

const buildResolvedRankRange = (profile) => {
  if (!Array.isArray(profile?.rankRange)) return null

  return profile.rankRange
}

const buildResolvedLabel = (profile) => {
  return getTeamGamesTargetProfileLabel(profile)
}

const buildResolvedState = ({ inputType, value, range, labelId, profile }) => {
  return {
    inputType,

    value: inputType === TEAM_TARGET_POSITION_INPUT_TYPES.EXACT ? value : null,
    range: inputType === TEAM_TARGET_POSITION_INPUT_TYPES.RANGE ? range : null,
    labelId: inputType === TEAM_TARGET_POSITION_INPUT_TYPES.LABEL ? labelId : null,

    resolvedProfileId: profile?.id || null,
    resolvedRankRange: buildResolvedRankRange(profile),
    resolvedLabel: buildResolvedLabel(profile),

    displayLabel:
      inputType === TEAM_TARGET_POSITION_INPUT_TYPES.EXACT
        ? buildExactDisplayLabel(value)
        : inputType === TEAM_TARGET_POSITION_INPUT_TYPES.RANGE
          ? buildRangeDisplayLabel(range)
          : buildResolvedLabel(profile),

    isResolved: Boolean(profile?.id),
  }
}

export const resolveTeamTargetPosition = ({
  inputType,
  type,
  value,
  position,
  range,
  min,
  max,
  labelId,
  profileId,
} = {}) => {
  const normalizedInputType = normalizeInputType(inputType || type)

  if (normalizedInputType === TEAM_TARGET_POSITION_INPUT_TYPES.EXACT) {
    const exactValue = toNumber(value ?? position)
    const profile = resolveTeamGamesTargetProfileByPosition(exactValue)

    return buildResolvedState({
      inputType: normalizedInputType,
      value: exactValue,
      range: null,
      labelId: null,
      profile,
    })
  }

  if (normalizedInputType === TEAM_TARGET_POSITION_INPUT_TYPES.RANGE) {
    const normalizedRange = Array.isArray(range)
      ? [toNumber(range[0]), toNumber(range[1])]
      : [toNumber(min), toNumber(max)]

    const profile = resolveTeamGamesTargetProfileByRange(normalizedRange)

    return buildResolvedState({
      inputType: normalizedInputType,
      value: null,
      range: normalizedRange,
      labelId: null,
      profile,
    })
  }

  const normalizedLabelId = labelId || profileId
  const profile = getTeamGamesTargetProfileById(normalizedLabelId)

  return buildResolvedState({
    inputType: TEAM_TARGET_POSITION_INPUT_TYPES.LABEL,
    value: null,
    range: null,
    labelId: normalizedLabelId || null,
    profile,
  })
}

export const resolveTeamTargetPositionFromTeam = (team = {}) => {
  const position = team?.targets?.position || team?.targetPosition || null

  if (position?.inputType || position?.type) {
    return resolveTeamTargetPosition(position)
  }

  const benchmarkLevelId =
    team?.targets?.benchmarkLevelId ||
    team?.benchmarkLevelId ||
    team?.targetBenchmarkLevelId ||
    null

  if (benchmarkLevelId) {
    return resolveTeamTargetPosition({
      inputType: TEAM_TARGET_POSITION_INPUT_TYPES.LABEL,
      labelId: benchmarkLevelId,
    })
  }

  const targetPosition =
    team?.targets?.targetPosition ||
    team?.targetPosition ||
    team?.leagueTargetPosition ||
    null

  if (targetPosition) {
    return resolveTeamTargetPosition({
      inputType: TEAM_TARGET_POSITION_INPUT_TYPES.EXACT,
      value: targetPosition,
    })
  }

  return resolveTeamTargetPosition({
    inputType: TEAM_TARGET_POSITION_INPUT_TYPES.LABEL,
    labelId: null,
  })
}
