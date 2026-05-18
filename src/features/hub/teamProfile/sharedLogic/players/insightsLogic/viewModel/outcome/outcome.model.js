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

const aspectMeta = {
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

const arr = value => {
  return Array.isArray(value) ? value : emptyArray
}

const getPositionIcon = item => {
  return item.layerKey || item.id || 'positions'
}

const toRoleItem = item => ({
  id: item.id,
  roleId: item.id,
  label: item.label,
  icon: roleIcons[item.id] || 'players',
  players: item.players || emptyArray,
})

const toPositionItem = item => ({
  id: item.id,
  label: item.label,
  icon: getPositionIcon(item),
  layerKey: item.layerKey,
  layerLabel: item.layerLabel,
  players: item.players || emptyArray,
})

const buildRawAspects = structure => {
  return [
    {
      ...aspectMeta.role,
      items: arr(structure?.roles).map(toRoleItem),
    },

    {
      ...aspectMeta.position,
      id: 'positionPrimary',
      items: arr(structure?.positions?.primary).map(toPositionItem),
    },

    {
      ...aspectMeta.position,
      id: 'positionCoverage',
      items: arr(structure?.positions?.coverage).map(toPositionItem),
    },
  ]
}

const withMode = ({
  aspect,
  mode,
  label,
}) => {
  return {
    ...(aspect || {}),
    id: 'position',
    title: aspectMeta.position.title,
    icon: aspectMeta.position.icon,
    mode,
    modeLabel: label,
    groups: arr(aspect?.groups),
    summary: aspect?.summary || {},
    status: aspect?.status || {},
  }
}

const normalizeAspects = aspects => {
  const role = aspects.role || null
  const primary = aspects.positionPrimary || null
  const coverage = aspects.positionCoverage || null

  return {
    ...aspects,

    role,

    position: {
      id: 'position',
      title: aspectMeta.position.title,
      icon: aspectMeta.position.icon,
      defaultMode: 'primary',

      modes: {
        primary: withMode({
          aspect: primary,
          mode: 'primary',
          label: 'ראשית בלבד',
        }),

        coverage: withMode({
          aspect: coverage,
          mode: 'coverage',
          label: 'כל העמדות',
        }),
      },
    },
  }
}

export const buildOutcomeViewModel = ({
  structure,
  playerPerformanceRows,
  performanceScope,
} = {}) => {
  const model = buildTeamInsights({
    playerInsights: arr(playerPerformanceRows),
    aspects: buildRawAspects(structure),
    scope: performanceScope,
  })

  return {
    ...model,
    aspects: normalizeAspects(model.aspects),
  }
}
