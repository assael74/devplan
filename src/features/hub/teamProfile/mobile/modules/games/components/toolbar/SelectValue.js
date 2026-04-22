import React from 'react'
import { Box, Typography, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

export default function SelectValue({
  label,
  icon,
  count,
  fixedWidth,
  color,
}) {
  return (
    <Box sx={{ ...sx.selectValueRow, width: fixedWidth || '100%' }}>
      <Box sx={sx.selectValueMain}>
        {icon ? iconUi({ id: icon, size: 'sm' }) : null}

        <Typography color={color} level="body-sm" noWrap>
          {label}
        </Typography>
      </Box>

      <Chip size="sm" color={color} variant="soft" sx={{ flexShrink: 0 }}>
        {count || 0}
      </Chip>
    </Box>
  )
}
