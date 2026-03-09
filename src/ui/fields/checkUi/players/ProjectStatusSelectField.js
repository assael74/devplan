// src/ui/fields/checkUi/players/ProjectStatusSelectField.js
import * as React from 'react'
import { FormControl, FormLabel, List, ListItem, ListItemDecorator, Checkbox, Box } from '@mui/joy'
import { iconUi } from '../../../core/icons/iconUi.js'
import { PROJECT_STATUS_CANDIDATE } from '../../../../shared/players/players.constants.js'

export default function ProjectStatusSelectField({
  value,
  onChange,
  error = false,
  disabled = false,
  required,
  label = 'סטטוס תהליך פרויקט',
  size = 'sm',
}) {
  const selectedId = value == null ? '' : String(value)

  const setSingle = (id, checked) => {
    const next = checked ? id : ''
    onChange(next)
  }

  const isSm = size === 'sm'

  return (
    <Box sx={{ width: '100%' }}>
      <FormLabel required={required} sx={{ fontSize: 12, mb: 0.5 }}>
        {label}
      </FormLabel>

      <List
        variant="outlined"
        aria-label={label}
        role="radiogroup"
        orientation="horizontal"
        sx={{
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          columnGap: '8px',
          rowGap: '8px',
          '--List-padding': '8px',
          '--List-radius': '12px',
          opacity: disabled ? 0.6 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
        }}
      >
        {PROJECT_STATUS_CANDIDATE.map((opt, index) => {
          const checked = selectedId === opt.id

          return (
            <ListItem key={opt.id} sx={{ p: 0 }}>
              <ListItemDecorator
                sx={[
                  { zIndex: 2, pointerEvents: 'none', ml: 0.75 },
                  checked
                    ? { color: '#fff', '& svg': { transform: 'scale(1.04)' } }
                    : { color: opt.color, '& svg': { opacity: 0.92 } },
                ]}
              >
                {iconUi({ id: opt.idIcon, sx: { color: checked ? '#fff' : opt.color } })}
              </ListItemDecorator>

              <Checkbox
                disableIcon
                overlay
                label={opt.labelH}
                checked={checked}
                color="neutral"
                variant="plain"
                onChange={(e) => setSingle(opt.id, e.target.checked)}
                slotProps={{
                  root: {
                    sx: {
                      display: 'inline-flex',
                      alignItems: 'center',
                      px: 0.55,
                      py: 0.5,
                      minHeight: 28,
                      borderRadius: 12,
                    },
                  },
                  action: ({ checked }) => ({
                    sx: {
                      borderRadius: 12,
                      bgcolor: checked ? opt.color : 'transparent',
                      border: '1px solid',
                      borderColor: checked ? opt.color : 'divider',
                      boxShadow: checked ? 'sm' : 'none',
                      transition: 'background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease',
                      '&:hover': checked
                        ? { bgcolor: opt.color, borderColor: opt.color, filter: 'brightness(0.98)' }
                        : { bgcolor: 'background.level1', borderColor: opt.color },
                      '&:focus-visible': {
                        outline: '2px solid',
                        outlineColor: checked ? opt.color : 'primary.400',
                        outlineOffset: 2,
                      },
                    },
                  }),
                  label: {
                    sx: {
                      color: checked ? '#fff' : 'text.secondary',
                      fontWeight: checked ? 700 : 500,
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                      fontSize: isSm ? 12 : 13,
                    },
                  },
                }}
              />
            </ListItem>
          )
        })}
      </List>
    </Box>
  )
}
