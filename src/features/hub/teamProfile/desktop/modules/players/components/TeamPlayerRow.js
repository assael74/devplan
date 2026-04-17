// teamProfile/modules/players/components/TeamPlayerRow.js

import React from 'react'
import { Box, Chip, Divider, IconButton, Tooltip, Typography } from '@mui/joy'
import EditRounded from '@mui/icons-material/EditRounded'

import JoyStarRatingStatic from '../../../../../../../ui/domains/ratings/JoyStarRating.js'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import EntityActionsMenu from '../../../../../sharedProfile/EntityActionsMenu.js'

import InfoSection from './sections/InfoSection.js'
import PositionsSection from './sections/PositionsSection.js'

import { teamPlayersListSx as sx } from '../sx/teamPlayers.list.sx.js'

export default function TeamPlayerRow({
  row,
  onEditPlayer,
  onAvatarClick,
  onOpenEdit,
  onEditPosition,
}) {
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
        row?.type === 'project' && sx.rowProject,
        row?.active === false && sx.rowInactive,
      ]}
    >
      <InfoSection row={row} onAvatarClick={onAvatarClick} />

      <Divider orientation="vertical" />

      <PositionsSection row={row} onEditPosition={onEditPosition} />

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

      <Divider orientation="vertical" />

      <Box sx={sx.endActions}>
        <Tooltip title="עריכת נתוני שחקן">
          <IconButton size="sm" variant="plain" onClick={() => onEditPlayer(row)}>
            <EditRounded fontSize="sm" />
          </IconButton>
        </Tooltip>

        <EntityActionsMenu
          entityType="player"
          entityId={row?.id}
          entityName={row?.fullName}
          metaCounts={row?.metaCounts || null}
          disabled={false}
        />
      </Box>
    </Box>
  )
}
