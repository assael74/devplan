// C:\projects\devplan\src\ui\forms\ui\abilities\abilitiesCreateForm.renderers.js
import React from 'react'
import { Box, Chip, Tooltip } from '@mui/joy'
import { iconUi } from '../../../core/icons/iconUi'
import { abilitiesLabelsShort } from '../../helpers/abilities/abilitiesCreateForm.helpers.js'

const SCORE_ORDER = [1, 2, 3, 4, 5]

function scoreColor(n) {
  if (n === 5) return 'primary'
  if (n === 4) return 'success'
  if (n === 3) return 'neutral'
  if (n === 2) return 'warning'
  if (n === 1) return 'danger'
  return 'neutral'
}

export function renderScoreChips({
  vaSx,
  id,
  value,
  onPick,
  size = 'sm',
  withLabel = false,
  disabled = false,
}) {
  const vNum = value == null ? null : Number(value)

  return (
    <Box sx={withLabel ? vaSx.itemChips : vaSx.domainScoreBox}>
      {SCORE_ORDER.map((n) => {
        const selected = vNum === n
        const label = withLabel ? `${n} • ${abilitiesLabelsShort[n]}` : `${n}`
        const tip = `${n} - ${abilitiesLabelsShort[n]}`
        return (
          <Chip
            size={size}
            color={scoreColor(n)}
            variant={selected ? 'solid' : 'soft'}
            disabled={disabled}
            onClick={() => !disabled && onPick(n)}
            sx={withLabel ? vaSx.itemScoreChip(selected) : vaSx.scoreChip(selected)}
          >
            {label}
          </Chip>
        )
      })}

      <Chip
        size={size}
        color="neutral"
        variant={vNum == null ? 'outlined' : 'soft'}
        disabled={disabled}
        onClick={() => !disabled && onPick(null)}
        sx={withLabel ? vaSx.itemScoreChip(vNum == null) : vaSx.scoreChip(vNum == null)}
      >
        {iconUi({ id: 'reset', sx: { width: 12, height: 12, mt: 0.2 } })}
      </Chip>
    </Box>
  )
}
