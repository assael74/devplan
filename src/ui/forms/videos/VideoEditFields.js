// ui/forms/videos/VideoEditFields.js

import React, { useMemo } from 'react'
import {
  Box,
  Chip,
  Divider,
  Option,
  Select,
  Textarea,
  Typography,
} from '@mui/joy'
import { alpha } from '@mui/system'

import VideoNameField from '../../fields/videos/VideoNameField.js'
import TagsContainer from '../../domains/tags/TagInputContainer.js'
import { iconUi } from '../../core/icons/iconUi.js'
import {
  VIDEO_PRIMARY_CATEGORIES,
  VIDEO_SEED_TAGS,
  VIDEO_TAG_TYPES,
} from '../../../shared/video/index.js'

import { videoFieldsSx } from './sx/videoFields.sx.js'

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

const safeArray = (value) => {
  return Array.isArray(value) ? value : []
}

const safeString = (value) => {
  return String(value == null ? '' : value).trim()
}

const getToneColor = (tone) => {
  return TONE_COLORS[safeString(tone)] || TONE_COLORS.neutral
}

const normalizeCategoryIds = (primaryCategoryId, categoryIds) => {
  const primary = safeString(primaryCategoryId)
  const ids = safeArray(categoryIds)
    .map(safeString)
    .filter(Boolean)

  if (!primary) return ids

  return Array.from(new Set([primary, ...ids]))
}

function CategoryIcon({ category }) {
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

export default function VideoEditFields({
  draft,
  onDraft,
  disabled,
  context,
  type = 'analysis',
}) {
  const isGeneral = type === 'general'

  const updateDraft = (patch) => {
    if (typeof onDraft !== 'function') return

    onDraft((current) => ({
      ...current,
      ...patch,
    }))
  }

  const tagOptions = useMemo(() => {
    if (isGeneral) return VIDEO_SEED_TAGS

    const candidates = [
      context?.analysisTags,
      context?.videoTags,
      context?.tagOptions,
      VIDEO_SEED_TAGS,
    ]

    return candidates.find((options) => {
      return Array.isArray(options) && options.length
    }) || []
  }, [
    isGeneral,
    context?.analysisTags,
    context?.videoTags,
    context?.tagOptions,
  ])

  const selectedTagTypeIds = useMemo(() => {
    const selected = new Set(
      safeArray(draft?.tagIds).map(safeString),
    )

    return VIDEO_SEED_TAGS
      .filter((tag) => selected.has(safeString(tag.id)))
      .map((tag) => safeString(tag.tagType))
      .filter(Boolean)
      .filter((value, index, values) => {
        return values.indexOf(value) === index
      })
  }, [draft?.tagIds])

  const selectedPrimaryCategory = useMemo(() => {
    const id = safeString(draft?.primaryCategoryId)

    return VIDEO_PRIMARY_CATEGORIES.find((category) => {
      return category.id === id
    }) || null
  }, [draft?.primaryCategoryId])

  const handlePrimaryCategory = (value) => {
    const primaryCategoryId = safeString(value)

    updateDraft({
      primaryCategoryId,
      categoryIds: normalizeCategoryIds(
        primaryCategoryId,
        draft?.categoryIds,
      ),
    })
  }

  return (
    <Box sx={videoFieldsSx.root}>
      {isGeneral ? (
        <Box sx={videoFieldsSx.block}>
          <VideoNameField
            required
            value={draft?.name || ''}
            onChange={(value) => updateDraft({ name: value })}
            disabled={!!disabled}
          />
        </Box>
      ) : null}

      {isGeneral ? (
        <>
          <Divider sx={videoFieldsSx.divider}>
            <Typography level="body-xs" sx={videoFieldsSx.dividerText}>
              קטגוריית וידאו
            </Typography>
          </Divider>

          <Box sx={videoFieldsSx.block}>
            <Select
              size="sm"
              value={draft?.primaryCategoryId || ''}
              onChange={(event, value) => {
                handlePrimaryCategory(value || '')
              }}
              placeholder="בחר קטגוריה ראשית"
              disabled={!!disabled}
              renderValue={() => {
                if (!selectedPrimaryCategory) return 'ללא קטגוריה'

                return (
                  <Box sx={videoFieldsSx.row}>
                    <CategoryIcon category={selectedPrimaryCategory} />

                    <Typography level="body-sm" noWrap sx={{ fontWeight: 700 }}>
                      {selectedPrimaryCategory.label}
                    </Typography>
                  </Box>
                )
              }}
            >
              <Option value="">ללא קטגוריה</Option>

              {VIDEO_PRIMARY_CATEGORIES.map((category) => (
                <Option
                  key={category.id}
                  value={category.id}
                  label={category.label}
                  sx={{
                    '--ListItemDecorator-size': '24px',
                    color: getToneColor(category.tone),
                  }}
                >
                  <Box sx={videoFieldsSx.row}>
                    <CategoryIcon category={category} />

                    <Typography
                      level="body-sm"
                      noWrap
                      sx={{
                        color: 'text.primary',
                        fontWeight: 700,
                      }}
                    >
                      {category.label}
                    </Typography>
                  </Box>
                </Option>
              ))}
            </Select>
          </Box>
        </>
      ) : null}

      <Divider sx={videoFieldsSx.divider}>
        <Typography level="body-xs" sx={videoFieldsSx.dividerText}>
          תגים
        </Typography>
      </Divider>

      <Box sx={videoFieldsSx.block}>
        <TagsContainer
          title="תגים לוידאו"
          value={draft?.tagIds || []}
          options={tagOptions}
          onChange={(tagIds) => updateDraft({ tagIds })}
          disabled={!!disabled}
          type={isGeneral ? 'videoGeneralProfessional' : type}
        />
      </Box>

      {selectedTagTypeIds.length ? (
        <Box sx={videoFieldsSx.tags}>
          {VIDEO_TAG_TYPES.map((tagType) => {
            if (!selectedTagTypeIds.includes(tagType.id)) return null

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

      <Divider sx={videoFieldsSx.divider}>
        <Typography level="body-xs" sx={videoFieldsSx.dividerText}>
          הערות
        </Typography>
      </Divider>

      <Box sx={videoFieldsSx.block}>
        <Textarea
          minRows={3}
          value={draft?.notes || ''}
          onChange={(event) => {
            updateDraft({ notes: event.target.value })
          }}
          placeholder="הערות קצרות על הוידאו…"
          disabled={!!disabled}
        />
      </Box>
    </Box>
  )
}
