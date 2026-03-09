// features/hub/playerProfile/modules/meetings/components/details/MeetingDetailsPane.js
import React from 'react'
import { Box, Divider, Sheet, Typography } from '@mui/joy'

import { normalizeMeetingStatus } from '../../../../../../shared/meetings/meetings.status.js'
import { buildMeetingPatch } from '../../../../../../shared/meetings/meetings.patch.js'

import MeetingDetailsHeader from './MeetingDetailsHeader.js'
import MeetingDetailsForm from './MeetingDetailsForm.js'
import MeetingNotesPanel from './MeetingNotesPanel.js'
import MeetingTagsPanel from './MeetingTagsPanel.js'
import MeetingVideoPanel from './MeetingVideoPanel.js'

function makeDraftFromSelected(selected) {
  return {
    id: selected.id,
    title: selected.title || '',
    meetingDate: selected.meetingDate || selected.date || '',
    meetingHour: selected.meetingHour || selected.time || '',
    type: selected.type || '',
    status: normalizeMeetingStatus(selected.status),
    notes: selected.notes || '',
    tags: Array.isArray(selected.tags) ? selected.tags : [],
    videoId: selected.videoId || ''
  }
}

export default function MeetingDetailsPane({
  sx,
  selected,
  onSave,
  pending = false,
  onOpenVideo,
}) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(null)

  React.useEffect(() => {
    setIsEditing(false)
    if (!selected) {
      setDraft(null)
      return
    }
    setDraft(makeDraftFromSelected(selected))
  }, [selected?.id])

  if (!selected) {
    return (
      <Sheet sx={sx.leftPane} variant="outlined">
        <Box sx={sx.emptyLeft}>
          <Typography level="body-sm" sx={{ opacity: 0.8 }}>
            בחר מפגש מהרשימה כדי לראות פירוט.
          </Typography>
        </Box>
      </Sheet>
    )
  }

  const patch = draft ? buildMeetingPatch({ draft, original: selected }) : null
  const isDirty = Boolean(patch && Object.keys(patch).length > 0)
  const canSave = isDirty

  const handleCancel = () => {
    setIsEditing(false)
    setDraft(makeDraftFromSelected(selected))
  }

  const handleSave = async () => {
    if (!draft?.id) return
    if (!patch || !Object.keys(patch).length) return
    await onSave?.(draft.id, patch)
    setIsEditing(false)
  }

  return (
    <Sheet sx={sx.leftPane} variant="outlined">
      <MeetingDetailsHeader
        sx={sx}
        selected={selected}
        isEditing={isEditing}
        pending={pending}
        isDirty={isDirty}
        canSave={canSave}
        onStartEdit={() => setIsEditing(true)}
        onCancel={handleCancel}
        onSave={handleSave}
      />

      <Divider />

      <Box sx={sx.leftScroll} className="dpScrollThin">
        <MeetingDetailsForm sx={sx} isEditing={isEditing} draft={draft} onDraft={setDraft} />
        <MeetingNotesPanel sx={sx} isEditing={isEditing} selected={selected} draft={draft} onDraft={setDraft} />
        <MeetingTagsPanel sx={sx} selected={selected} />
        <MeetingVideoPanel sx={sx} selected={draft || selected} onOpenVideo={onOpenVideo} />
      </Box>
    </Sheet>
  )
}
