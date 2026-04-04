// hub/components/preview/views/parts/MetaChips.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import JoyStarRating from '../../../../../../ui/domains/ratings/JoyStarRating'
import { iconUi } from '../../../../../../ui/core/icons/iconUi'
import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'
import { SQUAD_ROLE_OPTIONS } from '../../../../../../shared/players/players.constants.js'

const c = getEntityColors('private')

export function TypeChip({ player }) {
  const isProject = String(player?.type || '') === 'project'

  return (
    <Chip
      size="sm"
      variant="outlined"
      color={isProject ? 'success' : 'danger'}
      startDecorator={iconUi({ id: isProject ? 'project' : 'isNotProject', size: 'sm' })}
    >
      {isProject ? 'פרויקט' : 'לא פרויקט'}
    </Chip>
  )
}

export function SquadRoleChip({ player }) {
  const squadRole = String(player?.squadRole || '').trim()

  const roleMeta = SQUAD_ROLE_OPTIONS.find((item) => item?.value === squadRole)

  return (
    <Chip
      size="sm"
      variant='outlined'
      color={roleMeta ? 'plain' : 'danger'}
      startDecorator={iconUi({ id: roleMeta?.idIcon, sx: { color: roleMeta?.color } })}
      sx={{ border: '1px solid', borderColor: `${roleMeta?.color}55`, fontWeight: 600 }}
    >
      {roleMeta?.label || 'לא הוגדר מעמד בסגל'}
    </Chip>
  )
}

export function LevelStars({ label, value, sx }) {
  const v = value === 0 || value ? Number(value) : null

  return (
    <Box sx={sx.starsWrap}>
      <Typography level="body-xs" sx={sx.starsLabel}>
        {label}
      </Typography>
      <JoyStarRating value={v} size="sm" />
    </Box>
  )
}

export function PrivateChip() {
  return (
    <Chip
      size="sm"
      variant="soft"
      startDecorator={iconUi({id: 'private'})}
      sx={{ bgcolor: c.bg, border: '1px solid', borderColor: 'divider', color: c.text }}
    >
      שחקן בעבודה אישית
    </Chip>
  )
}
