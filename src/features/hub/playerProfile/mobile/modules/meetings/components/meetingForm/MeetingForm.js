// features/hub/playerProfile/mobile/modules/meetings/components/meetingForm/MeetingForm.js

import React from 'react'

import MeetingEditFields from '../../../../../../../../ui/forms/meetings/MeetingEditFields.js'
import { getMeetingEditFormLayout } from '../../../../../../../../ui/forms/meetings/edit.layout.js'

const layout = getMeetingEditFormLayout({ isMobile: true })

export default function MeetingForm({ isEditing, draft, onDraft }) {
  return (
    <MeetingEditFields
      draft={draft}
      layout={layout}
      onDraft={onDraft}
      readOnly={!isEditing}
    />
  )
}
