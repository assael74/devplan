// ui/fields/selectUi/payments/ui/PaymentOptionRow.js

import React from 'react'
import { Box, Typography, Chip } from '@mui/joy'
import { iconUi } from '../../../../core/icons/iconUi.js'

export default function PaymentOptionRow({ opt }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', minWidth: 0 }}>
      <Chip
        size="sm"
        variant="soft"
        color={opt?.color || 'neutral'}
        startDecorator={iconUi({ id: opt?.idIcon || 'payments', size: 'sm' })}
        sx={{ flexShrink: 0 }}
      >
        {opt?.label || 'סטטוס'}
      </Chip>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography level="body-sm" fontWeight="lg" noWrap>
          {opt?.label || 'סטטוס'}
        </Typography>
      </Box>
    </Box>
  )
}
