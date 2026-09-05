// src/features/playersDatabase/ui/components/playerMeta/PlayerPositionChip.js

import {
  LAYER_TITLES,
  POSITION_LAYERS,
} from '../../../../../shared/players/players.constants.js'
import { getPlayerGeneralPosition } from '../../../../../shared/players/player.positions.utils.js'
import PlayerMetaChip from './PlayerMetaChip.js'

const clean = value => String(value || '').trim()

const POSITION_BY_CODE = Object.values(POSITION_LAYERS)
  .flat()
  .reduce((map, position) => {
    map[position.code] = position
    return map
  }, {})

export const getPlayerPositionLabel = code => (
  POSITION_BY_CODE[clean(code)]?.label || ''
)

export const getPlayerLayerLabel = layerKey => (
  LAYER_TITLES[clean(layerKey)] || ''
)

export default function PlayerPositionChip({
  primaryPosition = '',
  positionLayer = '',
  type = 'position',
  buttonLike = false,
  onClick,
}) {
  const positionCode = clean(primaryPosition)
  const resolvedLayer = clean(positionLayer) || getPlayerGeneralPosition({
    positions: positionCode ? [positionCode] : [],
    primaryPosition: positionCode,
  }).layerKey

  const isLayer = type === 'layer'
  const value = isLayer ? resolvedLayer : positionCode
  const label = isLayer
    ? getPlayerLayerLabel(resolvedLayer)
    : getPlayerPositionLabel(positionCode)
  const iconId = isLayer ? resolvedLayer : positionCode
  const selected = Boolean(value && label)

  return (
    <PlayerMetaChip
      label={label || 'לא הוגדרה'}
      startIconId={selected ? iconId : ''}
      selected={selected}
      clickable={Boolean(onClick)}
      buttonLike={buttonLike}
      onClick={onClick}
    />
  )
}
