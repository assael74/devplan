// src/features/videoHub/sharedUi/editDrawer/VideoEditDrawerBody.js

import React, { useMemo } from 'react'
import { Box, Textarea, Typography, Divider, Select, Option, Chip } from '@mui/joy'
import { alpha } from '@mui/system'

import VideoNameField from '../../../../ui/fields/inputUi/videos/VideoNameField.js'
import TagsContainer from '../../../../ui/domains/tags/TagInputContainer.js'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import {
  VIDEO_PRIMARY_CATEGORIES,
  VIDEO_SEED_TAGS,
  VIDEO_TAG_TYPES,
} from '../../../../shared/video/index.js'

const safeArr = value => (Array.isArray(value) ? value : [])
const safeStr = value => String(value ?? '').trim()

const TONE_COLORS = {
  green: '#16A34A',
  orange: '#F97316',
  blue: '#2563EB',
  purple: '#7C3AED',
  yellow: '#D97706',
  cyan: '#0891B2',
  teal: '#0F766E',
  neutral: '#64748B',
}

const getToneColor = tone => TONE_COLORS[safeStr(tone)] || TONE_COLORS.neutral

function renderCategoryIcon(category) {
  if (!category?.iconId) return null

  const color = getToneColor(category.tone)

  return (
    <Box
      sx={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        bgcolor: alpha(color, 0.12),
        color,

        '& svg': {
          fontSize: 15,
        },
      }}
    >
      {iconUi({ id: category.iconId, size: 'sm' })}
    </Box>
  )
}

function normalizeCategoryIds(primaryCategoryId, categoryIds) {
  const primary = safeStr(primaryCategoryId)
  const ids = safeArr(categoryIds).map(safeStr).filter(Boolean)

  if (!primary) return ids

  return Array.from(new Set([primary, ...ids]))
}

export default function VideoEditDrawerBody({
  draft,
  setDraft,
  disabled,
  context,
  type = 'analysis',
}) {
  const isGeneral = type === 'general'

  const tagOptions = useMemo(() => {
    if (isGeneral) return VIDEO_SEED_TAGS

    const opts =
      context?.tags ||
      context?.tagOptions ||
      context?.analysisTags ||
      []

    return Array.isArray(opts) ? opts : []
  }, [isGeneral, context?.tags, context?.tagOptions, context?.analysisTags])

  const selectedTagTypeIds = useMemo(() => {
    const selected = new Set(safeArr(draft?.tagIds).map(safeStr))

    return VIDEO_SEED_TAGS
      .filter(tag => selected.has(safeStr(tag.id)))
      .map(tag => safeStr(tag.tagType))
      .filter(Boolean)
      .filter((value, index, arr) => arr.indexOf(value) === index)
  }, [draft?.tagIds])

  const handlePrimaryCategory = value => {
    const primaryCategoryId = safeStr(value)

    setDraft({
      ...draft,
      primaryCategoryId,
      categoryIds: normalizeCategoryIds(primaryCategoryId, draft?.categoryIds),
    })
  }

  const selectedPrimaryCategory = useMemo(() => {
    const id = safeStr(draft?.primaryCategoryId)
    return VIDEO_PRIMARY_CATEGORIES.find(category => category.id === id) || null
  }, [draft?.primaryCategoryId])

  return (
    <Box sx={{ display: 'grid', gap: 1, minHeight: 0 }}>
      {isGeneral ? (
        <Box sx={{ display: 'grid', gap: 0.5 }}>
          <VideoNameField
            value={draft?.name || ''}
            onChange={(value) => setDraft({ ...draft, name: value })}
            required
            disabled={!!disabled}
          />
        </Box>
      ) : null}

      <Divider sx={{ my: 1.25 }}>
        <Typography level="body-xs" sx={{ opacity: 0.75 }}>
          קטגוריית וידאו
        </Typography>
      </Divider>

      <Box sx={{ display: 'grid', gap: 0.75 }}>
        <Select
          size="sm"
          value={draft?.primaryCategoryId || ''}
          onChange={(event, value) => handlePrimaryCategory(value || '')}
          placeholder="בחר קטגוריה ראשית"
          disabled={!!disabled}
          renderValue={() => {
            if (!selectedPrimaryCategory) return '??? ???????'

            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                {renderCategoryIcon(selectedPrimaryCategory)}

                <Typography level="body-sm" noWrap sx={{ fontWeight: 700 }}>
                  {selectedPrimaryCategory.label}
                </Typography>
              </Box>
            )
          }}
        >
          <Option value="">ללא קטגוריה</Option>

          {VIDEO_PRIMARY_CATEGORIES.map(category => (
            <Option
              key={category.id}
              value={category.id}
              label={category.label}
              sx={{
                '--ListItemDecorator-size': '24px',
                color: getToneColor(category.tone),
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                {renderCategoryIcon(category)}

                <Typography level="body-sm" noWrap sx={{ color: 'text.primary', fontWeight: 700 }}>
                  {category.label}
                </Typography>
              </Box>
            </Option>
          ))}
        </Select>
      </Box>

      <Divider sx={{ my: 1.25 }}>
        <Typography level="body-xs" sx={{ opacity: 0.75 }}>
          תגים
        </Typography>
      </Divider>

      <Box sx={{ display: 'grid', gap: 0.5 }}>
        <TagsContainer
          title="תגים לוידאו"
          value={draft?.tagIds || []}
          options={tagOptions}
          onChange={(tagIds) => setDraft({ ...draft, tagIds })}
          disabled={!!disabled}
          type={isGeneral ? 'videoGeneralProfessional' : type}
        />
      </Box>

      {selectedTagTypeIds.length ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {VIDEO_TAG_TYPES.map(tagType => {
            const selected = selectedTagTypeIds.includes(tagType.id)
            if (!selected) return null

            return (
              <Chip
                key={tagType.id}
                size="sm"
                variant="soft"
                color="success"
                sx={{ fontWeight: 700 }}
              >
                {tagType.label}
              </Chip>
            )
          })}
        </Box>
      ) : null}

      <Divider sx={{ my: 1.25 }}>
        <Typography level="body-xs" sx={{ opacity: 0.75 }}>
          הערות
        </Typography>
      </Divider>

      <Box sx={{ display: 'grid', gap: 0.5 }}>
        <Textarea
          minRows={3}
          value={draft?.notes || ''}
          onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
          placeholder="הערות קצרות על הוידאו…"
          disabled={!!disabled}
        />
      </Box>
    </Box>
  )
}
