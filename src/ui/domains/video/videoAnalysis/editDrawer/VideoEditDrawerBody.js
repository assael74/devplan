// videoHub/components/analysis/editDrawer/VideoEditDrawerBody.js
import React, { useMemo } from 'react'
import { Box, Textarea, Typography, Divider } from '@mui/joy'

import VideoNameField from '../../../../../ui/fields/inputUi/videos/VideoNameField'
import TagsContainer from '../../../../../ui/domains/tags/TagInputContainer'

export default function VideoEditDrawerBody({ draft, setDraft, disabled, context, sx }) {
  const tagOptions = useMemo(() => {
    const opts =
      context?.tags ||
      context?.tagOptions ||
      context?.analysisTags ||
      []
    return Array.isArray(opts) ? opts : []
  }, [context?.tags, context?.tagOptions, context?.analysisTags])

  return (
    <Box sx={sx.body}>
      {/* שם */}
      <Box sx={{ display: 'grid', gap: 0.5 }}>
        <VideoNameField
          value={draft?.name || ''}
          onChange={(v) => setDraft({ ...draft, name: v })}
          required
          disabled={disabled?.name}
        />
      </Box>

      <Divider sx={{ my: 2 }}>
        <Typography level="body-xs" sx={{ opacity: 0.75 }}>תגים</Typography>
      </Divider>

      {/* תגים */}
      <Box sx={{ display: 'grid', gap: 0.5 }}>
        <TagsContainer
          title="תגים לוידאו"
          value={draft.tagIds || []}
          options={tagOptions || []}
          onChange={(tagIds) => setDraft({ ...draft, tagIds })}
          disabled={disabled}
          type='analysis'
        />
      </Box>

      <Divider sx={{ my: 2 }}>
        <Typography level="body-xs" sx={{ opacity: 0.75 }}>הערות</Typography>
      </Divider>

      {/* הערות */}
      <Box sx={{ display: 'grid', gap: 0.5 }}>
        <Textarea
          minRows={3}
          value={draft?.notes || ''}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          placeholder="הערות קצרות על הוידאו…"
          disabled={disabled?.notes}
        />
      </Box>
    </Box>
  )
}
