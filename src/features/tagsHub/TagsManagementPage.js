// src/features/tagsHub/TagsManagementPage.js

import React, { useMemo, useState, useCallback } from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Box, Typography, Sheet } from '@mui/joy'

import { tagSx as sx } from './tags.sx'

import TagsFiltersRow from './components/desktop/TagsFiltersRow'
import TagsList from './components/desktop/TagsList'
import TagsManagementMobile from './components/mobile/TagsManagementMobile'

import {
  normalizeTags,
  filterTags,
  buildTagsSections,
  TAGS_DEFAULT_SORT,
  TAGS_SORT_OPTIONS,
} from './logic/tags.logic'

import { iconUi } from '../../ui/core/icons/iconUi.js'

export default function TagsManagementPage() {
  const isMobile = useMediaQuery('(max-width:899px)')

  const [uiFilters, setUiFilters] = useState({
    q: '',
    tagType: 'all',
  })

  const [sort, setSort] = useState(TAGS_DEFAULT_SORT)

  const onChangeSortBy = useCallback((by) => {
    setSort((prev) => ({ ...prev, by }))
  }, [])

  const onChangeSortDirection = useCallback((direction) => {
    setSort((prev) => ({ ...prev, direction }))
  }, [])

  const onChangeFilters = useCallback((patch) => {
    setUiFilters((prev) => ({ ...prev, ...(patch || {}) }))
  }, [])

  const tagsNorm = useMemo(() => normalizeTags(), [])

  const filtered = useMemo(() => {
    return filterTags(tagsNorm, uiFilters)
  }, [tagsNorm, uiFilters])

  const sections = useMemo(() => {
    return buildTagsSections(filtered, { sort })
  }, [filtered, sort])

  if (isMobile) {
    return (
      <TagsManagementMobile
        uiFilters={uiFilters}
        onChangeFilters={onChangeFilters}
        sections={sections}
        sort={sort}
        sortOptions={TAGS_SORT_OPTIONS}
        onChangeSortBy={onChangeSortBy}
        onChangeSortDirection={onChangeSortDirection}
      />
    )
  }

  return (
    <Box sx={sx.page}>
      <Sheet variant="soft" sx={sx.header}>
        <Typography level="h3" noWrap startDecorator={iconUi({ id: 'tags' })}>
          ניהול תגים
        </Typography>
      </Sheet>

      <Box sx={sx.content}>
        <TagsFiltersRow
          value={uiFilters}
          onChange={onChangeFilters}
          sort={sort}
          sortOptions={TAGS_SORT_OPTIONS}
          onChangeSortBy={onChangeSortBy}
          onChangeSortDirection={onChangeSortDirection}
        />

        <Box className="dpScrollThin" sx={sx.listScroll}>
          <TagsList sections={sections} />
        </Box>
      </Box>
    </Box>
  )
}
