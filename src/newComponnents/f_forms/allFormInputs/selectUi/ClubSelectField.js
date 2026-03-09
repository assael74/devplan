import React, { useMemo } from 'react';
import { iconUi } from '../../../b_styleObjects/icons/IconIndex.js'
import { Autocomplete, Typography } from '@mui/joy';
import { FormControl, FormLabel, FormHelperText } from '@mui/joy';
import Input from '@mui/joy/Input';

export default function ClubSelectField({
  required,
  value,
  onChange,
  options = [],
  disabled,
  error,
  helperText,
  size = 'sm',
  readOnly
}) {
  const filteredOptions = options.map((t) => ({ label: t.clubName, value: t.id }));

  return (
    <>
      <FormControl sx={{ width: '100%' }}>
        <FormLabel required={required} sx={{ fontSize: '12px' }}>שייך מועדון</FormLabel>
        <Autocomplete
          size={size}
          readOnly={readOnly}
          color={error ? 'danger' : 'neutral'}
          options={filteredOptions}
          value={filteredOptions.find((c) => c.value === value) || null}
          onChange={(_, val) => onChange(val?.value || '')}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          startDecorator={iconUi({id: 'clubs'})}
          placeholder="בחר מועדון"
          disabled={disabled}
          variant="soft"
          sx={{ '&:hover': { backgroundColor: '#eef4ff' } }}
        />
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    </>
  );
}
