// MeetingsDomainModal.js
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Button, Sheet, Input, Chip } from '@mui/joy'
import { useCoreData } from '../../../../../../../coreData/CoreDataProvider.js'
import { buildMeetingsTable } from './logic/meetings.table.logic.js'
import { useMeetingsUpdater } from './logic/useMeetingsUpdater.js'
import { useMeetingsState } from './logic/useMeetingsState.js'
import { sx } from './meetingsDomainModal.sx.js'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import MeetingsEditDrawer from './drawer/MeetingsEditDrawer'
import MeetingsEditNotesDrawer from './drawer/MeetingsEditNotesDrawer'
import MeetingsEditVLinkDrawer from './drawer/MeetingsEditVLinkDrawer'
import MeetingsTable from './components/MeetingsTable'

export default function MeetingsDomainModal({ entity, onClose, onAdd }) {
  const { meetingsByPlayerId } = useCoreData()

  const sourceMeetings = useMemo(() => {
    const pid = entity?.id
    if (!pid) return []
    return meetingsByPlayerId?.get(pid) || []
  }, [meetingsByPlayerId, entity?.id])

  const [q, setQ] = useState('')

  const [localMeetings, setLocalMeetings] = useState(sourceMeetings)
  useEffect(() => setLocalMeetings(sourceMeetings), [sourceMeetings])

  const patchLocal = useCallback((id, patch) => {
    if (!id || !patch) return
    setLocalMeetings((prev) => (prev || []).map((m) => (m?.id === id ? { ...m, ...patch } : m)))
  }, [])

  const meetings = useMemo(() => buildMeetingsTable(localMeetings, q), [localMeetings, q])

  const { draft, setDraft, editOriginal, basicOpen, notesOpen, videoOpen, openDrawer, closeAll, dirty } =
    useMeetingsState()

  const { saveBasic, saveNotes, saveVideo, pending } = useMeetingsUpdater({ draft, editOriginal, entity })

  const busy = pending

  const makeOnSave = useCallback(
    (saveFn, label) =>
      async () => {
        const id = draft?.id
        if (!id) return

        try {
          const patch = await saveFn()
          if (patch) patchLocal(id, patch)
          closeAll()
        } catch (e) {
          console.error(`[meetings] ${label} failed`, e)
        }
      },
    [draft?.id, patchLocal, closeAll]
  )

  const onSaveBasic = makeOnSave(saveBasic, 'saveBasic')
  const onSaveNotes = makeOnSave(saveNotes, 'saveNotes')
  const onSaveVideo = makeOnSave(saveVideo, 'saveVideo')


  return (
    <Box>
      <Sheet variant="soft" sx={sx.topBar}>
        <Box sx={sx.topBarRow}>
          {iconUi({ id: 'search' })}
          <Input
            size="sm"
            placeholder="חיפוש לפי תאריך / סוג / סטטוס / הערות..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Button size="sm" variant="outlined" onClick={() => onAdd()} disabled={!onAdd || busy}>
            הוספה
          </Button>
        </Box>
      </Sheet>

      <MeetingsTable
        meetings={meetings}
        busy={busy}
        onEditBasic={(m) => openDrawer('basic', m)}
        onEditNotes={(m) => openDrawer('notes', m)}
        onEditVideo={(m) => openDrawer('video', m)}
      />

      <MeetingsEditDrawer
        open={basicOpen}
        busy={busy}
        draft={draft}
        onDraft={setDraft}
        onClose={closeAll}
        onSave={onSaveBasic}
        player={entity}
        isDirty={dirty}
      />

      <MeetingsEditNotesDrawer
        open={notesOpen}
        busy={busy}
        draft={draft}
        onDraft={setDraft}
        onClose={closeAll}
        onSave={onSaveNotes}
        player={entity}
        isDirty={dirty}
      />

      <MeetingsEditVLinkDrawer
        open={videoOpen}
        busy={busy}
        draft={draft}
        onDraft={setDraft}
        onClose={closeAll}
        onSave={onSaveVideo}
        player={entity}
        isDirty={dirty}
      />
      <Box sx={sx.modalFooter} >
        <Button size="sm" variant="outlined" onClick={onClose} disabled={busy}>
          סגירה
        </Button>
      </Box>
    </Box>
  )
}
