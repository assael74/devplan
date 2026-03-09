import { Box, Stack, Input, Typography, FormControl, FormLabel } from '@mui/joy';
import React from 'react';

export default function GenericTripleInputField({
  label = '',
  id,
  idValue,
  idSuccess,
  labelValue,
  labelSuccess,
  value,
  valueSuccess,
  onChangeValue,
  onChangeSuccess,
  required = false,
  disabled = false,
  disabledSuccess = false,
  placeholder = '',
  placeholderSuccess = '',
  size = 'sm',
  onClick = () => {},
  width = 140,
}) {
  const total = Number(value);
  const success = Number(valueSuccess);
  const showPercent = !isNaN(total) && total > 0 && !isNaN(success) && success >= 0;
  const percent = showPercent ? Math.round((success / total) * 100) : null;
  const isError = showPercent && success > total;

  return (
    <FormControl sx={{ width: '100%' }}>
      {label && (
        <Typography
          fontWeight="md"
          level="body-sm"
          sx={{ fontSize: '12px', lineHeight: 1.4, mb: 0.5, fontWeight: 500, textAlign: 'left' }}
        >
          {label} {required && '*'}
        </Typography>
      )}
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Box>
          <Typography
            level="body-sm"
            sx={{ fontSize: '10px', lineHeight: 1.4, mb: 0.5, fontWeight: 500, textAlign: 'left' }}
          >
            {labelValue}
          </Typography>
          <Input
            type="number"
            value={value ?? ''}
            onClick={onClick}
            onChange={(e) => onChangeValue(Number(e.target.value))}
            placeholder={placeholder || '0'}
            autoComplete="off"
            disabled={disabled}
            size={size}
            color={isError ? 'danger' : 'neutral'}
            sx={{ width: width * 35 / 100 }}
          />
        </Box>
        <Box>
          <Typography
            level="body-sm"
            sx={{ fontSize: '10px', lineHeight: 1.4, mb: 0.5, fontWeight: 500, textAlign: 'left' }}
          >
            {labelSuccess}
          </Typography>
          <Input
            type="number"
            value={valueSuccess ?? ''}
            onClick={onClick}
            onChange={(e) => onChangeSuccess(Number(e.target.value))}
            placeholder={placeholderSuccess || '0'}
            autoComplete="off"
            disabled={disabledSuccess}
            size={size}
            color={isError ? 'danger' : 'neutral'}
            sx={{ width: width * 35 / 100 }}
          />
        </Box>
        <Box>
          <Typography
            level="body-sm"
            sx={{ fontSize: '10px', lineHeight: 1.4, mb: 0.5, fontWeight: 500, textAlign: 'left' }}
          >
            אחוז
          </Typography>
          {showPercent ? (
            <Input
              type="text"
              value={`${percent}%`}
              disabled
              size={size}
              onClick={onClick}
              sx={{ width: width * 30 / 100 }}
            />
          ) : (
            <Box sx={{ width: width * 30 / 100, height: 32 }} />
          )}
        </Box>
      </Stack>
    </FormControl>
  );
}
