import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Drawer, Sheet } from '@mui/joy'

export default function VideoEditDrawerBase({
  open,
  onClose,
  video,
  onSave,
  context,
  adapter,
  Header,
  Body,
  Footer,
  sx,
  titleFallback = 'עריכת וידאו',
}) {
  const original = useMemo(() => adapter?.buildOriginal?.(video), [adapter, video])
  const [draft, setDraft] = useState(original)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) setDraft(original)
  }, [original, open])

  const dirty = useMemo(() => adapter?.isDirty?.(draft, original), [adapter, draft, original])
  const saveDisabled = !dirty || busy || !video?.id

  const reset = useCallback(() => setDraft(original), [original])

  const handleSave = useCallback(async () => {
    if (saveDisabled) return
    if (typeof onSave !== 'function') return

    try {
      setBusy(true)
      const patch = adapter?.buildPatch(draft, original) || {}
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
      slotProps={{ content: { sx: sx?.content } }}
    >
      <Sheet variant="outlined" sx={sx?.sheet}>
        {Header ? <Header title={title} onClose={onClose} sx={sx} /> : null}

        {Body ? (
          <Body
            draft={draft}
            setDraft={setDraft}
            disabled={busy}
            context={context}
            sx={sx}
          />
        ) : null}

        {Footer ? (
          <Footer
            dirty={dirty}
            busy={busy}
            saveDisabled={saveDisabled}
            onReset={reset}
            onSave={handleSave}
            sx={sx}
          />
        ) : null}
      </Sheet>
    </Drawer>
 )
}
