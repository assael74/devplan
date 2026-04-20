import React from 'react'
import { Box, Typography, Divider } from '@mui/joy'

import YearPicker from '../../../fields/dateUi/YearPicker.js'
import MonthPicker from '../../../fields/dateUi/MonthPicker.js'
import VideoNameField from '../../../fields/inputUi/videos/VideoNameField.js'
import TagsContainer from '../../../domains/tags/TagInputContainer.js'
import VideoCommentsField from '../../../fields/inputUi/videos/VideoCommentsField.js'

const sx = {
  root: (layout) => ({
    display: 'grid',
    gap: 1.25,
    minWidth: 0,
  }),

  block: (cols = '1fr', gap = 0.85) => ({
    display: 'grid',
    gridTemplateColumns: cols,
    gap,
    minWidth: 0,
  }),

  title: {
    fontWeight: 600,
  },
}

export default function VideoAnalysisEditFields({
  draft,
  onDraft,
  context,
  layout = {
    topCols: { xs: '1fr', md: '1fr' },
    mainCols: { xs: '1fr', md: '1fr 1fr' },
    notesCols: { xs: '1fr', md: '1fr' },
    tagsCols: { xs: '1fr', md: '1fr' },
  },
  fieldDisabled = {},
}) {
  return (
    <Box sx={sx.root(layout)}>
      <Divider>
        <Typography level="title-sm" sx={sx.title}>
          פרטי הוידאו
        </Typography>
      </Divider>

      <Box sx={sx.block(layout.topCols, 1)}>
        <VideoNameField
          size="sm"
          value={draft?.name || ''}
          onChange={(value) =>
            onDraft({
              ...draft,
              name: value || '',
            })
          }
        />
      </Box>

      <Box sx={sx.block(layout.mainCols)}>
        <MonthPicker
          size="sm"
          value={draft?.month ?? ''}
          onChange={(value) =>
            onDraft({
              ...draft,
              month: value || '',
            })
          }
        />

        <YearPicker
          size="sm"
          value={draft?.year ?? ''}
          onChange={(value) =>
            onDraft({
              ...draft,
              year: value || '',
            })
          }
        />
      </Box>

      <Divider>
        <Typography level="title-sm" sx={sx.title}>
          הערות
        </Typography>
      </Divider>

      <Box sx={sx.block(layout.notesCols, 1)}>
        <VideoCommentsField
          minRows={2}
          placeholder="הערות"
          value={draft?.notes || ''}
          onChange={(value) =>
            onDraft({
              ...draft,
              notes: value || '',
            })
          }
        />
      </Box>

      <Divider>
        <Typography level="title-sm" sx={sx.title}>
          תגים
        </Typography>
      </Divider>

      <Box sx={sx.block(layout.tagsCols, 1)}>
        <TagsContainer
          value={draft?.tagIds || []}
          options={context?.tags || []}
          onChange={(tagIds) =>
            onDraft({
              ...draft,
              tagIds,
            })
          }
          type="analysis"
          chipVariant="solid"
          typeColor="#0F766E"
        />
      </Box>
    </Box>
  )
}
