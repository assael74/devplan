// clubProfile/mobile/modules/management/components/ClubManagementInfoCard.js

import React from 'react'
import { Box, Sheet } from '@mui/joy'

import ClubNameField from '../../../../../../../ui/fields/inputUi/clubs/ClubNameField.js'
import ClubIfaLinkField from '../../../../../../../ui/fields/inputUi/clubs/ClubIfaLinkField.js'
import ClubActiveSelector from '../../../../../../../ui/fields/checkUi/clubs/ClubActiveSelector.js'

import { moduleSx as sx } from '../module.sx.js'

export default function ClubManagementInfoCard({
  draft,
  onDraft,
}) {
  return (
    <Sheet variant="soft" sx={sx.card}>
      <Box sx={sx.firstRow}>
        <Box sx={{ pt: 3 }}>
          <ClubActiveSelector
            value={draft?.active}
            onChange={(v) => onDraft({ ...draft, active: v })}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <ClubNameField
            value={draft?.clubName || ''}
            size="sm"
            onChange={(v) => onDraft({ ...draft, clubName: v })}
          />
        </Box>
      </Box>

      <Box sx={sx.secondRow}>
        <Box sx={{ minWidth: 0 }}>
          <ClubIfaLinkField
            value={draft?.ifaLink || ''}
            size="sm"
            onChange={(v) => onDraft({ ...draft, ifaLink: v })}
          />
        </Box>
      </Box>
    </Sheet>
  )
}
