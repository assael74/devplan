import React from 'react'
import { Box, Typography, Divider } from '@mui/joy'

import YearPicker from '../../../fields/dateUi/YearPicker.js'
import MonthPicker from '../../../fields/dateUi/MonthPicker.js'
import VideoNameField from '../../../fields/inputUi/videos/VideoNameField.js'
import TagsContainer from '../../../domains/tags/TagInputContainer.js'
import VideoCommentsField from '../../../fields/inputUi/videos/VideoCommentsField.js'

const sx = {
  sectionCard: {
    display: 'grid',
    gap: 1,
    p: 1.25,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
    gap: 0.85,
    pt: 0.85,
  }
}

export default function VideoAnalysisEditFields({
  draft,
  setDraft,
  context,
}) {
  const setField = (key) => (value) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <Box sx={{ display: 'grid', gap: 1.25 }}>
      <Box sx={sx.sectionCard} >
        <Divider>
          <Typography sx={{ fontWeight: 600 }}>פרטי הוידאו</Typography>
        </Divider>

        <Box sx={sx.grid}>
          <Box sx={{ gridColumn: '1 / -1', mb: 2 }}>
            <VideoNameField
              size="sm"
              value={draft?.name || ''}
              onChange={(value) => setField('name')(value || '')}
            />
          </Box>

          <MonthPicker
            size="sm"
            value={draft?.month ?? ''}
            onChange={(value) => setField('month')(value || '')}
          />

          <YearPicker
            size="sm"
            value={draft?.year ?? ''}
            onChange={(value) => setField('year')(value || '')}
          />
        </Box>
      </Box>

      <Box sx={sx.sectionCard}>
        <Divider>
          <Typography sx={{ fontWeight: 600 }}>הערות</Typography>
        </Divider>

        <Box sx={{ gridColumn: '1 / -1', mt: 2 }}>
          <VideoCommentsField
            minRows={2}
            placeholder="הערות"
            value={draft?.notes || ''}
            onChange={(value) => setField('notes')(value || '')}
          />
        </Box>
      </Box>

      <Box sx={sx.sectionCard}>
        <Divider>
          <Typography sx={{ fontWeight: 600 }}>תגים</Typography>
        </Divider>

        <Box sx={{ gridColumn: '1 / -1', minWidth: 0, pb: 3, mt: 2 }}>
          <TagsContainer
            value={draft?.tagIds || []}
            options={context?.tags || []}
            onChange={(tagIds) =>
              setDraft((prev) => ({
                ...prev,
                tagIds,
              }))
            }
            type="analysis"
            chipVariant="solid"
            typeColor="#0F766E"
          />
        </Box>
      </Box>
    </Box>
  )
}
