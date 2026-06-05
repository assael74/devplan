// ui/fields/selectUi/games/ui/GameOptionRow.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../core/icons/iconUi.js'
import { gamesSelectSx as sx } from '../sx/gamesSelect.sx.js'

function MetaChip({ label, color = 'neutral', icon, sx: chipSx }) {
  if (!label) return null

  return (
    <Chip
      size="sm"
      variant="soft"
      color={color}
      startDecorator={icon ? iconUi({ id: icon, size: 'sm' }) : null}
      sx={chipSx}
    >
      {label}
    </Chip>
  )
}

function StatsChip({ option }) {
  if (!option?.hasStats) return null

  return (
    <Chip size="sm" color="warning" variant="soft" sx={sx.rowFixedChip}>
      {option.statsStatusLabel || 'יש סטטיסטיקה'}
    </Chip>
  )
}

function AlreadyInGameChip({ option }) {
  if (!option?.isAlreadyInGame) return null

  return (
    <Chip size="sm" color="neutral" variant="soft" sx={sx.rowFixedChip}>
      כבר קיים
    </Chip>
  )
}

function DisabledReasonChip({ option }) {
  if (!option?.disabledReason) return null

  return (
    <Chip size="sm" color="danger" variant="soft" sx={sx.rowFixedChip}>
      {option.disabledReason}
    </Chip>
  )
}

export default function GameOptionRow({ option }) {
  if (!option) return null

  return (
    <Box sx={sx.rowRoot(option.disabled)}>
      <Box sx={sx.rowTop}>
        <Box sx={sx.rowMain}>
          <Box sx={sx.iconBox}>{iconUi({ id: 'games', size: 'sm' })}</Box>

          <Typography level="body-sm" noWrap sx={sx.teamText}>
            {option.teamName}
          </Typography>

          <Typography level="body-xs" sx={sx.vsText}>
            נגד
          </Typography>

          <Typography level="body-sm" noWrap sx={sx.opponentText}>
            {option.opponentName}
          </Typography>

          <Typography level="body-xs" sx={sx.rowMobileDate}>
            {option.dateLabel}
          </Typography>
        </Box>

        <Box sx={sx.rowDesktopTopChips}>
          <StatsChip option={option} />
          <AlreadyInGameChip option={option} />
        </Box>
      </Box>

      <Box sx={sx.rowBottom}>
        <Typography level="body-xs" sx={sx.rowDesktopDate}>
          {option.dateLabel}
        </Typography>

        <MetaChip
          label={option.statusMeta?.label}
          color={option.statusMeta?.color || 'neutral'}
          icon={option.statusMeta?.icon}
          sx={sx.rowMetaChip}
        />

        <MetaChip
          label={option.typeMeta?.label}
          color="neutral"
          icon={option.typeMeta?.icon}
          sx={sx.rowDesktopOnlyChip}
        />

        <MetaChip
          label={option.resultMeta?.label}
          color={option.resultMeta?.color || 'neutral'}
          icon={option.resultMeta?.icon}
          sx={sx.rowDesktopOnlyChip}
        />

        <MetaChip
          label={option.homeAwayMeta?.label}
          color={option.homeAwayMeta?.color || 'neutral'}
          icon={option.homeAwayMeta?.icon}
          sx={sx.rowMetaChip}
        />

        <Box sx={sx.rowMobileChips}>
          <StatsChip option={option} />
          <AlreadyInGameChip option={option} />
        </Box>

        {option.isAlreadyInGame ? (
          <Box sx={sx.rowSelectionChips}>
            <Chip
              size="sm"
              variant={option.isSelected ? 'solid' : 'soft'}
              color={option.isSelected ? 'primary' : 'neutral'}
              sx={sx.rowFixedChip}
            >
              {option.isSelected ? 'נבחר' : 'לא נבחר'}
            </Chip>

            <Chip
              size="sm"
              variant={option.isStarting ? 'solid' : 'soft'}
              color={option.isStarting ? 'success' : 'neutral'}
              sx={sx.rowFixedChip}
            >
              {option.isStarting ? 'פותח' : 'ספסל'}
            </Chip>
          </Box>
        ) : null}

        <DisabledReasonChip option={option} />
      </Box>
    </Box>
  )
}
