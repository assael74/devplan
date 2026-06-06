// teamProfile/desktop/modules/players/components/print/ui/print.playerRow.js

import {
  buildPositionsCellModel,
} from '../../sections/ui/positionsCell.ui.js'

import {
  buildTargetsCellModel,
} from '../../sections/ui/targetsCell.ui.js'

import {
  getSquadRoleMeta,
} from '../../../../../../../../../shared/players/player.squadRole.utils.js'

import {
  isDefensivePlayerTargetLayer,
} from '../../../../../../../../../shared/players/targets/playerTargets.sections.js'

import {
  getEntityColors,
} from '../../../../../../../../../ui/core/theme/Colors.js'

import {
  TARGET_PRINT_METRICS,
} from './print.constants.js'

const c = getEntityColors('players')

const getRowPositionLayerKey = row => {
  return (
    row?.generalPositionKey ||
    row?.generalPosition?.layerKey ||
    row?.positionLayer ||
    row?.layerKey ||
    ''
  )
}

export const getPositionsLabel = row => {
  const model = buildPositionsCellModel(row)
  const positions = Array.isArray(row?.positions) ? row.positions : []

  if (model.isEmpty) return 'ללא עמדה'

  return [
    model.mainPosition,
    ...positions.filter(pos => pos && pos !== model.mainPosition),
  ].filter(Boolean).join(', ')
}

export const getPositionPrintItems = row => {
  const model = buildPositionsCellModel(row)
  const positions = Array.isArray(row?.positions) ? row.positions : []

  if (model.isEmpty) return []

  return [
    model.mainPosition,
    ...positions.filter(pos => pos && pos !== model.mainPosition),
  ].filter(Boolean)
}

export const getMainPositionLabel = row => {
  const model = buildPositionsCellModel(row)

  if (model.isEmpty) return 'ללא עמדה'

  return model.mainPosition || 'ללא עמדה'
}

export const getTargetsLabel = row => {
  const model = buildTargetsCellModel(row)
  const items = Array.isArray(model.mainItems) ? model.mainItems : []

  if (items.length === 0) return '—'

  return items
    .map(item => `${item.label ? `${item.label}: ` : ''}${item.value}`)
    .join(' · ')
}

export const getRoleLabel = row => {
  return getSquadRoleMeta(row, c)?.label || '—'
}

export const getRolePrintMeta = row => {
  const meta = getSquadRoleMeta(row, c)
  const label = meta?.label || '—'

  return {
    label: label.replace(/^שחקן\s*/, '').trim() || label,
    iconId: meta?.iconId || 'players',
    color: meta?.color || '',
  }
}

export const getProjectPrintMeta = row => {
  const meta = row?.projectChipMeta || {}

  return {
    label: meta.labelH || row?.projectStatusLabel || 'כללי',
    iconId: meta.idIcon || 'noneType',
    tone: meta.tone || 'neutral',
    bgColor: meta.bgColor || '',
    textColor: meta.textColor || '',
  }
}

export const getTargetPrintItems = row => {
  const model = buildTargetsCellModel(row)
  const items = Array.isArray(model.mainItems) ? model.mainItems : []
  const isDefensivePosition = isDefensivePlayerTargetLayer(getRowPositionLayerKey(row))

  const targetMetrics = isDefensivePosition
    ? TARGET_PRINT_METRICS.filter(target => target.metricKey === 'defense')
    : TARGET_PRINT_METRICS.filter(target => target.metricKey !== 'defense')

  return targetMetrics.map(target => {
    const item = items.find(candidate => candidate?.metricKey === target.metricKey)

    return {
      ...target,
      value: item?.value || '—',
    }
  }).filter(item => item.value !== '—')
}

export const getSquadPrintRow = row => {
  return {
    photo: row?.photo || '',
    name: row?.playerFullName || 'שם שחקן',
    subline: `${row?.birthLabel || '—'} · גיל ${Number.isFinite(row?.age) ? row.age : '—'}`,
    positions: getPositionPrintItems(row),
    role: getRolePrintMeta(row),
    level: Number(row?.level) || 0,
    project: getProjectPrintMeta(row),
    targets: getTargetPrintItems(row),
  }
}
