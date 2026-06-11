// ui/filters/FiltersTrigger.js

import React from 'react'
import { IconButton, Badge, Button, Box } from '@mui/joy'
import { iconUi } from '../../core/icons/iconUi.js'

export default function FiltersTrigger({
  hasActive,
  onClick,
  label = 'פילטרים',
  size = 'sm',
  minWidth = 150,
  buttonSx,
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Button
        onClick={onClick}
        size={size}
        variant={hasActive ? 'soft' : 'outlined'}
        color={hasActive ? 'success' : 'neutral'}
        startDecorator={iconUi({ id: 'filter' })}
        sx={{
          display: { xs: 'none', sm: 'inline-flex' },
          minWidth,
          justifyContent: 'flex-start',
          borderRadius: 'sm',
          fontWeight: 700,
          ...buttonSx,
        }}
      >
        {hasActive ? `${label} (מסונן)` : label}
      </Button>

      <Badge invisible={!hasActive} variant="solid" color="success" size="sm">
        <IconButton
          onClick={onClick}
          size={size}
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
