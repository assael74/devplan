// ui/fields/payments/PaymentStatusSelector.js

import * as React from 'react'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import {
  Box,
  FormControl,
  FormHelperText,
  Sheet,
  Typography,
} from '@mui/joy'

import { optionSheetProps } from './sx/paymentCheck.sx.js'
import { getPaymentStatusList } from '../../../shared/payments/payments.utils.js'
import { iconUi } from '../../core/icons/iconUi.js'

export default function PaymentStatusSelector({
  value,
  onChange,
  disabled = false,
  readOnly = false,
  error = false,
  helperText = '',
  size = 'sm',
  sx,
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const steps = React.useMemo(
    () => getPaymentStatusList().filter((item) => !item.disabled && item.id !== ''),
    []
  )

  React.useEffect(() => {
    if (
      value ||
      steps.length === 0 ||
      readOnly ||
      disabled ||
      typeof onChange !== 'function'
    ) return

    onChange(steps[0].id)
  }, [value, steps, onChange, disabled, readOnly])

  const handleChange = (nextValue) => {
    if (disabled || readOnly || typeof onChange !== 'function') return
    onChange(nextValue)
  }

  return (
    <FormControl error={Boolean(error)} disabled={disabled} sx={sx}>
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 0.5 }}>
        {steps.map(({ id, labelH, idIcon }) => {
          const isSelected = value === id
          const isDone = id === 'done'
          const isSoftRed = id === 'new' || id === 'invoice'

          return (
            <Sheet
              key={id}
              onClick={() => handleChange(id)}
              {...optionSheetProps({
                isMobile,
                isSelected,
                isDone,
                isSoftRed,
                id,
              })}
              sx={{
                ...optionSheetProps({
                  isMobile,
                  isSelected,
                  isDone,
                  isSoftRed,
                  id,
                }).sx,
                cursor: disabled || readOnly ? 'default' : 'pointer',
                opacity: disabled ? 0.55 : 1,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 0.25,
                }}
              >
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

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
