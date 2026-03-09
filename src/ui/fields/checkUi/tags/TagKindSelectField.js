// ui/fields/checkUi/tags/TagKindSelectField.js
import React, { useMemo } from 'react'
import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import ToggleButtonGroup from '@mui/joy/ToggleButtonGroup'
import Button from '@mui/joy/Button'

export default function TagKindSelectField({
  value = 'tag',
  onChange,
  size = 'sm',
  disabled = false,
  label = 'סוג יצירה',
  helperText,
  sx,
}) {
  const opts = useMemo(
    () => [
      { id: 'tag', label: 'תג חדש' },
      { id: 'group', label: 'קטגוריה חדשה' },
    ],
    []
  )

  const onVal = (e, nextVal) => {
    if (!nextVal) return
    onChange(nextVal)
  }

  return (
    <Box sx={{ display: 'grid', borderRadius: 'sm', gap: 0.75, ...sx }}>
      {!!label && (
        <Typography level="body-xs" sx={{ color: 'neutral.600' }}>
          {label}
        </Typography>
      )}

      <ToggleButtonGroup
        value={value}
        onChange={onVal}
        disabled={disabled}
        size={size}
        variant="soft"
        color='warning'
        sx={{
          width: '100%',
          '--Button-minHeight': '32px',
          '& .MuiButton-root': {
            flex: 1,
            whiteSpace: 'nowrap',
            borderRadius: 0,
          },
          '& .MuiButton-root:first-of-type': {
            borderTopLeftRadius: '12px',
            borderBottomLeftRadius: '12px',
          },
          '& .MuiButton-root:last-of-type': {
            borderTopRightRadius: '12px',
            borderBottomRightRadius: '12px',
          },
        }}
      >
        {opts.map((o) => (
          <Button key={o.id} value={o.id}>
            {o.label}
          </Button>
        ))}
      </ToggleButtonGroup>

      {!!helperText && (
        <Typography level="body-xs" sx={{ color: 'neutral.500' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  )
}
