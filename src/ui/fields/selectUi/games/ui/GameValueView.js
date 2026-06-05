// ui/fields/selectUi/games/ui/GameValueView.js

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

export default function GameValueView({ option, placeholder = 'בחר משחק' }) {
  if (!option) {
    return (
      <Typography level="body-sm" sx={sx.placeholderText}>
        {placeholder}
      </Typography>
    )
  }

  return (
    <Box sx={sx.valueRoot}>
      <Box sx={sx.valueTop}>
        <Typography level="body-sm" noWrap sx={sx.teamText}>
          {option.teamName}
        </Typography>

        <Typography level="body-xs" sx={sx.vsText}>
          נגד
        </Typography>

        <Typography level="body-sm" noWrap sx={sx.valueOpponentText}>
          {option.opponentName}
        </Typography>

        <Typography level="body-xs" sx={sx.valueMobileDate}>
          {option.dateLabel}
        </Typography>
      </Box>

      <Box sx={sx.valueBottom}>
        <Typography level="body-xs" sx={sx.valueDesktopDate}>
          {option.dateLabel}
        </Typography>

        <MetaChip
          label={option.statusMeta?.label}
          color={option.statusMeta?.color || 'neutral'}
          icon={option.statusMeta?.icon}
          sx={sx.valueMetaChip}
        />

        <MetaChip
          label={option.typeMeta?.label}
          color="neutral"
          icon={option.typeMeta?.icon}
          sx={sx.valueMetaChip}
        />

        <MetaChip
          label={option.resultMeta?.label}
          color={option.resultMeta?.color || 'neutral'}
          icon={option.resultMeta?.icon}
          sx={sx.valueMetaChip}
        />

        <MetaChip
          label={option.homeAwayMeta?.label}
          color={option.homeAwayMeta?.color || 'neutral'}
          icon={option.homeAwayMeta?.icon}
          sx={sx.valueMetaChip}
        />
      </Box>
    </Box>
  )
}
