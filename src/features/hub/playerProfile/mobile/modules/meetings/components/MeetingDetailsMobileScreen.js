// playerProfile/mobile/modules/meetings/components/MeetingDetailsMobileScreen.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { normalizeMeetingStatus } from '../../../../../../../shared/meetings/meetings.status.js'
import { buildMeetingPatch } from '../../../../../../../shared/meetings/meetings.patch.js'

import MeetingDetailsMobileHeader from './MeetingDetailsMobileHeader.js'
import MeetingDetailsForm from './MeetingDetailsForm.js'
import MeetingNotesPanel from './MeetingNotesPanel.js'
import MeetingTagsPanel from './MeetingTagsPanel.js'
import MeetingVideoPanel from './MeetingVideoPanel.js'

function makeDraftFromSelected(selected) {
  return {
    id: selected?.id || '',
    title: selected?.title || '',
    meetingDate: selected?.meetingDate || selected?.date || '',
    meetingHour: selected?.meetingHour || selected?.time || '',
    type: selected?.type || '',
    status: normalizeMeetingStatus(selected?.status),
    notes: selected?.notes || '',
    tags: Array.isArray(selected?.tags) ? selected.tags : [],
    videoId: selected?.videoId || selected?.videoLink || '',
  }
}

export default function MeetingDetailsMobileScreen({
  sx,
  selected,
  pending = false,
  onBack,
  onSave,
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
      <Sheet sx={sx.detailsScreen} variant="outlined">
        <Box sx={sx.emptyState}>
          <Typography level="body-sm" sx={{ opacity: 0.75 }}>
            לא נבחרה פגישה.
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
    <Sheet sx={sx.detailsScreen} variant="outlined">
      <MeetingDetailsMobileHeader
        sx={sx}
        selected={selected}
        isEditing={isEditing}
        pending={pending}
        isDirty={isDirty}
        canSave={canSave}
        onBack={onBack}
        onStartEdit={() => setIsEditing(true)}
        onCancel={handleCancel}
        onSave={handleSave}
      />

      <Box sx={sx.detailsScroll} className="dpScrollThin">
        <MeetingDetailsForm
          sx={sx}
          isEditing={isEditing}
          draft={draft}
          onDraft={setDraft}
        />

        <MeetingNotesPanel
          sx={sx}
          isEditing={isEditing}
          selected={selected}
          draft={draft}
          onDraft={setDraft}
        />

        <MeetingTagsPanel
          sx={sx}
          selected={draft || selected}
        />

        <MeetingVideoPanel
          sx={sx}
          selected={draft || selected}
          onOpenVideo={onOpenVideo}
        />
      </Box>
    </Sheet>
  )
}
