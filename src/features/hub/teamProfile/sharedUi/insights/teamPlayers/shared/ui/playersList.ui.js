// TEAMPROFILE/sharedUi/insights/teamPlayers/shared/ui/playersList.ui.js

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('status')

export const emptyArray = []

const roleIcons = {
  key: 'keyPlayer',
  core: 'corePlayer',
  rotation: 'rotation',
  fringe: 'fringe',
}

export const toText = value => {
  return value == null ? '' : String(value).trim()
}

export const getPlayerName = player => {
  return player.playerFullName || player.fullName || player.name || 'שחקן'
}

export const getPlayerPositionLabel = player => {
  return (
    toText(player.positionLabel) ||
    toText(player.primaryPosition) ||
    '-'
  )
}

export const getPlayerLayerLabel = player => {
  return (
    toText(player.layerLabel) ||
    toText(player.layerKey) ||
    'שכבה'
  )
}

export const getPlayerRoleLabel = player => {
  return toText(player.squadRoleLabel) || 'מעמד'
}

export const getPlayerRoleIcon = player => {
  return roleIcons[player.squadRole] || 'keyPlayer'
}

export const getTvaColor = value => {
  const n = Number(value)

  if (n > 0) return 'success'
  if (n < 0) return 'warning'

  return 'neutral'
}

export const normalizePlayersSource = sourceType => {
  if (sourceType === 'role' || sourceType === 'outcomeRole') {
    return 'outcomeRole'
  }

  if (sourceType === 'position' || sourceType === 'outcomePosition') {
    return 'outcomePosition'
  }

  if (sourceType === 'buildRole') return 'buildRole'
  if (sourceType === 'buildPosition') return 'buildPosition'

  return 'build'
}

export const getPlayerTopMetrics = ({ player, sourceType }) => {
  const source = normalizePlayersSource(sourceType)

  if (!['outcomeRole', 'outcomePosition'].includes(source)) {
    return emptyArray
  }

  return [
    {
      id: 'rating',
      label: player.ratingLabel || '-',
      color: 'neutral',
    },
    {
      id: 'tva',
      label: player.tvaLabel || player.tva || '0',
      color: getTvaColor(player.tva),
    },
  ]
}

export const getBuildChips = player => {
  return [
    {
      id: 'pos-icon',
      icon: player.primaryPosition || 'positions',
      label: '',
      iconOnly: true,
    },
    {
      id: 'position',
      icon: player.primaryPosition || 'positions',
      label: getPlayerPositionLabel(player),
    },
    {
      id: 'role',
      icon: getPlayerRoleIcon(player),
      label: getPlayerRoleLabel(player),
    },
  ]
}

export const getOutcomeRoleChips = player => {
  return [
    {
      id: 'position',
      icon: player.primaryPosition || 'positions',
      label: getPlayerPositionLabel(player),
    },
    {
      id: 'role',
      icon: getPlayerRoleIcon(player),
      label: getPlayerRoleLabel(player),
    },
  ]
}

export const getOutcomePositionChips = player => {
  return [
    {
      id: 'position',
      icon: player.primaryPosition || 'positions',
      label: getPlayerPositionLabel(player),
    },
    {
      id: 'layer',
      icon: player.layerKey || 'layers',
      label: getPlayerLayerLabel(player),
    },
  ]
}

export const getPlayerFooterItems = ({ player, sourceType }) => {
  const source = normalizePlayersSource(sourceType)

  if (source === 'outcomeRole') {
    return getOutcomeRoleChips(player)
  }

  if (source === 'outcomePosition') {
    return getOutcomePositionChips(player)
  }

  return getBuildChips(player)
}

export const getScoringMetricByItemId = id => {
  if (id === 'rating') return 'efficiency'
  if (id === 'tva') return 'impact'

  return null
}

export const getMetricSolidColor = item => {
  return c?.[item?.color]?.solid || c?.info?.solid
}
