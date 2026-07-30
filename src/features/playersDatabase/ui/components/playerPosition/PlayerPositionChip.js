// features/playersDatabase/ui/components/playerPosition/PlayerPositionChip.js

import { Chip } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import {
  LAYER_TITLES,
  POSITION_LAYERS,
} from '../../../../../shared/players/players.constants.js'
import { getPlayerGeneralPosition } from '../../../../../shared/players/player.positions.utils.js'
import { playerPositionChipSx as sx } from './sx/playerPositionChip.sx.js'

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
    <Chip
      size='sm'
      variant={selected ? 'soft' : 'outlined'}
      startDecorator={selected ? iconUi({ id: iconId, size: 'sm' }) : null}
      onClick={onClick}
      sx={sx.root({
        selected,
        clickable: Boolean(onClick),
        buttonLike,
      })}
    >
      {label || 'לא הוגדרה'}
    </Chip>
  )
}
