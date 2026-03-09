import React from 'react';
import { FormControl, FormLabel, Input, Stack, Box } from '@mui/joy';
import moment from 'moment';
import 'moment/locale/he';

export default function DateInputField({
  value = '',
  onChange,
  label = '',
  labelTime = '',
  required = false,
  error = false,
  disabled = false,
  helperText = '',
  size = 'sm',
  context = 'default',
  timeValue = '',
  onTimeChange,
  showFormattedDate = true,
}) {
  const minDate = '1900-01-01';
  const formattedDate = value ? moment(value).locale('he').format('LL') : '';

  return (
    <Stack direction="row" spacing={2} alignItems="flex-end">
      {/* שדה תאריך */}
      <Box>
        <FormControl error={error} required={required}>
          <FormLabel sx={{ fontSize: '12px' }}>
            {label || (context === 'meeting' ? 'תאריך פגישה' : 'תאריך')}
          </FormLabel>
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            variant="soft"
            size={size}
            slotProps={{ input: { min: minDate } }}
            sx={{
              //width: { md: 180, xs: 150 },
              '&:hover': { backgroundColor: '#eef4ff' },
            }}
          />
        </FormControl>
      </Box>

      {/* שדה שעה (רק אם context === 'meeting') */}
      {(context === 'meeting' || context === 'game') && (
        <Box>
          <FormControl error={error} required={required}>
            <FormLabel sx={{ fontSize: '12px' }}>שעה</FormLabel>
            <Input
              type="time"
              value={timeValue || ''}
              onChange={(e) => onTimeChange(e.target.value)}
              disabled={disabled}
              variant="soft"
              size={size}
              sx={{
                width: { md: 150, xs: 100 },
                '&:hover': { backgroundColor: '#eef4ff' },
              }}
            />
          </FormControl>
        </Box>
      )}
    </Stack>
  );
}
