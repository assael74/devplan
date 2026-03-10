// previewDomainCard/domains/team/videos/components/drawer/EditFormDrawer.js

import React from 'react'
import { Box, Typography, Divider } from '@mui/joy'

import YearPicker from '../../../../../../../../../../ui/fields/dateUi/YearPicker.js'
import MonthPicker from '../../../../../../../../../../ui/fields/dateUi/MonthPicker.js'
import VideoNameField from '../../../../../../../../../../ui/fields/inputUi/videos/VideoNameField.js'
import TagsContainer from '../../../../../../../../../../ui/domains/tags/TagInputContainer.js'
import VideoCommentsField from '../../../../../../../../../../ui/fields/inputUi/videos/VideoCommentsField.js'

import { drawerFormrSx as sx } from '../../sx/editFormDrawer.sx.js'

export default function EditFormDrawer({ draft, setDraft, context }) {
  return (
    <Box sx={sx.bodySx} className="dpScrollThin">
      <Box sx={sx.sectionCardSx}>
        <Divider>
          <Typography sx={sx.sectionTitleSx}>פרטי הוידאו</Typography>
        </Divider>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 0.85,
            pt: 0.85,
          }}
        >
          <Box sx={{ gridColumn: '1 / -1', mb: 2 }}>
            <VideoNameField
              size="sm"
              value={draft.name}
              onChange={(value) => setDraft((prev) => ({ ...prev, name: value || '' }))}
            />
          </Box>

          <MonthPicker
            size="sm"
            value={draft.month}
            onChange={(value) => setDraft((prev) => ({ ...prev, month: value || '' }))}
          />

          <YearPicker
            size="sm"
            value={draft.year}
            onChange={(value) => setDraft((prev) => ({ ...prev, year: value || '' }))}
          />
        </Box>
      </Box>
      <Box sx={sx.sectionCardSx}>
        <Divider>
          <Typography sx={sx.sectionTitleSx}>הערות</Typography>
        </Divider>

        <Box sx={{ gridColumn: '1 / -1', mt: 2 }}>
          <VideoCommentsField
            minRows={2}
            placeholder="הערות"
            value={draft.notes}
            onChange={(value) => setDraft((prev) => ({ ...prev, notes: value || '' }))}
          />
        </Box>
      </Box>

      <Box sx={sx.sectionCardSx}>
        <Divider>
          <Typography sx={sx.sectionTitleSx}>תגים</Typography>
        </Divider>

        <Box sx={{ gridColumn: '1 / -1', minWidth: 0, pb: 3, mt: 2 }}>
          <TagsContainer
            value={draft.tagIds || []}
            options={context?.tags || []}
            onChange={(tagIds) => setDraft((prev) => ({ ...prev, tagIds }))}
            type="analysis"
            chipVariant="solid"
            typeColor="#0F766E"
          />
        </Box>
      </Box>
    </Box>
  )
}
