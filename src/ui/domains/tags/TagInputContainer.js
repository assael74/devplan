// ui/domains/tags/TagsContainer.js

import React, { useState, useMemo, useCallback } from 'react'
import { Box, Chip, Typography, Autocomplete } from '@mui/joy'
import { alpha } from '@mui/system'
import CloseRounded from '@mui/icons-material/CloseRounded'

import { tagsSx as sx } from './tags.sx'
import { getEntityColors } from '../../core/theme/Colors'
import { useTagPickerOptions } from './hooks/useTagPickerOptions'
import { iconUi } from '../../core/icons/iconUi.js'
import { VIDEO_TAG_TYPE_BY_ID } from '../../../shared/video/index.js'

const safeId = (v) => String(v ?? '').trim()
const safeLabel = (v) => String(v ?? '').trim()

const TAG_TYPE_COLORS = {
  formation: '#7C3AED',
  pitch_area: '#0891B2',
  game_principle: '#2563EB',
  action_technique: '#16A34A',
  situation: '#F97316',
  position_role: '#0F766E',
  mental: '#D97706',
}

function getTagTypeMeta(tag) {
  const tagType = safeId(tag?.tagType)
  const typeMeta = VIDEO_TAG_TYPE_BY_ID[tagType] || null
  const color = TAG_TYPE_COLORS[tagType] || ''

  return {
    color,
    iconId: typeMeta?.iconId || '',
    label: typeMeta?.label || tagType,
  }
}

function renderTagTypeIcon(tag, fallbackColor) {
  const meta = getTagTypeMeta(tag)
  const color = meta.color || fallbackColor

  if (!meta.iconId) return null

  return (
    <Box
      sx={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        bgcolor: alpha(color, 0.12),
        color,

        '& svg': {
          fontSize: 14,
        },
      }}
    >
      {iconUi({ id: meta.iconId, size: 'sm' })}
    </Box>
  )
}

const normalizeType = value => {
  const type = safeLabel(value).toLowerCase()

  if (type === 'analysis' || type === 'general') return type

  if (
    type === 'videogeneralprofessional' ||
    type === 'professionalvideo' ||
    type === 'video_professional'
  ) {
    return 'videoGeneralProfessional'
  }

  return 'general'
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
            const tagMeta = getTagTypeMeta(t)
            const tagColor = tagMeta.color || resolvedTypeColor

            return (
              <Box key={id} onClick={!readonly ? () => removeId(id) : undefined}>
                <Chip
                  size="sm"
                  variant={chipVariant}
                  endDecorator={!readonly ? <CloseRounded /> : null}
                  sx={[ sx.chip(tagColor, readonly, chipVariant), chipSx ]}
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
              inputValue={input}
              onInputChange={(_, nextInput, reason) => {
                if (reason === 'reset') return
                setInput(nextInput)
              }}
              groupBy={(opt) => safeLabel(opt?.groupName || 'ללא קטגוריה')}
              getOptionLabel={(opt) => safeLabel(opt?.tagName || opt?.slug || '')}
              isOptionEqualToValue={(opt, val) => safeId(opt?.id) === safeId(val?.id)}
              onChange={(_, newValue) => {
                if (!newValue) return
                addId(newValue.id)
                setInput('')
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
                const tagMeta = getTagTypeMeta(option)
                const tagColor = tagMeta.color || resolvedTypeColor

                return (
                  <Box component="li" {...props} sx={sx.optionRow}>
                    {renderTagTypeIcon(option, resolvedTypeColor)}

                    <Typography
                      level="body-sm"
                      noWrap
                      sx={{ minWidth: 0, flex: 1, color: 'text.primary', fontWeight: 700 }}
                    >
                      {label}
                    </Typography>

                    {tagMeta.label && tagMeta.color ? (
                      <Chip
                        size="sm"
                        variant="soft"
                        sx={sx.optionTypeChip(tagColor)}
                      >
                        {tagMeta.label}
                      </Chip>
                    ) : null}

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
