/// ui/fields/checkUi/payments/PaymentStatusSelector.js

import * as React from 'react'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Box, Typography, Sheet } from '@mui/joy'

import { optionSheetProps } from './sx/checkUiPayments.sx.js'
import { getPaymentStatusList } from '../../../../shared/payments/payments.utils.js'
import { iconUi } from '../../../core/icons/iconUi.js'

export default function PaymentStatusSteps({ value, onChange, size = 'sm' }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const steps = getPaymentStatusList().filter((item) => !item.disabled && item.id !== '')

  React.useEffect(() => {
    if (!value && steps.length > 0) onChange(steps[0].id)
  }, [value, steps, onChange])

  return (
    <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 0.5 }}>
      {steps.map(({ id, labelH, idIcon }) => {
        const isSelected = value === id
        const isDone = id === 'done'
        const isSoftRed = id === 'new' || id === 'invoice'

        return (
          <Sheet
            key={id}
            onClick={() => onChange(id)}
            {...optionSheetProps({ isMobile, isSelected, isDone, isSoftRed, id })}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.25 }}>
              {iconUi({ id: idIcon, size })}
            </Box>

            <Typography
              level="body-sm"
              sx={{
                fontSize: isMobile ? 11 : 13,
                fontWeight: isSelected ? 700 : 600,
                lineHeight: 1.2,
                whiteSpace: 'normal',
              }}
            >
              {labelH}
            </Typography>
          </Sheet>
        )
      })}
    </Box>
  )
}
