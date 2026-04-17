// clubProfile/desktop/modules/players/components/ClubPlayerRow.js

import React from 'react'
import { Box, Chip, Divider, IconButton, Tooltip, Typography } from '@mui/joy'
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded'

import JoyStarRatingStatic from '../../../../../../../ui/domains/ratings/JoyStarRating.js'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import InfoSection from './sections/InfoSection.js'
import PositionsSection from './sections/PositionsSection.js'

import { clubPlayersListSx as sx } from '../sx/clubPlayers.list.sx.js'

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export default function ClubPlayerRow({ row }) {
  const chip = row?.projectChipMeta || {
    labelH: 'כללי',
    idIcon: 'noneType',
    tone: 'neutral',
    bgColor: '',
    textColor: '',
  }

  const chipSx = {
    flexShrink: 0,
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

      <Divider orientation="vertical" />

      <PositionsSection row={row} />

      <Divider orientation="vertical" />

      <Box sx={sx.ratingCol}>
        <Typography level="body-xs" sx={sx.ratingTitle}>
          פוטנציאל ({Number(row?.level) || 0})
        </Typography>

        <JoyStarRatingStatic value={Number(row?.level) || 0} size="xs" />
      </Box>

      <Divider orientation="vertical" />

      <Box sx={sx.statusCol}>
        <Chip
          size="sm"
          variant="soft"
          color={chip.tone === 'custom' ? 'neutral' : chip.tone}
          startDecorator={iconUi({ id: chip.idIcon, sx: chip.textColor ? { color: chip.textColor } : undefined, })}
          sx={chipSx}
        >
          {chip.labelH}
        </Chip>
      </Box>
    </Box>
  )
}
