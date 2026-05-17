// teamProfile/sharedLogic/management/targets/management.targetPosition.js

import {
  formatTargetValue,
  getTeamTargetProfileById,
} from '../../../../../../shared/teams/targets/index.js'

import { safeText } from '../management.safe.js'

export const TARGET_POSITION_LABELS = {
  top: 'צמרת · מקומות 1 - 4',
  midHigh: 'אמצע עליון · מקומות 5 - 8',
  midLow: 'אמצע תחתון · מקומות 9 - 13',
  bottom: 'תחתון · מקום 14 ומטה',
}

const getProfileLabel = (profile) => {
  return (
    profile?.labelH ||
    profile?.label ||
    profile?.title ||
    profile?.name ||
    ''
  )
}

export const resolveTargetPositionLabel = (team = {}) => {
  const targetProfileId = safeText(team.targetProfileId)
  const targetPosition = safeText(team.targetPosition)

  const profileById = getTeamTargetProfileById(targetProfileId)
  const profileByPosition = getTeamTargetProfileById(targetPosition)
  const profileLabel = getProfileLabel(profileById || profileByPosition)

  if (TARGET_POSITION_LABELS[targetPosition]) {
    return TARGET_POSITION_LABELS[targetPosition]
  }

  if (profileLabel) {
    return profileLabel
  }

  if (!targetPosition) {
    return 'לא הוגדר יעד מיקום'
  }

  if (/^\d+$/.test(targetPosition)) {
    return `מקום ${targetPosition}`
  }

  return targetPosition
}

export const buildTargetPositionText = ({
  team,
  values,
}) => {
  const resolvedLabel = resolveTargetPositionLabel(team)

  if (
    resolvedLabel &&
    resolvedLabel !== 'לא הוגדר יעד מיקום'
  ) {
    return resolvedLabel
  }

  const rankRangeLabel = safeText(values?.rankRangeLabel)

  if (rankRangeLabel) {
    return rankRangeLabel
  }

  return 'לא הוגדר יעד מיקום'
}

export const buildTargetPositionHelper = ({
  team,
  values,
}) => {
  const successRate = formatTargetValue(values?.successRate, '%')
  const points = formatTargetValue(values?.points)

  const parts = []

  if (points && points !== '—') {
    parts.push(`יעד נקודות ${points}`)
  }

  if (successRate && successRate !== '—') {
    parts.push(`אחוז הצלחה ${successRate}`)
  }

  const league = safeText(team?.league)

  if (league) {
    parts.push(league)
  }

  return parts.join(' • ')
}
