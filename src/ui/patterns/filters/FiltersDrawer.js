// src/ui/filters/FiltersDrawer.js
// src/ui/filters/FiltersDrawer.js
import React from 'react'
import { Box, Sheet, Drawer, Typography, Chip, Button, Input, IconButton } from '@mui/joy'

import MonthYearPicker from '../../fields/dateUi/MonthYearPicker.js'
import {
  drawerConsProps,
  sheetDrwerProps,
  resetButtonProps,
  closeButtonProps,
  headerSx,
  bodySx,
  footerSx,
  fieldsWrapSx,
  fieldBoxSx,
  groupsWrapSx,
  groupCardSx,
  chipsWrapSx,
} from './filters.sx'

export default function FiltersDrawer({
  open,
  onClose,
  title = 'פילטרים',
  filters = {},
  groups = [],
  fields = [],
  size = 'md',
  onChange = () => {},
  onReset = () => {},
}) {
  const safeGroups = Array.isArray(groups) ? groups : []
  const safeFields = Array.isArray(fields) ? fields : []

  const normalizeToArray = (val) => (Array.isArray(val) ? val : val ? [val] : [])
  const toggleInArray = (arr, value) => {
    const a = normalizeToArray(arr).map(String)
    const v = String(value)
    const has = a.includes(v)
    const next = has ? a.filter((x) => x !== v) : [...a, v]
    return next
  }

  return (
    <Drawer {...drawerConsProps(!!open, onClose)}>
      <Sheet {...sheetDrwerProps}>
        {/* --- Header --- */}
        <Box sx={headerSx}>
          <Typography level="title-md" sx={{ minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </Typography>

          <IconButton {...closeButtonProps} onClick={onClose}>
            ✕
          </IconButton>
        </Box>

        {/* --- Body (scroll) --- */}
        <Box sx={bodySx}>
          {/* --- Fields --- */}
          {safeFields.length ? (
            <Box sx={fieldsWrapSx}>
              {safeFields.map((f) => {
                const val = filters[f.key]

                return (
                  <Box key={f.key} sx={fieldBoxSx}>
                    {f.kind === 'monthYear' ? (
                      <MonthYearPicker
                        value={String(val || '')}
                        onChange={(v) => onChange(f.key, v || '')}
                        context={f.context || 'meeting'}
                        size="sm"
                        helperText=''
                      />
                    ) : (
                      <Input
                        size="sm"
                        value={String(val)}
                        onChange={(e) => onChange(f.key, e.target.value)}
                        placeholder={f.placeholder || ''}
                      />
                    )}
                  </Box>
                )
              })}
            </Box>
          ) : null}

          {/* --- Groups --- */}
          <Box sx={groupsWrapSx}>
            {safeGroups.map((g) => (
              <Sheet key={g.key} variant="soft" sx={groupCardSx}>
                <Typography level="body-sm" sx={{ mb: 0.75, fontWeight: 700, opacity: 0.85 }}>
                  {g.title}
                </Typography>

                <Box sx={chipsWrapSx}>
                  {(Array.isArray(g.options) ? g.options : []).map((opt) => {
                    const isMulti = Boolean(g.multi)
                    const currentVal = filters[g.key]
                    const isSelected = isMulti
                      ? normalizeToArray(currentVal).map(String).includes(String(opt.value))
                      : String(currentVal) === String(opt.value)
                    const isDisabled = Boolean(opt.disabled)

                    return (
                      <Chip
                        key={`${g.key}_${opt.value}`}
                        size={size}
                        variant={isSelected ? 'soft' : 'outlined'}
                        color={isSelected ? 'success' : 'neutral'}
                        disabled={isDisabled}
                        startDecorator={opt.startDecorator}
                        onClick={() => {
                          if (isDisabled) return

                          if (isMulti) {
                            const nextArr = toggleInArray(currentVal, opt.value)
                            onChange(g.key, nextArr)
                            return
                          }

                          onChange(g.key, isSelected ? 'all' : opt.value)
                        }}
                        sx={{ borderRadius: 12 }}
                      >
                        {opt.label}
                      </Chip>
                    )
                  })}
                </Box>
              </Sheet>
            ))}
          </Box>
        </Box>

        {/* --- Footer --- */}
        <Box sx={footerSx}>
          <Button {...resetButtonProps} onClick={onReset}>
            איפוס
          </Button>

          <Button size="sm" variant="solid" onClick={onClose} sx={{ borderRadius: 10 }}>
            סגור
          </Button>
        </Box>
      </Sheet>
    </Drawer>
  )
}
