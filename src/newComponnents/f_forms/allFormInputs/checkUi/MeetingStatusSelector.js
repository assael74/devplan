import * as React from 'react';
import { useTheme } from '@mui/joy/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box, Typography, Sheet } from '@mui/joy';
import { statusMeetingList } from '../../../x_utils/optionLists.js'
import { iconUi } from '../../../b_styleObjects/icons/IconIndex.js';
import { optionSheetProps } from './X_Style'

export default function MeetingStatusSteps({ value, onChange, size = 'sm' }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const steps = statusMeetingList.filter((item) => !item.disabled && item.id !== '');

  React.useEffect(() => {
    if (!value?.id && steps.length > 0) {
      onChange({ ...value, id: steps[0].id });
    }
  }, [value, steps, onChange]);


  const handleStepClick = (step) => {
    if (value?.id !== step.id) {
      onChange({ ...value, id: step.id });
    }
  };

  const getColor = (id) => {
    if (id === 'canceled') return 'danger';
    if (id === value?.id) return 'success';
    return 'neutral';
  };
  const currentStep = steps.find((s) => s.id === value.id);
  const currentLabel = currentStep?.labelH || '—';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, py: 1 }}>
    {/* כותרת מעל התיבות */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography level="body-sm" textAlign="center">
          סטטוס נוכחי: <strong>{currentLabel}</strong>
        </Typography>
      </Box>
      {/* שורת התיבות (steps) */}
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 1, justifyContent: 'center' }}>
      {steps.map((step, index) => {
        const { id, labelH, idIcon } = step;
        const isCurrent = value?.id === id;
        const variant = isCurrent ? 'soft' : 'outlined'
        const color = getColor(id)

        return (
          <Sheet key={id} onClick={() => handleStepClick(step)} {...optionSheetProps(isMobile, variant, color, isCurrent)}>
            <Box
              sx={{
                position: 'absolute',
                top: 4,
                left: 6,
                fontSize: '11px',
                color: 'text.secondary',
                fontWeight: 'lg',
              }}
            >
              {index + 1}
            </Box>
            {iconUi({ id: idIcon, size: size })}
            <Typography
              level="body-sm"
              sx={{
                fontSize: isMobile ? '9px' : 'sm',
                whiteSpace: 'pre-line',
                textAlign: 'center',
              }}
            >
              {labelH}
            </Typography>
          </Sheet>
        );
      })}
      </Box>

    </Box>
  );
}
