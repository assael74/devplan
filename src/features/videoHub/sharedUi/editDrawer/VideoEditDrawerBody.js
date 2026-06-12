// src/features/videoHub/sharedUi/editDrawer/VideoEditDrawerBody.js

import React, { useMemo } from 'react'
import { Box, Textarea, Typography, Divider, Select, Option, Chip } from '@mui/joy'

import VideoNameField from '../../../../ui/fields/inputUi/videos/VideoNameField.js'
import TagsContainer from '../../../../ui/domains/tags/TagInputContainer.js'
import {
  VIDEO_PRIMARY_CATEGORIES,
  VIDEO_SEED_TAGS,
  VIDEO_TAG_TYPES,
} from '../../../../shared/video/index.js'

const safeArr = value => (Array.isArray(value) ? value : [])
const safeStr = value => String(value ?? '').trim()

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

  const selectedCategoryIds = useMemo(() => {
    return normalizeCategoryIds(draft?.primaryCategoryId, draft?.categoryIds)
  }, [draft?.primaryCategoryId, draft?.categoryIds])

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

  const handleToggleCategory = categoryId => {
    const id = safeStr(categoryId)
    const current = normalizeCategoryIds(draft?.primaryCategoryId, draft?.categoryIds)
    const exists = current.includes(id)

    const next = exists
      ? current.filter(item => item !== id)
      : [...current, id]

    setDraft({
      ...draft,
      categoryIds: normalizeCategoryIds(draft?.primaryCategoryId, next),
    })
  }

  return (
    <Box sx={{ display: 'grid', gap: 1, minHeight: 0 }}>
      <Box sx={{ display: 'grid', gap: 0.5 }}>
        <VideoNameField
          value={draft?.name || ''}
          onChange={(value) => setDraft({ ...draft, name: value })}
          required
          disabled={!!disabled}
        />
      </Box>

      <Divider sx={{ my: 1.25 }}>
        <Typography level="body-xs" sx={{ opacity: 0.75 }}>
          קטגוריית וידאו
        </Typography>
      </Divider>

      {isGeneral ? (
        <Box sx={{ display: 'grid', gap: 0.75 }}>
          <Select
            size="sm"
            value={draft?.primaryCategoryId || ''}
            onChange={(event, value) => handlePrimaryCategory(value || '')}
            placeholder="בחר קטגוריה ראשית"
            disabled={!!disabled}
          >
            <Option value="">ללא קטגוריה</Option>

            {VIDEO_PRIMARY_CATEGORIES.map(category => (
              <Option key={category.id} value={category.id}>
                {category.label}
              </Option>
            ))}
          </Select>
        </Box>
      ) : null}

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

      {isGeneral && selectedTagTypeIds.length ? (
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
