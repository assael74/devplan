import * as React from 'react';
import { chipActiveProps } from './X_Style';
import { iconUi } from '../../core/icons/iconUi.js';
import { Box, FormControl, FormLabel, Chip, Typography } from '@mui/joy';

export default function GenericCheckSelector({
  label = '',
  id,
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
  const isTrue = value === true;

  return (
    <FormControl sx={{ width: '100%' }} disabled={disabled}>
      {label && (
        <Typography level="body-sm" sx={{ fontSize: '12px', lineHeight: 1.4, mb: 0.5, fontWeight: 500 }}>
          {label} {required && '*'}
        </Typography>
      )}

      <Box>
        <Chip
          variant={isTrue ? 'solid' : 'outlined'}
          color={isTrue ? 'success' : 'neutral'}
          startDecorator={iconUi({ id: isTrue ? iconIdTrue : iconIdFalse })}
          onClick={(e) => {
            e.stopPropagation();
            onChange(!isTrue);
          }}
          {...chipActiveProps}
          size={size}
          sx={{ mt: 1.5 }}
        >
          {isTrue ? trueLabel : falseLabel}
        </Chip>
      </Box>
    </FormControl>
  );
}
