// ui/fields/clubs/ClubMultiSelectField.js

import * as React from 'react'
import {
  Avatar,
  Box,
  Chip,
  FormControl,
  FormHelperText,
  FormLabel,
  Option,
  Select,
  Stack,
  Typography,
} from '@mui/joy'
import { buildFallbackAvatar } from '../../core/avatars/fallbackAvatar.js'

const asArray = (value) => (Array.isArray(value) ? value : [])
const normId = (value) => String(value || '').trim()
const uniqIds = (items) => Array.from(new Set(asArray(items).map(normId).filter(Boolean)))
const pickClubName = (club) => club?.clubName || 'מועדון'
const pickClubPhoto = (club) => club?.photo || ''

export default function ClubMultiSelectField({
  value = [],
  onChange,
  clubs = [],
  error = false,
  disabled = false,
  readOnly = false,
  required = false,
  label = 'מועדונים',
  size = 'sm',
  placeholder = 'בחר מועדונים',
  helperText,
  sx,
  slotProps,
}) {
  const selected = uniqIds(value)

  const clubMap = React.useMemo(() => {
    const map = new Map()
    clubs.forEach((club) => {
      map.set(normId(club?.id), club)
    })
    return map
  }, [clubs])

  const handleChange = (_, nextValue) => {
    if (readOnly || !onChange) return
    onChange(uniqIds(nextValue))
  }

  return (
    <FormControl
      required={required}
      disabled={disabled}
      error={error}
      sx={{ width: '100%', ...sx }}
    >
      <FormLabel sx={{ fontSize: '12px' }}>{label}</FormLabel>
      <Select
        multiple
        value={selected}
        size={size}
        disabled={disabled}
        readOnly={readOnly}
        onChange={handleChange}
        placeholder={placeholder}
        renderValue={(selectedOptions) => (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {selectedOptions.map((option) => {
              const club = clubMap.get(normId(option.value))
              const photo = pickClubPhoto(club)
              const src = photo || buildFallbackAvatar({
                entityType: 'club',
                id: club?.id,
                name: club?.clubName,
              })

              return (
                <Chip
                  key={option.value}
                  size="sm"
                  variant="outlined"
                  startDecorator={
                    <Avatar size="sm" src={src} alt={option?.label || ''}>
                      {!photo ? String(option?.label || '').slice(0, 1) : null}
                    </Avatar>
                  }
                >
                  {option.label}
                </Chip>
              )
            })}
          </Box>
        )}
        slotProps={{
          listbox: { sx: { maxHeight: 260, width: '100%' } },
          ...slotProps,
        }}
      >
        {clubs.map((club) => {
          const id = normId(club?.id)
          const name = pickClubName(club)
          const photo = pickClubPhoto(club)
          const src = photo || buildFallbackAvatar({
            entityType: 'club',
            id: club?.id,
            name: club?.clubName,
          })

          return (
            <Option key={id} value={id} label={name} avatar={photo}>
              <Stack direction="row" gap={1} alignItems="center">
                <Avatar src={src} alt={name} size="sm">
                  {String(name).trim().slice(0, 1)}
                </Avatar>
                <Typography level="body-sm">{name}</Typography>
              </Stack>
            </Option>
          )
        })}
      </Select>
      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
