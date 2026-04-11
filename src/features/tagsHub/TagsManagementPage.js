// src/features/tagsHub/TagsManagementPage.js

import React, { useMemo, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { Box, Typography, Sheet } from '@mui/joy'
import { sx as pageSx } from './tags.sx'
import TagsFiltersRow from './components/TagsFiltersRow'
import TagsList from './components/TagsList'
import TagHubFabMenu from './TagHubFabMenu'
import TagEditorDrawer from './components/TagEditorDrawer'

import { useCreateModal } from '../../ui/forms/create/CreateModalProvider'
import { useCoreData } from '../coreData/CoreDataProvider.js'
import { normalizeTags, filterTags, buildTagsSections, buildEditMeta } from './tags.logic'

import { iconUi } from '../../ui/core/icons/iconUi.js'
import { buildTaskFabContext } from '../../ui/actions/buildTaskFabContext.js'
import { buildTaskPresetDraft } from '../../ui/forms/helpers/tasksForm.helpers.js'

export default function TagsManagementPage() {
  const location = useLocation()
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

  const onChangeFilters = useCallback((patch) => {
    setUiFilters((prev) => ({ ...prev, ...(patch || {}) }))
  }, [])

  const tagsNorm = useMemo(() => normalizeTags(coreTags || []), [coreTags])
  const filtered = useMemo(() => filterTags(tagsNorm, uiFilters), [tagsNorm, uiFilters])
  const sections = useMemo(() => buildTagsSections(filtered), [filtered])

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
    openCreate('tag')
  }, [openCreate])

  const onAddTask = useCallback((nextTaskContext = {}) => {
    openCreate(
      'task',
      buildTaskPresetDraft(nextTaskContext),
      { tags: tagsNorm, ...nextTaskContext },
      {
        surface: 'drawer',
        drawerAnchor: 'bottom',
        drawerWidth: 900,
      }
    )
  }, [openCreate, tagsNorm])

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

  return (
    <Box sx={pageSx.page}>
      <Sheet variant="soft" sx={pageSx.header}>
        <Typography level="h3" noWrap startDecorator={iconUi({ id: 'tags' })}>
          ניהול תגים
        </Typography>
      </Sheet>

      <Box sx={pageSx.content}>
        <TagsFiltersRow value={uiFilters} onChange={onChangeFilters} />

        <Box sx={pageSx.listWrap}>
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
        parentOptions={tagsNorm}
        onClose={onCloseDrawer}
      />
    </Box>
  )
}
