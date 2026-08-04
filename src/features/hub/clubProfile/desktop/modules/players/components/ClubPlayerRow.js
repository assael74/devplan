// clubProfile/desktop/modules/players/components/ClubPlayerRow.js

import React from 'react'
import { Box, Chip, Divider, Typography } from '@mui/joy'

import JoyStarRatingStatic from '../../../../../../../ui/domains/ratings/JoyStarRating.js'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

import InfoSection from './sections/InfoSection.js'
import PositionsSection from './sections/PositionsSection.js'
import PerformanceSection from './sections/PerformanceSection.js'

import { listSx as sx } from '../sx/list.sx.js'

const c = getEntityColors('players')

export default function ClubPlayerRow({ row, performance, onEditPosition }) {
  const chip = row?.projectChipMeta || {
    labelH: 'כללי',
    idIcon: 'noneType',
    tone: 'neutral',
    bgColor: '',
    textColor: '',
  }

  const chipSx = {
    ...sx.statusChip,
    ...(chip.tone === 'custom'
      ? {
          bgcolor: chip.bgColor || undefined,
          color: chip.textColor || 'inherit',
        }
      : {}),
  }

  return (
    <Box
      sx={[
        sx.row,
        row?.isKey && sx.rowKey,
        row?.type === 'project' && { boxShadow: `inset 0 0 0 1px ${c.bg}18` },
        row?.active === false && { opacity: 0.76 },
      ]}
    >
      <InfoSection row={row} />

      <Divider orientation="vertical" sx={sx.divider} />

      <PositionsSection row={row} onEditPosition={onEditPosition} />

      <Divider orientation="vertical" sx={sx.divider} />

      <PerformanceSection row={row} performance={performance} />

      <Divider orientation="vertical" sx={sx.divider} />

      <Box sx={sx.ratingCol}>
        <Typography level="body-xs" sx={sx.ratingTitle}>
          יכולת
        </Typography>

        <Box sx={sx.ratingValueRow}>
          <JoyStarRatingStatic value={Number(row?.level) || 0} size="xs" />
          <Typography level="body-xs" sx={sx.ratingNumber}>
            {Number(row?.level) || 0}
          </Typography>
        </Box>
      </Box>

      <Divider orientation="vertical" sx={sx.dividerSoft} />

      <Box sx={sx.statusCol}>
        <Chip
          size="sm"
          variant="soft"
          color={chip.tone === 'custom' ? 'neutral' : chip.tone}
          startDecorator={iconUi({
            id: chip.idIcon,
            sx: chip.textColor ? { color: chip.textColor } : undefined,
          })}
          sx={chipSx}
        >
          {chip.labelH}
        </Chip>
      </Box>
    </Box>
  )
}
