// hub/components/preview/views/parts/MetaChips.js
import React, { useMemo, useState, useEffect } from 'react'
import { Box, Divider, Button, Chip, Tooltip, Typography } from '@mui/joy'

import JoyStarRating from '../../../../../../ui/domains/ratings/JoyStarRating'
import { iconUi } from '../../../../../../ui/core/icons/iconUi'

export function TypeChip({ player }) {
  const isProject = String(player?.type || '') === 'project'

  return (
    <Chip
      size="sm"
      variant="soft"
      color={isProject ? 'success' : 'danger'}
      startDecorator={iconUi({ id: isProject ? 'project' : 'isNotProject', size: 'sm' })}
    >
      {isProject ? 'פרויקט' : 'לא פרויקט'}
    </Chip>
  )
}

export function KeyPlayerChip({ player }) {
  const isKey = player?.isKey || false

  return (
    <Chip
      size="sm"
      variant="soft"
      color={isKey ? 'success' : 'danger'}
      startDecorator={iconUi({ id: 'keyPlayer', size: 'sm' })}
    >
      שחקן מפתח
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
