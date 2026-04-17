// playerProfile/mobile/modules/meetings/components/meetingForm/MeetingScreen.js

import React from 'react'
import { Box, Divider, Sheet, Typography } from '@mui/joy'

import { normalizeMeetingStatus } from '../../../../../../../../shared/meetings/meetings.status.js'
import { useMeetingHubUpdate } from '../../../../../../hooks/meetings/useMeetingHubUpdate.js'
import {
  buildInitialDraft,
  buildPatch,
  getIsDirty,
} from '../../../../../sharedLogic/meetings/module/meetingEdit.logic.js'

import { formSx } from '../sx/form.sx.js'

import MeetingHeader from './MeetingHeader.js'
import MeetingForm from './MeetingForm.js'
import MeetingNotes from './MeetingNotes.js'
import MeetingVideo from './MeetingVideo.js'

export default function MeetingScreen({
  selected,
  onSave,
  onBack,
  pending = false,
  onOpenVideo,
}) {
  const [isEditing, setIsEditing] = React.useState(false)
  const initial = React.useMemo(() => buildInitialDraft(selected), [selected])
  const [draft, setDraft] = React.useState(initial)

  React.useEffect(() => {
    setIsEditing(false)
    setDraft(initial)
  }, [initial])

  const patch = React.useMemo(() => buildPatch(selected, draft), [selected, draft])
  const isDirty = React.useMemo(() => getIsDirty(draft, initial), [draft, initial])
  const canSave = Boolean(draft?.id) && isDirty && !pending

  if (!selected) {
    return (
      <Sheet sx={formSx.detailsScreen} variant="outlined">
        <Box sx={formSx.emptyState}>
          <Typography level="body-sm" sx={{ opacity: 0.8 }}>
            בחר פגישה מהרשימה כדי לראות פירוט.
          </Typography>
        </Box>
      </Sheet>
    )
  }

  const handleCancel = () => {
    setIsEditing(false)
    setDraft(initial)
  }

  const handleReset = () => {
    setDraft(initial)
  }

  const handleSave = async () => {
    if (!draft?.id) return
    if (!patch || !Object.keys(patch).length) return

    await onSave(draft.id, patch)
    setIsEditing(false)
  }

  return (
    <Sheet sx={formSx.detailsScreen} variant="outlined">
      <MeetingHeader
        selected={selected}
        isEditing={isEditing}
        pending={pending}
        isDirty={isDirty}
        canSave={canSave}
        onBack={onBack}
        onStartEdit={() => setIsEditing(true)}
        onCancel={handleCancel}
        onReset={handleReset}
        onSave={handleSave}
      />

      <Divider />

      <Box sx={formSx.detailsScroll} className="dpScrollThin">
        <MeetingForm isEditing={isEditing} draft={draft} onDraft={setDraft} />
        <MeetingNotes isEditing={isEditing} selected={selected} draft={draft} onDraft={setDraft} />
        <MeetingVideo selected={draft || selected} onOpenVideo={onOpenVideo} />
      </Box>
    </Sheet>
  )
}
