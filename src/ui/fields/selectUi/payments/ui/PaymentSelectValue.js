// ui/fields/selectUi/payments/ui/PaymentSelectValue.js

import React from 'react'
import { Box, Typography, Chip } from '@mui/joy'
import { iconUi } from '../../../../core/icons/iconUi.js'

export default function PaymentSelectValue({ opt, chip }) {
  if (!opt) return null

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      <Chip
        size="sm"
        variant="soft"
        color={opt?.color || 'neutral'}
        startDecorator={iconUi({ id: opt?.idIcon || 'payments', size: 'sm' })}
        sx={{ flexShrink: 0 }}
      >
        {opt?.label}
      </Chip>

      {chip && opt?.value ? (
        <Typography level="body-xs" sx={{ color: 'text.tertiary' }} noWrap>
          {opt.value}
        </Typography>
      ) : null}
    </Box>
  )
}
