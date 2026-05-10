// shared/teams/targets/teamTargets.model.js

export const TEAM_TARGET_POSITION_MODE = {
  EXACT: 'exact',
  RANGE: 'range',
}

export const TEAM_TARGET_PROFILE_IDS = {
  BOTTOM: 'bottom',
  MID_LOW: 'midLow',
  MID_HIGH: 'midHigh',
  TOP: 'top',
}

export const TEAM_TARGET_PROFILE_ID_LIST = [
  TEAM_TARGET_PROFILE_IDS.BOTTOM,
  TEAM_TARGET_PROFILE_IDS.MID_LOW,
  TEAM_TARGET_PROFILE_IDS.MID_HIGH,
  TEAM_TARGET_PROFILE_IDS.TOP,
]

export const isExactTargetPositionMode = (mode) => {
  return mode === TEAM_TARGET_POSITION_MODE.EXACT
}

export const isRangeTargetPositionMode = (mode) => {
  return mode === TEAM_TARGET_POSITION_MODE.RANGE
}

export const isTeamTargetProfileId = (value) => {
  return TEAM_TARGET_PROFILE_ID_LIST.includes(String(value || '').trim())
}

export const normalizeTeamTargetPositionMode = (value) => {
  const mode = String(value || '').trim()

  if (isExactTargetPositionMode(mode)) return TEAM_TARGET_POSITION_MODE.EXACT
  if (isRangeTargetPositionMode(mode)) return TEAM_TARGET_POSITION_MODE.RANGE

  return ''
}
