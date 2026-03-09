// ui/fields/selectUi/clubs/ClubSelectField.js
import React, { useMemo } from 'react'
import { Autocomplete, Typography, FormControl, FormLabel, FormHelperText } from '@mui/joy'
import Avatar from '@mui/joy/Avatar'
import Box from '@mui/joy/Box'
import Input from '@mui/joy/Input'

import { iconUi } from '../../../core/icons/iconUi.js'
import { buildFallbackAvatar } from '../../../core/avatars/fallbackAvatar.js'
//import clubImage from '../../../images/clubImage.png'

export default function ClubSelectField({
  required,
  value,
  onChange,
  options = [],
  disabled,
  error,
  helperText,
  size = 'sm',
  readOnly,
}) {
  const mappedOptions = useMemo(
    () =>
      options.map((c) => ({
        label: c.clubName,
        value: c.id,
        photo: c.photo || buildFallbackAvatar({ entityType: 'club', id: c.id, name: c.clubName }),
      })),
    [options]
  )

  const selectedOption = mappedOptions.find((o) => o.value === value) || null

  return (
    <FormControl sx={{ width: '100%' }}>
      <FormLabel required={required} sx={{ fontSize: '12px' }}>
        שייך מועדון
      </FormLabel>

      <Autocomplete
        size={size}
        readOnly={readOnly}
        disabled={disabled}
        color={error ? 'danger' : 'neutral'}
        options={mappedOptions}
        value={selectedOption}
        onChange={(_, opt) => onChange(opt?.value || '')}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(opt, val) => opt.value === val.value}
        variant="soft"
        renderOption={(props, option) => (
          <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75 }}>
            <Avatar
              src={option.photo}
              alt={option.label}
              size="sm"
              variant="soft"
            >
              {option.label?.[0]}
            </Avatar>

            <Typography level="body-sm">{option.label}</Typography>
          </Box>
        )}
        renderInput={(params) => (
          <Input
            {...params}
            placeholder="בחר מועדון"
            startDecorator={
              selectedOption ? (
                <Avatar
                  src={selectedOption.photo}
                  size="sm"
                  variant="soft"
                >
                  {selectedOption.label[0]}
                </Avatar>
              ) : (
                iconUi({ id: 'clubs' })
              )
            }
          />
        )}
        sx={{ '&:hover': { backgroundColor: '#eef4ff' } }}
      />

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}
