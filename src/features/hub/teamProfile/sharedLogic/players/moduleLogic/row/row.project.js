// teamProfile/sharedLogic/players/moduleLogic/row/row.project.js

import {
  PLAYERS_TYPES,
  PROJECT_STATUS_CANDIDATE,
} from '../../../../../../../shared/players/players.constants.js'

import {
  norm,
} from './row.helpers.js'

export const getPlayerTypeMeta = (typeId) => {
  return (
    PLAYERS_TYPES.find((item) => item.id === typeId) ||
    PLAYERS_TYPES.find((item) => item.id === 'noneType') ||
    {
      id: 'noneType',
      labelH: 'כללי',
      idIcon: 'noneType',
      disabled: false,
    }
  )
}

export const getProjectStatusMeta = (statusId) => {
  const normalized = norm(statusId)

  if (!normalized) return null

  return PROJECT_STATUS_CANDIDATE.find((item) => {
    return item.id === normalized
  }) || null
}

export const getProjectChipMeta = ({
  type,
  projectStatus,
  typeMeta,
  projectStatusMeta,
}) => {
  const normalizedType = norm(type) || 'noneType'
  const normalizedStatus = norm(projectStatus)

  if (normalizedType === 'project' || normalizedStatus === 'approved') {
    return {
      id: 'project',
      labelH: 'פרויקט',
      idIcon: 'project',
      tone: 'success',
      bgColor: '',
      textColor: '',
      source: 'project',
    }
  }

  if (projectStatusMeta) {
    return {
      id: 'candidateFlow',
      labelH: projectStatusMeta?.labelH || 'מועמדות',
      idIcon: projectStatusMeta?.idIcon || 'candidate',
      tone: 'custom',
      bgColor: projectStatusMeta?.color || '',
      textColor: projectStatusMeta?.icCol || '',
      source: 'candidate',
    }
  }

  return {
    id: typeMeta?.id || 'noneType',
    labelH: typeMeta?.labelH || 'כללי',
    idIcon: typeMeta?.idIcon || 'noneType',
    tone: 'neutral',
    bgColor: '',
    textColor: '',
    source: 'default',
  }
}
