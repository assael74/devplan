import React from 'react';
import { Autocomplete, Typography, Box } from '@mui/joy';
import { iconUi } from '../../../b_styleObjects/icons/IconIndex.js'
import { FormControl, FormLabel, FormHelperText } from '@mui/joy';

export default function TeamSelectField({
  value,
  onChange,
  options = [],
  clubId = '',
  disabled,
  helperText,
  required,
  readOnly,
  size = 'sm',
  error
}) {
  const filteredOptions = options
    .filter((t) => t.clubId === clubId)
    .map((t) => ({ label: t.teamName, value: t.id, teamYear: t.teamYear }));
  const selectedOption = filteredOptions.find((t) => t.value === value) || null;

  return (
    <>
      <FormControl sx={{ width: '100%' }}>
        <FormLabel required={required} sx={{ fontSize: '12px' }}>שייך קבוצה</FormLabel>
        <Autocomplete
          size={size}
          readOnly={readOnly}
          color={error ? 'danger' : 'neutral'}
          options={filteredOptions}
          value={selectedOption}
          onChange={(_, val) => onChange(val?.value || '')}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          startDecorator={iconUi({id: 'teams'})}
          placeholder="בחר קבוצה"
          disabled={disabled || !clubId}
          variant="soft"
          sx={{ '&:hover': { backgroundColor: '#eef4ff' } }}
          renderOption={(props, option) => {
            const { ownerState, ...rest } = props;
            return (
              <li
                {...rest}
                style={{
                  listStyle: 'none',
                  paddingTop: 1,
                  paddingBottom: 1,
                  backgroundColor: ownerState.focused
                    ? '#e6f0ff'  // ריחוף — כחול מאוד עדין
                    : ownerState.selected
                    ? '#d0e1ff'  // בחירה — כחול טיפונת יותר כהה
                    : 'transparent',
                  transition: 'background-color 0.2s ease',
                  borderRadius: 8,
                  margin: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-start', direction: 'rtl', pr: 1 }}>
                  <Typography level="body-xs" color="neutral">
                    {option.label} | {option.teamYear}
                  </Typography>
                </Box>
              </li>
            );
          }}
        />
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    </>
  );
}
