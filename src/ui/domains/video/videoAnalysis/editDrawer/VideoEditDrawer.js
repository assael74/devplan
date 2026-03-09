// C:\projects\devplan\src\ui\domains\video\videoAnalysis\drawer\VideoEditDrawer.js
import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { Drawer, Sheet } from '@mui/joy'
import VideoEditDrawerFooter from './VideoEditDrawerFooter'
import VideoEditDrawerHeader from './VideoEditDrawerHeader'
import VideoEditDrawerBody from './VideoEditDrawerBody'
import { buildVideoEditDrawerSx } from './videoEditDrawer.sx.js'

export default function VideoEditDrawer({
  open,
  onClose,
  video,
  onSave,
  context,
  adapter,
  titleFallback = 'עריכת וידאו',
}) {
  const sx = buildVideoEditDrawerSx('videoAnalysis')
  const original = useMemo(() => adapter?.buildOriginal?.(video), [adapter, video])
  const [draft, setDraft] = useState(original)
  const [busy, setBusy] = useState(false)

  // prevents init-loop when `video` identity churns while drawer is open
  const lastInitRef = useRef({ open: false, videoId: null })

  useEffect(() => {
    if (!open) {
      lastInitRef.current = { open: false, videoId: null }
      return
    }

    const vid = video?.id || null
    const prev = lastInitRef.current || { open: false, videoId: null }
    if (prev.open && prev.videoId === vid) return

    lastInitRef.current = { open: true, videoId: vid }
    setDraft(original)
  }, [open, video?.id, original])

  const dirty = useMemo(() => adapter?.isDirty?.(draft, original), [adapter, draft, original])
  const saveDisabled = !dirty || busy || !video?.id

  const reset = useCallback(() => setDraft(original), [original])

  const handleSave = useCallback(async () => {
    if (saveDisabled) return
    if (typeof onSave !== 'function') return

    try {
      setBusy(true)
      const patch = adapter?.buildPatch?.(draft, original) || {}
      await onSave({ video, patch })
      onClose()
    } catch (e) {
      console.error('[VideoEditDrawerBase] save failed', e)
    } finally {
      setBusy(false)
    }
  }, [saveDisabled, onSave, adapter, draft, original, video, onClose])

  const title = video?.name || video?.title || titleFallback

  return (
    <Drawer
      open={!!open}
      onClose={onClose}
      anchor="right"
      slotProps={{
        content: { sx: sx?.content },
      }}
    >
      <Sheet variant="outlined" sx={sx?.sheet}>
        <VideoEditDrawerHeader title={title} onClose={onClose} sx={sx} />

        <VideoEditDrawerBody
          draft={draft}
          setDraft={setDraft}
          disabled={busy}
          context={context}
          sx={sx}
        />

        <VideoEditDrawerFooter
          dirty={dirty}
          busy={busy}
          saveDisabled={saveDisabled}
          onReset={reset}
          onSave={handleSave}
          sx={sx}
        />
      </Sheet>
    </Drawer>
  )
}
