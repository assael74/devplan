// src/features/videoHub/components/mobile/toolbar/VideoMobileFiltersContent.js

import React, { useMemo } from 'react'
import {
  Box,
  Chip,
  FormControl,
  FormLabel,
  ListItemDecorator,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

const ALL_ID = 'all'

const safe = (value) => (value == null ? '' : String(value).trim())

function getItemSource(item) {
  return safe(item?.source || item?.videoSource || item?.platform || '')
}

function getItemTags(item) {
  if (Array.isArray(item?.tagsFull)) {
    return item.tagsFull
  }

  if (Array.isArray(item?.tags)) {
    return item.tags
  }

  if (Array.isArray(item?.tagIds)) {
    return item.tagIds.map((id) => ({ id, label: id }))
  }

  return []
}

function getTagId(tag) {
  return safe(tag?.id || tag?.tagId || tag?.value || tag)
}

function getTagLabel(tag) {
  return safe(tag?.tagName || tag?.label || tag?.name || tag?.id || tag)
}

function countBy(items, getter) {
  const map = new Map()

  items.forEach((item) => {
    const value = getter(item)
    if (!value) return

    map.set(value, (map.get(value) || 0) + 1)
  })

  return map
}

function buildSourceOptions(items) {
  const counts = countBy(items, getItemSource)

  const options = Array.from(counts.entries()).map(([id, count]) => ({
    id,
    label: id,
    count,
    idIcon: 'videoGeneral',
  }))

  return [
    {
      id: ALL_ID,
      label: 'כל המקורות',
      count: items.length,
      idIcon: 'videos',
    },
    ...options,
  ]
}

function buildTagsOptions(items) {
  const byId = new Map()

  items.forEach((item) => {
    getItemTags(item).forEach((tag) => {
      const id = getTagId(tag)
      if (!id) return

      const prev = byId.get(id)
      byId.set(id, {
        id,
        label: prev?.label || getTagLabel(tag),
        count: (prev?.count || 0) + 1,
        idIcon: 'tags',
      })
    })
  })

  return [
    {
      id: ALL_ID,
      label: 'כל התגיות',
      count: items.length,
      idIcon: 'tags',
    },
    ...Array.from(byId.values()),
  ]
}

function findOption(options, value) {
  return options.find((option) => option.id === value) || options[0] || null
}

function SelectValue({ option, fallback }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, width: '100%' }}>
      {option?.idIcon ? iconUi({ id: option.idIcon, size: 'sm' }) : null}

      <Typography level="body-sm" noWrap sx={{ minWidth: 0, flex: 1 }}>
        {option?.label || fallback}
      </Typography>

      <Chip size="sm" variant="soft" sx={{ flexShrink: 0 }}>
        {option?.count || 0}
      </Chip>
    </Box>
  )
}

function OptionRow({ option }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
      <ListItemDecorator>
        {iconUi({ id: option?.idIcon || 'videos', size: 'sm' })}
      </ListItemDecorator>

      <Typography level="body-sm" noWrap sx={{ minWidth: 0, flex: 1 }}>
        {option?.label || ''}
      </Typography>

      <Chip size="sm" variant="soft" color="primary">
        {option?.count || 0}
      </Chip>
    </Box>
  )
}

export default function VideoMobileFiltersContent({
  items = [],
  filters,
  onChangeSource,
  onChangeTag,
}) {
  const sourceOptions = useMemo(() => {
    return buildSourceOptions(items)
  }, [items])

  const tagOptions = useMemo(() => {
    return buildTagsOptions(items)
  }, [items])

  const sourceValue = filters?.source || ALL_ID
  const tagValue = filters?.parentTagId || filters?.tagId || ALL_ID

  const selectedSource = findOption(sourceOptions, sourceValue)
  const selectedTag = findOption(tagOptions, tagValue)

  return (
    <Box sx={{ display: 'grid', gap: 2, px: 2 }}>
      <FormControl>
        <FormLabel>מקור וידאו</FormLabel>

        <Select
          size="sm"
          value={sourceValue}
          onChange={(_, value) => onChangeSource(value || ALL_ID)}
          sx={{ minWidth: 0, width: '100%', bgcolor: 'background.surface' }}
          renderValue={() => (
            <SelectValue option={selectedSource} fallback="כל המקורות" />
          )}
        >
          {sourceOptions.map((option) => (
            <Option key={option.id} value={option.id}>
              <OptionRow option={option} />
            </Option>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>תגית</FormLabel>

        <Select
          size="sm"
          value={tagValue}
          onChange={(_, value) => onChangeTag(value || ALL_ID)}
          sx={{ minWidth: 0, width: '100%', bgcolor: 'background.surface' }}
          renderValue={() => (
            <SelectValue option={selectedTag} fallback="כל התגיות" />
          )}
        >
          {tagOptions.map((option) => (
            <Option key={option.id} value={option.id}>
              <OptionRow option={option} />
            </Option>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}

export { ALL_ID }
