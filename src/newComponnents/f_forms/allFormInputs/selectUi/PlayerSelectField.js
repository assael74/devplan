import React from 'react';
import playerImage from '../../../b_styleObjects/images/playerImage.jpg';
import { Autocomplete, Typography } from '@mui/joy';
import { iconUi } from '../../../b_styleObjects/icons/IconIndex.js'
import { FormControl, FormLabel, Box } from '@mui/joy';

export default function PlayerSelectField({
  value,
  onChange,
  options = [],
  disabled,
  required,
  error,
  multiple,
  formProps,
  size = 'sm',
  readOnly,
}) {
  const findClub = (id) => formProps.clubs.find(i => i.id === id);
  const findTeam = (id) => formProps.teams.find(i => i.id === id);
  const newOptions = options.map((t) => {
    const team = findTeam(t.teamId);
    const club = findClub(t.clubId);

    return {
      label: t.playerFullName,
      value: t.id,
      avatar: t.photo || playerImage,
      teamName: team?.teamName || '',
      clubName: club?.clubName || '',
    };
  });

  const handleChange = (_, val) => {
    if (multiple) {
      const selectedIds = val.map((item) => item.value);
      onChange(selectedIds);
    } else {
      onChange(val?.value || '');
    }
  };
  
  return (
    <FormControl sx={{ width: '100%' }}>
      <FormLabel required={required} sx={{ fontSize: '12px' }}>
        שייך שחקן
      </FormLabel>
      <Autocomplete
        size={size}
        readOnly={readOnly}
        multiple={multiple}
        disabled={disabled}
        color={error ? 'danger' : 'neutral'}
        options={newOptions.sort((a, b) => -b.teamName.localeCompare(a.teamName))}
        groupBy={(option) => `${option.teamName} - (${option.clubName})`}
        value={
          multiple
            ? newOptions.filter((opt) => value?.includes(opt.value))
            : newOptions.find((opt) => opt.value === value) || null
        }
        onChange={handleChange}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        placeholder="בחר שחקן"
        variant="soft"
        startDecorator={iconUi({ id: 'player' })}
        slotProps={{
          listbox: {
            sx: {
              maxHeight: 300,
              overflowY: 'auto',
              paddingY: 0.5,
              // עיצוב פס גלילה מודרני:
              '&::-webkit-scrollbar': {
                width: 4,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f0f0f0',
                borderRadius: '8px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#c1c1c1',
                borderRadius: '8px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: '#a8a8a8',
              },
            },
          },
        }}
        renderOption={(props, option) => {
          const { ownerState, ...rest } = props;
          return (
            <li
              {...rest}
              style={{
                listStyle: 'none',
                paddingTop: 6,
                paddingBottom: 6,
                backgroundColor: ownerState.focused
                  ? '#e6f0ff'
                  : ownerState.selected
                  ? '#d0e1ff'
                  : 'transparent',
                transition: 'background-color 0.2s ease',
                borderRadius: 8,
                margin: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  component="img"
                  src={option.avatar}
                  alt=""
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography level="body-sm" fontWeight="lg">
                    {option.label}
                  </Typography>
                  <Typography level="body-xs" color="neutral" sx={{ fontSize: '10px', mt: 0.5 }}>
                    {option.teamName} | {option.clubName}
                  </Typography>
                </Box>
              </Box>
            </li>
          );
        }}
      />
    </FormControl>
  );
}
