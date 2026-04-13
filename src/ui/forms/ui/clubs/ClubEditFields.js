// ui/forms/ui/clubs/ClubEditFields.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import ClubNameField from '../../../fields/inputUi/clubs/ClubNameField.js'
import ClubIfaLinkField from '../../../fields/inputUi/clubs/ClubIfaLinkField.js'
import ClubActiveSelector from '../../../fields/checkUi/clubs/ClubActiveSelector.js'

import { editSx as sx } from './sx/edit.sx.js'

function getClubEditFieldsState(draft = {}) {
  return {
    clubName: draft?.clubName || '',
    ifaLink: draft?.ifaLink || '',
    active: draft?.active === true,
  }
}

export default function ClubEditFields({
  draft = {},
  onDraft,
  title = 'פרטי המועדון',
}) {
  const { clubName, ifaLink, active } = getClubEditFieldsState(draft)

  return (
    <Box sx={sx.root} className="dpScrollThin">
      <Box sx={sx.sectionCard}>
        <Typography sx={{ fontWeight: 700, px: 0.25 }}>{title}</Typography>

        <Box sx={sx.gridInfo}>
          <ClubNameField
            size="sm"
            value={clubName}
            onChange={(value) =>
              onDraft?.((prev) => ({ ...prev, clubName: value || '' }))
            }
          />

          <ClubIfaLinkField
            size="sm"
            value={ifaLink}
            onChange={(value) =>
              onDraft?.((prev) => ({ ...prev, ifaLink: value || '' }))
            }
          />
        </Box>

        <Box sx={sx.inlineChecks}>
          <ClubActiveSelector
            size="sm"
            value={active}
            onChange={(value) =>
              onDraft?.((prev) => ({ ...prev, active: Boolean(value) }))
            }
          />
        </Box>
      </Box>
    </Box>
  )
}
