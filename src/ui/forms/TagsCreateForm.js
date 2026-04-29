// src/ui/forms/TagsCreateForm.js

import React, { useEffect, useMemo } from 'react'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import TagsCreateFields from './ui/tags/TagsCreateFields.js'
import { getTagsCreateFormLayout } from './layouts/tagsCreateForm.layout.js'
import { buildParentOptions } from '../../shared/tags'

const fallback = (value, fallbackValue) => {
  return value == null ? fallbackValue : value
}

const clean = (v) => String(v == null ? '' : v).trim()

export default function TagsCreateForm({
  draft = {},
  onDraft,
  onValidChange,
  context = {},
  variant = 'modal',
  forceMobile = false,
  disabled = false,
}) {
  const theme = useTheme()
  const isMobileViewport = useMediaQuery(theme.breakpoints.down('sm'))
  const isMobile = forceMobile || context?.forceMobile || isMobileViewport

  const tags = Array.isArray(context?.tags) ? context.tags : []

  const kind = fallback(draft.kind, 'tag')
  const isGroup = kind === 'group'

  const tagName = fallback(draft.tagName, '')
  const tagType = fallback(draft.tagType, '')
  const parentId = fallback(draft.parentId, '')
  const notes = String(fallback(draft.notes, ''))

  const parentOptions = useMemo(() => {
    return buildParentOptions({
      tags,
      currentTagId: '',
      tagType,
      includeArchived: false,
      lockParentIfHasChildren: true,
    })
  }, [tags, tagType])

  const parentOptsFiltered = useMemo(() => {
    const arr = Array.isArray(parentOptions) ? parentOptions : []

    return arr
      .filter((o) => o && o.isActive !== false)
      .filter((o) => !clean(tagType) || clean(o.tagType) === clean(tagType))
      .filter((o) => clean(o.id) !== clean(draft.id))
  }, [parentOptions, tagType, draft.id])

  const errors = useMemo(() => {
    const e = {}

    if (!clean(tagType)) e.tagType = true
    if (!clean(tagName)) e.tagName = true
    if (!isGroup && !clean(parentId)) e.parentId = true

    return e
  }, [tagType, tagName, parentId, isGroup])

  const validity = useMemo(() => {
    return {
      kind,
      isGroup,
      tagName,
      tagType,
      parentId,
      notes,
      parentOptions: parentOptsFiltered,
      errors,
      isValid: Object.keys(errors).length === 0,
    }
  }, [
    kind,
    isGroup,
    tagName,
    tagType,
    parentId,
    notes,
    parentOptsFiltered,
    errors,
  ])

  useEffect(() => {
    if (typeof onValidChange === 'function') {
      onValidChange(validity.isValid)
    }
  }, [validity.isValid, onValidChange])

  const layout = useMemo(() => {
    return getTagsCreateFormLayout({ variant, isMobile })
  }, [variant, isMobile])

  return (
    <TagsCreateFields
      draft={draft}
      onDraft={onDraft}
      context={context}
      validity={validity}
      layout={layout}
      disabled={disabled}
    />
  )
}
