import { Chip, Tooltip } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { playerPositionChipSx as sx } from './sx/playerPositionChip.sx.js'

export default function PlayerMetaChip({
  label = '',
  startIconId = '',
  endIconId = '',
  tooltip = '',
  selected = false,
  clickable = false,
  buttonLike = false,
  compact = false,
  onClick,
  tooltipSx,
}) {
  const chip = (
    <Chip
      size='sm'
      variant={selected ? 'soft' : 'outlined'}
      startDecorator={startIconId ? iconUi({ id: startIconId, size: 'sm' }) : null}
      endDecorator={endIconId ? iconUi({ id: endIconId, size: 'sm' }) : null}
      onClick={onClick}
      sx={sx.root({ selected, clickable, buttonLike, compact })}
    >
      {label}
    </Chip>
  )

  return tooltip ? (
    <Tooltip
      title={tooltip}
      variant={tooltipSx ? 'plain' : undefined}
      color={tooltipSx ? 'neutral' : undefined}
      slotProps={tooltipSx ? { tooltip: { sx: tooltipSx } } : undefined}
    >
      {chip}
    </Tooltip>
  ) : chip
}
