//  ui/fields/selectUi/games/ui/GameOptionRow.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../core/icons/iconUi.js'
import { gamesSelectSx as sx } from '../sx/gamesSelect.sx.js'

function MetaChip({ label, color = 'neutral', icon }) {
  if (!label) return null

  return (
    <Chip
      size="sm"
      variant="soft"
      color={color}
      startDecorator={icon ? iconUi({ id: icon, size: 'sm' }) : null}
    >
      {label}
    </Chip>
  )
}

export default function GameOptionRow({ option }) {
  if (!option) return null

  return (
    <Box sx={sx.rowRoot(option.isAlreadyInGame)}>
      <Box sx={sx.rowTop}>
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

        {option.isAlreadyInGame ? (
          <Chip size="sm" color="neutral" variant="soft" sx={sx.existsChip}>
            כבר קיים
          </Chip>
        ) : null}
      </Box>

      <Box sx={sx.rowBottom}>
        <Typography level="body-xs" sx={sx.subText}>
          {option.dateLabel}
        </Typography>

        <MetaChip
          label={option.typeMeta?.label}
          color="neutral"
          icon={option.typeMeta?.icon}
        />

        <MetaChip
          label={option.resultMeta?.label}
          color={option.resultMeta?.color || 'neutral'}
          icon={option.resultMeta?.icon}
        />

        <MetaChip
          label={option.homeAwayMeta?.label}
          color={option.homeAwayMeta?.color || 'neutral'}
          icon={option.homeAwayMeta?.icon}
        />

        {option.isAlreadyInGame ? (
          <>
            <Chip
              size="sm"
              variant={option.isSelected ? 'solid' : 'soft'}
              color={option.isSelected ? 'primary' : 'neutral'}
            >
              {option.isSelected ? 'נבחר' : 'לא נבחר'}
            </Chip>

            <Chip
              size="sm"
              variant={option.isStarting ? 'solid' : 'soft'}
              color={option.isStarting ? 'success' : 'neutral'}
            >
              {option.isStarting ? 'פותח' : 'ספסל'}
            </Chip>
          </>
        ) : null}
      </Box>
    </Box>
  )
}
