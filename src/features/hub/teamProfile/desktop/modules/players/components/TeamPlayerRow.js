// teamProfile/desktop/modules/players/components/TeamPlayerRow.js

import React from 'react'
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/joy'
import EditRounded from '@mui/icons-material/EditRounded'

import JoyStarRatingStatic from '../../../../../../../ui/domains/ratings/JoyStarRating.js'
import EntityActionsMenu from '../../../../../sharedProfile/EntityActionsMenu.js'

import PlayerIdentityCell from './sections/PlayerIdentityCell.js'
import PerformanceCell from './sections/PerformanceCell.js'
import PositionsCell from './sections/PositionsCell.js'
import TargetsCell from './sections/TargetsCell.js'

import { getSquadRoleMeta } from '../../../../../../../shared/players/player.squadRole.utils.js'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

import {
  PLAYER_ROW_METRIC_TONES,
} from './sections/ui/playerMetricTones.js'

import { rowSx as sx } from '../sx/row.sx.js'

const c = getEntityColors('players')

const VIEW_MODES = {
  OVERVIEW: 'overview',
  TARGETS: 'targets',
}

const PotentialCell = ({ row }) => {
  return (
    <Box sx={sx.potentialCell}>
      <Typography level="body-xs" sx={sx.potentialLabel}>
        פוט׳ {Number(row?.level) || 0}
      </Typography>

      <JoyStarRatingStatic value={Number(row?.level) || 0} size="xs" />
    </Box>
  )
}

const ProjectCell = ({ row }) => {
  const chip = row?.projectChipMeta || {
    labelH: 'כללי',
    idIcon: 'noneType',
    tone: 'neutral',
    bgColor: '',
    textColor: '',
  }

  return (
    <Box sx={sx.cell}>
      <Chip
        size="sm"
        variant="soft"
        color={chip.tone === 'custom' ? 'neutral' : chip.tone}
        startDecorator={iconUi({
          id: chip.idIcon,
          sx: chip.textColor ? { color: chip.textColor } : undefined,
        })}
        sx={{
          ...sx.chip,
          ...(chip.tone === 'custom'
            ? {
                bgcolor: chip.bgColor || undefined,
                color: chip.textColor || 'inherit',
              }
            : {}),
        }}
      >
        {chip.labelH || 'כללי'}
      </Chip>
    </Box>
  )
}

const RoleCell = ({ row }) => {
  const squadRoleMeta = getSquadRoleMeta(row, c)

  return (
    <Box sx={sx.cell}>
      <Chip
        size="sm"
        variant="soft"
        color="warning"
        startDecorator={iconUi({
          id: squadRoleMeta.iconId,
          sx: { color: squadRoleMeta.color },
        })}
        sx={sx.chip}
      >
        {squadRoleMeta.label}
      </Chip>
    </Box>
  )
}

const ActionsCell = ({ row, onEditPlayer }) => {
  return (
    <Box sx={sx.actionsCell}>
      <Tooltip title="עריכת נתוני שחקן">
        <IconButton size="sm" variant="plain" onClick={() => onEditPlayer(row)}>
          <EditRounded fontSize="sm" />
        </IconButton>
      </Tooltip>

      <EntityActionsMenu
        entityType="player"
        entityId={row?.id}
        entityName={row?.playerFullName}
        metaCounts={row?.metaCounts || null}
        disabled={false}
      />
    </Box>
  )
}

function OverviewCells({ row, loaded, onEditPosition }) {
  return (
    <>
      <PositionsCell row={row} onEditPosition={onEditPosition} />

      <PotentialCell row={row} />

      <ProjectCell row={row} />

      <RoleCell row={row} />

      <PerformanceCell row={row} loaded={loaded} metricTones={PLAYER_ROW_METRIC_TONES} />
    </>
  )
}

function TargetsViewCells({ row, loaded }) {
  return (
    <>
      <PositionsCell row={row} compact />

      <TargetsCell row={row} loaded={loaded} metricTones={PLAYER_ROW_METRIC_TONES} />

      <PerformanceCell row={row} loaded={loaded} metricTones={PLAYER_ROW_METRIC_TONES} />
    </>
  )
}

export default function TeamPlayerRow({
  row,
  loaded,
  viewMode = VIEW_MODES.OVERVIEW,
  onEditPosition,
  onEditPlayer,
  onAvatarClick,
}) {
  const isTargetsView = viewMode === VIEW_MODES.TARGETS

  return (
    <Box
      sx={[
        sx.row,
        isTargetsView && sx.rowTargetsView,
        row?.isKey && sx.rowKey,
        row?.type === 'project' && sx.rowProject,
        row?.active === false && sx.rowInactive,
      ]}
    >
      <PlayerIdentityCell row={row} onAvatarClick={onAvatarClick} />

      {isTargetsView ? (
        <TargetsViewCells
          row={row}
          loaded={loaded}
        />
      ) : (
        <OverviewCells
          row={row}
          loaded={loaded}
          onEditPosition={onEditPosition}
        />
      )}

      <ActionsCell row={row} onEditPlayer={onEditPlayer} />
    </Box>
  )
}
