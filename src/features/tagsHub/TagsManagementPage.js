// src/features/tagsHub/TagsManagementPage.js

import React, { useMemo, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Box, Typography, Sheet } from '@mui/joy'

import { tagSx as sx } from './tags.sx'

import TagsFiltersRow from './components/desktop/TagsFiltersRow'
import TagsList from './components/desktop/TagsList'
import TagEditorDrawer from './sharedUi/TagEditorDrawer.js'

import TagsManagementMobile from './components/mobile/TagsManagementMobile'

import TagHubFabMenu from './sharedUi/TagHubFabMenu'

import { useCreateModal } from '../../ui/forms/create/CreateModalProvider'
import { useCoreData } from '../coreData/CoreDataProvider.js'
import {
  normalizeTags,
  filterTags,
  buildTagsSections,
  buildEditMeta,
  TAGS_DEFAULT_SORT,
  TAGS_SORT_OPTIONS,
} from './logic/tags.logic'

import { iconUi } from '../../ui/core/icons/iconUi.js'
import { buildTaskFabContext } from '../../ui/actions/buildTaskFabContext.js'
import { buildTaskPresetDraft } from '../../ui/forms/helpers/tasksForm.helpers.js'

export default function TagsManagementPage() {
  const location = useLocation()
  const isMobile = useMediaQuery('(max-width:899px)')

  const { openCreate } = useCreateModal()
  const { tags: coreTags } = useCoreData()

  const [uiFilters, setUiFilters] = useState({
    q: '',
    tagType: 'all',
    showArchived: false,
    hierarchy: 'all',
  })

  const [editTag, setEditTag] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

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

  const tagsNorm = useMemo(() => normalizeTags(coreTags || []), [coreTags])

  const filtered = useMemo(() => {
    return filterTags(tagsNorm, uiFilters)
  }, [tagsNorm, uiFilters])

  const sections = useMemo(() => {
    return buildTagsSections(filtered, { sort })
  }, [filtered, sort])

  const taskContext = useMemo(() => {
    return buildTaskFabContext({
      location,
      area: 'tags',
      mode: 'management',
      extra: {
        tags: tagsNorm,
      },
    })
  }, [location, tagsNorm])

  const onCreateTag = useCallback(() => {
    openCreate(
      'tag',
      {},
      {
        tags: tagsNorm,
        isMobile,
      },
    )
  }, [openCreate, tagsNorm, isMobile])

  const onAddTask = useCallback(
    (nextTaskContext = {}) => {
      openCreate(
        'task',
        buildTaskPresetDraft(nextTaskContext),
        { tags: tagsNorm, ...nextTaskContext },
      )
    },
    [openCreate, tagsNorm]
  )

  const onEdit = useCallback(
    (tag) => {
      if (!tag?.id) return

      const meta = buildEditMeta(tag, tagsNorm)
      setEditTag({ ...tag, _meta: meta })
      setDrawerOpen(true)
    },
    [tagsNorm]
  )

  const onCloseDrawer = useCallback(() => {
    setDrawerOpen(false)
    setEditTag(null)
  }, [])

  if (isMobile) {
    return (
      <TagsManagementMobile
        uiFilters={uiFilters}
        onChangeFilters={onChangeFilters}
        sections={sections}
        tagsNorm={tagsNorm}
        editTag={editTag}
        drawerOpen={drawerOpen}
        onEdit={onEdit}
        onCloseDrawer={onCloseDrawer}
        onCreateTag={onCreateTag}
        onAddTask={onAddTask}
        taskContext={taskContext}
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

        <Box sx={{ minHeight: 0, flex: 1 }}>
          <TagsList sections={sections} onEdit={onEdit} />
        </Box>
      </Box>

      <TagHubFabMenu
        onCreateTag={onCreateTag}
        onAddTask={onAddTask}
        taskContext={taskContext}
        entityType="tags"
      />

      <TagEditorDrawer
        open={drawerOpen}
        tag={editTag}
        isMobile={false}
        parentOptions={tagsNorm}
        onClose={onCloseDrawer}
      />
    </Box>
  )
}
