// ui/fields/selectUi/clubs/ClubMultiSelectField.js
import * as React from 'react'
import { FormControl, FormLabel, Select, Option, Stack, Chip, Box, Avatar, Typography } from '@mui/joy'
import { buildFallbackAvatar } from '../../../core/avatars/fallbackAvatar.js'

const asArray = (x) => (Array.isArray(x) ? x : [])
const normId = (v) => String(v ?? '').trim()
const uniqIds = (arr) => Array.from(new Set(asArray(arr).map(normId).filter(Boolean)))

const pickClubName = (c) => c?.clubName || 'מועדון'
const pickClubPhoto = (c) => c?.photo || ''

export default function ClubMultiSelectField({
  value = [],
  onChange,
  clubs = [],
  error = false,
  disabled = false,
  required,
  label = 'מועדונים',
  size = 'sm',
  placeholder = 'בחר מועדונים',
}) {
  const selected = uniqIds(value)

  const clubMap = React.useMemo(() => {
    const m = new Map()
    clubs.forEach((c) => {
      m.set(normId(c?.id), c)
    })
    return m
  }, [clubs])

  return (
    <FormControl error={error} required={required} sx={{ width: '100%' }}>
      <FormLabel required={required} sx={{ fontSize: '12px' }}>
        {label}
      </FormLabel>

      <Select
        multiple
        value={selected}
        size={size}
        disabled={disabled}
        onChange={(_, val) => onChange(uniqIds(val))}
        placeholder={placeholder}
        renderValue={(selectedOptions) => (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {selectedOptions.map((opt) => {
              const club = clubMap.get(normId(opt.value))
              const photo = pickClubPhoto(club)
              const src = photo || buildFallbackAvatar({ entityType: 'club', id: club?.id, name: club?.clubName })

              return (
                <Chip
                  key={opt.value}
                  size="sm"
                  variant="outlined"
                  startDecorator={
                    <Avatar
                      size="sm"
                      src={src}
                      alt={opt?.label || ''}
                    >
                      {!photo ? String(opt?.label || '').slice(0, 1) : null}
                    </Avatar>
                  }
                >
                  {opt.label}
                </Chip>
              )
            })}
          </Box>
        )}
        slotProps={{
          listbox: { sx: { maxHeight: 260, width: '100%' } },
        }}
      >
        {clubs.map((c) => {
          const id = normId(c?.id)
          const name = pickClubName(c)
          const photo = pickClubPhoto(c)
          const src = photo || buildFallbackAvatar({ entityType: 'club', id: c?.id, name: c?.clubName })

          return (
            <Option
              key={id}
              value={id}
              label={name}
              avatar={photo}
            >
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
    </FormControl>
  )
}
