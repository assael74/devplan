/// ui/fields/checkUi/payments/PaymentTypeSelector.js
import * as React from 'react';
import { chipActiveProps } from './sx/checkUiPayments.sx.js';
import { iconUi } from '../../../core/icons/iconUi.js';
import { Box, FormControl, FormLabel, Chip, Typography } from '@mui/joy';

export default function PaymentTypeSelector({
  id,
  label = 'סוג תשלום',
  value = false,
  onChange = () => {},
  trueLabel = 'כן',
  falseLabel = 'לא',
  iconIdFalse = 'toggle',
  iconIdTrue = 'toggle',
  required = false,
  disabled = false,
  size = 'sm',
}) {
  const isMonthly = value === 'monthlyPayment';
  const itemToChange = isMonthly ? 'oneTimePayment' : 'monthlyPayment'

  return (
    <FormControl sx={{ width: '100%' }} disabled={disabled}>
      {label && (
        <Typography level="body-sm" sx={{ fontSize: '12px', lineHeight: 1.2, fontWeight: 700 }}>
          {label} {required && '*'}
        </Typography>
      )}

      <Box>
        <Chip
          variant={isMonthly ? 'solid' : 'outlined'}
          color={isMonthly ? 'success' : 'neutral'}
          startDecorator={iconUi({ id: value })}
          onClick={(e) => {
            e.stopPropagation();
            onChange(itemToChange);
          }}
          {...chipActiveProps}
          size={size}
          sx={{ mt: 1.5 }}
        >
          {isMonthly ? 'חד פעמי' : 'חודשי'}
        </Chip>
      </Box>
    </FormControl>
  );
}
