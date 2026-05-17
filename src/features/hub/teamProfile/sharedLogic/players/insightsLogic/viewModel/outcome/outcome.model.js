// TEAMPROFILE/sharedLogic/players/insightsLogic/viewModel/outcome/outcome.model.js

import {
  buildTeamInsights,
} from '../../../../../../../../shared/teams/insights/index.js'

const emptyArray = []

const roleIcons = {
  key: 'keyPlayer',
  core: 'corePlayer',
  rotation: 'rotation',
  fringe: 'fringe',
  none: 'players',
}

const OUTCOME_ASPECTS = {
  role: {
    id: 'role',
    title: 'תפקוד לפי מעמד',
    icon: 'keyPlayer',
  },

  position: {
    id: 'position',
    title: 'תפקוד לפי עמדה',
    icon: 'positions',
  },
}

const getRoles = structure => {
  return Array.isArray(structure?.roles)
    ? structure.roles
    : emptyArray
}

const getPrimaryPositions = structure => {
  return Array.isArray(structure?.positions?.primary)
    ? structure.positions.primary
    : emptyArray
}

const getRoleItems = structure => {
  return getRoles(structure).map(item => ({
    id: item.id,
    roleId: item.id,
    label: item.label,
    icon: roleIcons[item.id] || 'players',
    players: item.players || emptyArray,
  }))
}

const getPositionIcon = item => {
  return item.layerKey || item.id || 'positions'
}

const getPositionItems = structure => {
  return getPrimaryPositions(structure).map(item => ({
    id: item.id,
    label: item.label,
    icon: getPositionIcon(item),
    layerKey: item.layerKey,
    layerLabel: item.layerLabel,
    players: item.players || emptyArray,
  }))
}

const buildAspects = structure => {
  return [
    {
      ...OUTCOME_ASPECTS.role,
      items: getRoleItems(structure),
    },
    {
      ...OUTCOME_ASPECTS.position,
      items: getPositionItems(structure),
    },
  ]
}

export const buildOutcomeViewModel = ({
  structure,
  playerPerformanceRows,
  performanceScope,
} = {}) => {
  return buildTeamInsights({
    playerInsights: Array.isArray(playerPerformanceRows)
      ? playerPerformanceRows
      : emptyArray,

    aspects: buildAspects(structure),

    scope: performanceScope,
  })
}
