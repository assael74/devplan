// features/hub/clubProfile/mobile/modules/management/components/ClubManagementInfoCard.js

import React from 'react'
import { Sheet } from '@mui/joy'

import ClubEditFields from '../../../../../../../ui/forms/clubs/ClubEditFields.js'

import { moduleSx as sx } from '../module.sx.js'

export default function ClubManagementInfoCard({
  draft,
  onDraft,
}) {
  return (
    <Sheet variant="soft" sx={sx.card}>
      <ClubEditFields
        draft={draft}
        onDraft={onDraft}
        variant="profile"
        isMobile
      />
    </Sheet>
  )
}
