// teamProfile/desktop/modules/players/components/TeamPlayerRow.js

import React from 'react'
import { Box, Checkbox, Chip, IconButton, Tooltip, Typography } from '@mui/joy'
import EditRounded from '@mui/icons-material/EditRounded'

import JoyStarRatingStatic from '../../../../../../../ui/domains/ratings/JoyStarRating.js'
import EntityActionsMenu from '../../../../../sharedProfile/EntityActionsMenu.js'
import { TEAM_PLAYERS_PRINT_MODES } from '../../../../../../reports/model/teams/players/print/index.js'

import PlayerIdentityCell from './sections/PlayerIdentityCell.js'
import PerformanceCell from './sections/PerformanceCell.js'
import PositionsCell from './sections/PositionsCell.js'
import TargetsCell from './sections/TargetsCell.js'

import { getSquadRoleMeta } from '../../../../../../../shared/players/player.squadRole.utils.js'
import { SEASON_PLAN_STATUS, SEASON_PLAN_STATUS_OPTIONS } from '../../../../../../../shared/players/players.constants.js'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

import { PLAYER_ROW_METRIC_TONES } from './sections/ui/playerMetricTones.js'
import { rowSx as sx } from '../sx/row.sx.js'

const c = getEntityColors('players')

const VIEW_MODES = {
  OVERVIEW: 'overview',
  PERFORMANCE: 'performance',
}

function getSeasonPlanStatusMeta(row = {}) {
  const rawStatus = row?.seasonPlanStatus || row?.player?.seasonPlanStatus || ''

  if (rawStatus && typeof rawStatus === 'object') {
    return {
      value: rawStatus.value || SEASON_PLAN_STATUS.NOT_REVIEWED,
      label: rawStatus.shortLabel || rawStatus.label || 'לא נבחן',
      iconId: rawStatus.iconId || 'notReviewed',
      iconColor: rawStatus.iconColor || '#64748B',
      tone: rawStatus.tone || 'neutral',
    }
  }

  const value = String(rawStatus?.value || rawStatus).trim() || SEASON_PLAN_STATUS.NOT_REVIEWED
  const option = SEASON_PLAN_STATUS_OPTIONS.find(item => item.value === value)

  return {
    value: option?.value || SEASON_PLAN_STATUS.NOT_REVIEWED,
    label: option?.shortLabel || option?.label || 'לא נבחן',
    iconId: option?.idIcon || 'notReviewed',
    iconColor: option?.color || '#64748B',
    tone: option?.tone || 'neutral',
  }
}

function PotentialCell({ row }) {
  return (
    <Box sx={sx.potentialCell}>
      <Typography level="body-xs" sx={sx.potentialLabel}>
        פוט׳ {Number(row?.level) || 0}
      </Typography>

      <JoyStarRatingStatic value={Number(row?.level) || 0} size="xs" />
    </Box>
  )
}

function ProjectCell({ row }) {
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
        startDecorator={iconUi({ id: chip.idIcon, sx: chip.textColor ? { color: chip.textColor } : undefined })}
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

function RoleCell({ row }) {
  const squadRoleMeta = getSquadRoleMeta(row, c)

  return (
    <Box sx={sx.cell}>
      <Chip
        size="sm"
        variant="soft"
        color="warning"
        startDecorator={iconUi({ id: squadRoleMeta.iconId, sx: { color: squadRoleMeta.color } })}
        sx={sx.chip}
      >
        {squadRoleMeta.label}
      </Chip>
    </Box>
  )
}

function SeasonPlanCell({ row }) {
  const statusMeta = getSeasonPlanStatusMeta(row)

  return (
    <Box sx={sx.cell}>
      <Chip
        size="sm"
        variant="soft"
        color={statusMeta.tone || 'neutral'}
        startDecorator={iconUi({ id: statusMeta.iconId, sx: { color: statusMeta.iconColor } })}
        sx={sx.chip}
      >
        {statusMeta.label}
      </Chip>
    </Box>
  )
}

function ActionsCell({ row, onEditPlayer }) {
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

function OverviewCells({ row, loaded, onEditPosition, showSeasonPlanStatus }) {
  return (
    <>
      <PositionsCell row={row} onEditPosition={onEditPosition} />
      <PotentialCell row={row} />
      <ProjectCell row={row} />
      {showSeasonPlanStatus ? <SeasonPlanCell row={row} /> : <RoleCell row={row} />}
      <TargetsCell row={row} loaded={loaded} metricTones={PLAYER_ROW_METRIC_TONES} />
    </>
  )
}

function PerformanceViewCells({ row, loaded }) {
  return (
    <>
      <PositionsCell row={row} compact />
      <RoleCell row={row} />
      <TargetsCell row={row} loaded={loaded} metricTones={PLAYER_ROW_METRIC_TONES} />
      <PerformanceCell row={row} loaded={loaded} metricTones={PLAYER_ROW_METRIC_TONES} />
    </>
  )
}

export default function TeamPlayerRow({
  row,
  loaded,
  viewMode = VIEW_MODES.OVERVIEW,
  managementPrintMode,
  selectionMode = false,
  selected = false,
  onToggleSelection,
  onEditPosition,
  onEditPlayer,
  onAvatarClick,
}) {
  const isPerformanceView = viewMode === VIEW_MODES.PERFORMANCE
  const showSeasonPlanStatus = managementPrintMode === TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN

  function handleRowClick() {
    if (!selectionMode) return
    onToggleSelection?.(row?.id)
  }

  return (
    <Box
      onClick={handleRowClick}
      sx={[
        sx.row,
        isPerformanceView && sx.rowPerformanceView,
        selectionMode && sx.rowSelectionMode,
        selectionMode && isPerformanceView && sx.rowPerformanceSelectionMode,
        selectionMode && sx.rowSelectable,
        selected && sx.rowSelected,
        row?.isKey && sx.rowKey,
        row?.type === 'project' && sx.rowProject,
        row?.active === false && sx.rowInactive,
      ]}
    >
      {selectionMode ? (
        <Box sx={sx.selectionCell} onClick={event => event.stopPropagation()}>
          <Checkbox checked={selected} onChange={() => onToggleSelection?.(row?.id)} />
        </Box>
      ) : null}

      <PlayerIdentityCell row={row} onAvatarClick={selectionMode ? undefined : onAvatarClick} />

      {isPerformanceView ? (
        <PerformanceViewCells row={row} loaded={loaded} />
      ) : (
        <OverviewCells
          row={row}
          loaded={loaded}
          onEditPosition={selectionMode ? undefined : onEditPosition}
          showSeasonPlanStatus={showSeasonPlanStatus}
        />
      )}

      {selectionMode ? <Box sx={sx.actionsPlaceholder} /> : <ActionsCell row={row} onEditPlayer={onEditPlayer} />}
    </Box>
  )
}
