// ui/domains/tags/TagsContainer.js

import React, { useState, useMemo, useCallback } from 'react'
import { Box, Chip, Input, IconButton, Typography, Autocomplete } from '@mui/joy'
import CloseRounded from '@mui/icons-material/CloseRounded'
import AddRounded from '@mui/icons-material/AddRounded'

import { tagsSx as sx } from './tags.sx'
import { getEntityColors } from '../../core/theme/Colors'
import { useTagPickerOptions } from './hooks/useTagPickerOptions'
import { iconUi } from '../../core/icons/iconUi.js'

const safeId = (v) => String(v ?? '').trim()
const safeLabel = (v) => String(v ?? '').trim()

const normalizeType = (v) => {
  const t = safeLabel(v).toLowerCase()
  return t === 'analysis' || t === 'general' ? t : 'general'
}

export default function TagsContainer({
  title = 'תגים',
  mode = 'edit',
  value = [],
  options = [],
  allowCustom = false,
  onChange,
  placeholder = 'בחר תג…',
  disabled = false,
  maxTags = 20,
  showCounter = true,
  type,
  chipVariant = 'solid',
  typeColor: typeColorProp,
  chipSx,
}) {
  const [input, setInput] = useState('')

  const readonly = mode === 'view' || disabled
  const scopeType = useMemo(() => normalizeType(type), [type])

  const selectedIds = useMemo(
    () => (Array.isArray(value) ? value.map(safeId).filter(Boolean) : []),
    [value]
  )

  const buckets = useTagPickerOptions({ options, selectedIds })
  const bucket = buckets[scopeType] || buckets.general
  const { selectedTags, availableOptions } = bucket

  const iconId = type === 'analysis' ? 'videoAnalysis' : 'videoGeneral'

  const removeId = useCallback(
    (id) => {
      if (!onChange) return
      onChange(selectedIds.filter((x) => x !== safeId(id)))
    },
    [selectedIds, onChange]
  )

  const addId = useCallback(
    (id) => {
      if (!onChange) return
      const clean = safeId(id)
      if (!clean || selectedIds.includes(clean) || selectedIds.length >= maxTags) return
      onChange([...selectedIds, clean])
    },
    [selectedIds, onChange, maxTags]
  )

  const resolvedTypeColor = useMemo(() => {
    if (typeColorProp) return typeColorProp
    return getEntityColors(iconId)?.accent || getEntityColors(iconId)?.bg || 'neutral.500'
  }, [typeColorProp, iconId])

  return (
    <Box sx={sx.root}>
      <Box sx={sx.headerRow}>
        <Typography level="body-xs" sx={sx.title} noWrap>
          {title}
        </Typography>

        {showCounter && (
          <Typography level="body-xs" sx={sx.counter}>
            {selectedIds.length}/{maxTags}
          </Typography>
        )}
      </Box>

      <Box sx={sx.chipsWrap}>
        {selectedTags.length === 0 ? (
          <Typography level="body-xs" sx={sx.empty}>
            אין תגים
          </Typography>
        ) : (
          selectedTags.map((t) => {
            const id = safeId(t?.id)
            const label = safeLabel(t?.tagName || t?.slug || id)

            return (
              <Box key={id} onClick={!readonly ? () => removeId(id) : undefined}>
                <Chip
                  size="sm"
                  variant={chipVariant}
                  endDecorator={!readonly ? <CloseRounded /> : null}
                  sx={[ sx.chip(resolvedTypeColor, readonly, chipVariant), chipSx ]}
                >
                  {label}
                </Chip>
              </Box>
            )
          })
        )}
      </Box>

      {!readonly && (
        <Box sx={sx.controlsRow}>
          {availableOptions.length > 0 && (
            <Autocomplete
              size="sm"
              options={availableOptions}
              value={null}
              groupBy={(opt) => safeLabel(opt?.groupName || 'ללא קטגוריה')}
              getOptionLabel={(opt) => safeLabel(opt?.tagName || opt?.slug || '')}
              isOptionEqualToValue={(opt, val) => safeId(opt?.id) === safeId(val?.id)}
              onChange={(_, newValue) => {
                if (!newValue) return
                addId(newValue.id)
              }}
              placeholder={placeholder}
              clearOnBlur
              sx={sx.autocomplete}
              slotProps={{ listbox: { sx: sx.listbox } }}
              renderGroup={(params) => (
                <Box key={params.key} sx={sx.groupWrap}>
                  <Typography level="body-xs" sx={sx.groupHeader}>
                    {params.group}
                  </Typography>
                  <Box sx={sx.groupChildren}>{params.children}</Box>
                </Box>
              )}
              renderOption={(props, option) => {
                const label = safeLabel(option?.tagName || option?.slug || '')
                const useCount = Number.isFinite(option?.useCount) ? option.useCount : null

                return (
                  <Box component="li" {...props} sx={sx.optionRow}>
                    <Typography
                      level="body-sm"
                      noWrap
                      sx={{ minWidth: 0 }}
                      startDecorator={iconUi({ id: iconId, sx: { color: resolvedTypeColor } })}
                    >
                      {label}
                    </Typography>

                    {useCount != null ? (
                      <Typography level="body-xs" sx={sx.optionMeta}>
                        {useCount}
                      </Typography>
                    ) : null}
                  </Box>
                )
              }}
            />
          )}
        </Box>
      )}
    </Box>
  )
}
