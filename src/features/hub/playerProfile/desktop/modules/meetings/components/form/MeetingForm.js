// features/hub/playerProfile/desktop/modules/meetings/components/form/MeetingForm.js

import React from 'react'

import MeetingEditFields from '../../../../../../../../ui/forms/meetings/MeetingEditFields.js'
import { getMeetingEditFormLayout } from '../../../../../../../../ui/forms/meetings/edit.layout.js'

const layout = getMeetingEditFormLayout({ isMobile: false })

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
