import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Drawer, Sheet } from '@mui/joy'

import EditDrawerHeader from './EditDrawerHeader'
import EditDrawerBody from './EditDrawerBody'
import EditDrawerFooter from './EditDrawerFooter'
import { editDrawerSx as sx } from './sx/editDrawer.sx'

import { useVideoHubUpdate } from '../../../hooks/useVideoHubUpdate.js'
import { useLifecycle } from '../../../../../ui/domains/entityLifecycle/LifecycleProvider'

import {
  buildInitialDraft,
  buildPatch,
  getIsDirty,
} from './logic/videoEdit.logic.js'

export default function EditDrawer({
  open,
  onClose,
  video,
  onSaved,
  context,
  titleFallback = 'עריכת וידאו',
  entityType = 'general', // general | analysis
}) {
  const initial = useMemo(() => buildInitialDraft(video), [video])
  const [draft, setDraft] = useState(initial)
  const lifecycle = useLifecycle()

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const dirty = useMemo(() => getIsDirty(draft, initial), [draft, initial])
  const patch = useMemo(() => buildPatch(draft, initial), [draft, initial])

  const { run, pending } = useVideoHubUpdate(video)
  const saveDisabled = !initial?.id || !dirty || pending

  const handleSave = useCallback(async () => {
    if (saveDisabled) return

    await run(entityType, patch, {
      section: entityType === 'analysis' ? 'videoEditDrawer' : 'videoGeneralEditDrawer',
      videoId: initial?.id,
      createIfMissing: true,
    })

    if (typeof onSaved === 'function') {
      onSaved(patch, { ...initial?.raw, ...patch })
    }

    onClose()
  }, [saveDisabled, run, entityType, patch, initial, onSaved, onClose])

  const handleReset = useCallback(() => {
    setDraft(initial)
  }, [initial])

  const handleDelete = useCallback(() => {
    if (!video?.id) return

    lifecycle.openLifecycle(
      {
        entityType: entityType === 'analysis' ? 'videoAnalysis' : 'video',
        id: video.id,
        name: video?.name || video?.title || 'וידאו',
      },
      {
        onAfterSuccess: ({ action, id }) => {
          if (action !== 'delete') return
          if (id !== video.id) return
          onClose?.()
        },
      }
    )
  }, [lifecycle, entityType, video, onClose])

  return (
    <Drawer
      open={!!open}
      onClose={onClose}
      anchor="right"
      slotProps={{ content: { sx: sx.drawerSx } }}
    >
      <Sheet variant="outlined" sx={sx.drawerSheet}>
        <EditDrawerHeader
          title={video?.name || video?.title || titleFallback}
          onClose={onClose}
        />

        <EditDrawerBody
          draft={draft}
          setDraft={setDraft}
          disabled={pending}
          context={context}
        />

        <EditDrawerFooter
          dirty={dirty}
          busy={pending}
          saveDisabled={saveDisabled}
          onReset={handleReset}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      </Sheet>
    </Drawer>
  )
}
