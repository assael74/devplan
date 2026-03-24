// clubProfile/modules/teams/components/ClubTeamRow.js

import React from 'react'
import { Box, Chip, Divider, IconButton, Tooltip, Typography } from '@mui/joy'
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded'

import JoyStarRatingStatic from '../../../../../../ui/domains/ratings/JoyStarRating.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'

import InfoSection from './sections/InfoSection.js'

import { clubTeamsListSx as sx } from '../sx/clubTeams.list.sx.js'

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

export default function ClubTeamRow({ row, onEdit }) {
  const team = row
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

  const handleEdit = () => {
    if (onEdit) onEdit(team)
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

      <Box sx={sx.actionsCellSx}>
        <Tooltip title="עריכת קבוצה">
          <IconButton size="sm" variant="plain" onClick={handleEdit}>
            {iconUi({ id: 'more' })}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}
