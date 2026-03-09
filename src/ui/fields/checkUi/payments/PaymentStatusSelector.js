/// ui/fields/checkUi/payments/PaymentStatusSelector.js
import * as React from 'react';
import moment from 'moment';
import { useTheme } from '@mui/joy/styles';
import { boxSheetProps, optionSheetProps } from '../X_Style'
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box, Typography, Sheet } from '@mui/joy';
import { getPaymentStatusMeta } from '../../../../shared/payments/payments.utils.js'
import { iconUi } from '../../../core/icons/iconUi.js';

export default function PaymentStatusSteps({ value, onChange, size = 'sm' }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const steps = getPaymentStatusMeta(isMobile).filter(
    (item) => !item.disabled && item.id !== ''
  );

  const currentIndex = steps.findIndex((s) => s.id === value.id);

  // אם אין ערך, בחר את הראשון כברירת מחדל
  React.useEffect(() => {
    if (!value && steps.length > 0) {
      onChange(steps[0].id);
    }
  }, [value, steps, onChange]);

  return (
    <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 1 }}>
      {steps.map(({ id, labelH, idIcon }, index) => {
        const isSelected = value?.id === id;
        const isCompleted = index < currentIndex || index === steps.length - 1 && value?.id === id;
        const isCurrent = index === currentIndex && value?.id !== steps[steps.length - 1].id;

        const variant = isCurrent ? 'soft' : 'outlined';
        const color = isCurrent
          ? 'danger'
          : isCompleted
          ? 'success'
          : 'neutral';

        return (
          <Sheet
            key={id}
            onClick={() => onChange({id: id, time: moment().format('DD/MM/YYYY')})}
            {...optionSheetProps(isMobile, variant, color, isCurrent)}
          >
            <Box {...boxSheetProps(color)}>
              {index + 1}
            </Box>
            {iconUi({ id: idIcon, size: size })}
            <Typography
              level="body-sm"
              sx={{
                fontSize: isMobile ? '9px' : 'sm',
                whiteSpace: isMobile ? 'pre-line' : '',
              }}
            >
              {labelH}
            </Typography>
          </Sheet>
        );
      })}
    </Box>
  );
}
