// hub/components/preview/views/components/clubDrawer/ClubEditFormDrawer.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import ClubNameField from '../../../../../../../ui/fields/inputUi/clubs/ClubNameField.js'
import ClubIfaLinkField from '../../../../../../../ui/fields/inputUi/clubs/ClubIfaLinkField.js'
import ClubActiveSelector from '../../../../../../../ui/fields/checkUi/clubs/ClubActiveSelector.js'

import { editDrawerSx as sx } from './sx/editDrawer.sx.js'

export default function ClubEditFormDrawer({ draft, setDraft }) {
  return (
    <Box sx={sx.content} className="dpScrollThin">
      <Box sx={sx.sectionCardSx}>
        <Typography sx={{ fontWeight: 700, px: 0.25 }}>פרטי המועדון</Typography>

        <Box sx={sx.gridInfoSx}>
          <ClubNameField
            size="sm"
            value={draft.clubName}
            onChange={(value) =>
              setDraft((prev) => ({ ...prev, clubName: value || '' }))
            }
          />

          <ClubIfaLinkField
            size="sm"
            value={draft.ifaLink}
            onChange={(value) =>
              setDraft((prev) => ({ ...prev, ifaLink: value || '' }))
            }
          />
        </Box>

        <Box sx={sx.inlineChecksSx}>
          <ClubActiveSelector
            size="sm"
            value={draft.active}
            onChange={(value) =>
              setDraft((prev) => ({ ...prev, active: Boolean(value) }))
            }
          />
        </Box>
      </Box>
    </Box>
  )
}
