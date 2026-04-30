// playerProfile/mobile/modules/meetings/components/meetingForm/MeetingScreen.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import {
  buildMeetingEditInitial,
  buildMeetingEditBundle,
  getIsMeetingEditValid,
  isMeetingEditDirty,
} from '../../../../../../editLogic/mettings/index.js'

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

  const initial = React.useMemo(() => {
    return buildMeetingEditInitial(selected)
  }, [selected])

  const [draft, setDraft] = React.useState(initial)

  React.useEffect(() => {
    setIsEditing(false)
    setDraft(initial)
  }, [initial])

  const bundle = React.useMemo(() => {
    return buildMeetingEditBundle(draft, initial)
  }, [draft, initial])

  const patch = bundle?.meetingPatch || {}

  const isDirty = React.useMemo(() => {
    return isMeetingEditDirty(draft, initial)
  }, [draft, initial])

  const isValid = React.useMemo(() => {
    return getIsMeetingEditValid(draft)
  }, [draft])

  const hasPatch = Object.keys(patch).length > 0
  const canSave = Boolean(draft?.id) && isDirty && isValid && hasPatch && !pending

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
    if (pending) return
    setDraft(initial)
  }

  const handleSave = async () => {
    if (!canSave) return

    await onSave(draft.id, patch)
    setIsEditing(false)
  }

  return (
    <Sheet>
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

      <Box>
        <MeetingForm
          isEditing={isEditing}
          draft={draft}
          onDraft={setDraft}
        />

        <MeetingNotes
          isEditing={isEditing}
          selected={selected}
          draft={draft}
          onDraft={setDraft}
        />

        <MeetingVideo
          selected={draft || selected}
          onOpenVideo={onOpenVideo}
        />
      </Box>
    </Sheet>
  )
}
