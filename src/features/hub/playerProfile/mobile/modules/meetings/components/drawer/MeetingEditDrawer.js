// MeetingEditDrawer.js
import React, { useEffect, useMemo, useState } from 'react'
import { Drawer, Sheet, Box, Typography, IconButton, Button, Chip } from '@mui/joy'

import { meetingToDraft, draftToPayload } from './meetingDraft.mapper.js'
import { buildSubtitle, statusChipProps, validateDraft } from './form.logic.js'
import MeetingFormGrid from './MeetingFormGrid'
import MeetingStatusRow from './MeetingStatusRow'

import {
  drawerSlotSx,
  sheetSx,
  headerSx,
  headerTitleWrapSx,
  headerTitleSx,
  headerChipSx,
  headerSubtitleSx,
  closeBtnSx,
  bodySx,
  footerSx,
} from './MeetingEditDrawer.sx.js'

export default function MeetingEditDrawer({ open, meeting, onClose, onSave, context }) {
  const initial = useMemo(() => meetingToDraft(meeting), [meeting])
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    setDraft(initial)
  }, [initial])

  const subtitle = useMemo(() => buildSubtitle(draft), [draft?.meetingDate, draft?.meetingHour])
  const chip = statusChipProps(draft?.status?.id)
  const canSave = useMemo(() => validateDraft(draft).ok, [draft])

  return (
    <Drawer open={!!open} onClose={onClose} anchor="bottom" slotProps={drawerSlotSx}>
      <Sheet {...sheetSx}>
        {/* --- Header (sticky) --- */}
        <Box {...headerSx}>
          <Box {...headerTitleWrapSx}>
            <Typography level="title-md" {...headerTitleSx}>
              {draft?.id ? 'עריכת מפגש' : 'יצירת מפגש'}
            </Typography>

            <Chip size="sm" variant="soft" color={chip.color} {...headerChipSx}>
              {chip.label}
            </Chip>

            <Typography level="body-xs" {...headerSubtitleSx}>
              {subtitle}
            </Typography>
          </Box>

          <IconButton variant="plain" onClick={onClose} {...closeBtnSx}>
            ✕
          </IconButton>
        </Box>

        {/* --- Body (scroll) --- */}
        <Box {...bodySx}>
          <MeetingFormGrid draft={draft} setDraft={setDraft} context={context} />
          <MeetingStatusRow draft={draft} setDraft={setDraft} />
        </Box>

        {/* --- Footer (sticky) --- */}
        <Box {...footerSx}>
          <Button size="sm" variant="plain" onClick={onClose}>
            ביטול
          </Button>

          <Button
            size="sm"
            variant="solid"
            disabled={!canSave}
            onClick={() => {
              const payload = draftToPayload(draft)
              onSave?.(payload)
            }}
          >
            שמור
          </Button>
        </Box>
      </Sheet>
    </Drawer>
  )
}
