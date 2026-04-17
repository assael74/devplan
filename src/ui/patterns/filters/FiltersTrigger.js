// ui/filters/FiltersTrigger.js

import React from 'react'
import { IconButton, Badge, Chip, Box } from '@mui/joy'
import { iconUi } from '../../core/icons/iconUi.js'

export default function FiltersTrigger({ hasActive, onClick, label = 'פילטרים' }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {/* Desktop: Chip קטן עם טקסט ברור */}
      <Chip
        onClick={onClick}
        size="sm"
        variant={hasActive ? 'soft' : 'outlined'}
        color={hasActive ? 'success' : 'neutral'}
        startDecorator={iconUi({ id: 'filter' })}
        sx={{
          display: { xs: 'none', sm: 'inline-flex' },
          cursor: 'pointer',
          borderRadius: 'sm',
        }}
      >
        {hasActive ? `${label} (מסונן)` : label}
      </Chip>

      {/* Mobile: IconButton עם Badge + שינוי וריאנט */}
      <Badge invisible={!hasActive} variant="solid" color="success" size="sm">
        <IconButton
          onClick={onClick}
          size="sm"
          variant={hasActive ? 'soft' : 'outlined'}
          color={hasActive ? 'success' : 'neutral'}
          sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
        >
          {iconUi({ id: 'filter' })}
        </IconButton>
      </Badge>
    </Box>
  )
}
