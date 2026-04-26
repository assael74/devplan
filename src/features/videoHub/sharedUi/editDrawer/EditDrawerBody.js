// src/features/videoHub/sharedUi/editDrawer/EditDrawerBody.js

import React, { useMemo } from 'react'
import { Box, Textarea, Typography, Divider } from '@mui/joy'

import VideoNameField from '../../../../ui/fields/inputUi/videos/VideoNameField.js'
import TagsContainer from '../../../../ui/domains/tags/TagInputContainer.js'

export default function EditDrawerBody({
  draft,
  setDraft,
  disabled,
  context,
}) {
  const tagOptions = useMemo(() => {
    const opts = context?.tags || []
    return Array.isArray(opts) ? opts : []
  }, [context?.tags])

  return (
    <Box sx={{ display: 'grid', gap: 1, minHeight: 0 }}>
      <Box sx={{ display: 'grid', gap: 0.5 }}>
        <VideoNameField
          value={draft?.name || ''}
          onChange={(value) => setDraft({ ...draft, name: value })}
          required
          disabled={!!disabled}
        />
      </Box>

      <Divider sx={{ my: 1.25 }}>
        <Typography level="body-xs" sx={{ opacity: 0.75 }}>
          תגים
        </Typography>
      </Divider>

      <Box sx={{ display: 'grid', gap: 0.5 }}>
        <TagsContainer
          title="תגים לוידאו"
          value={draft?.tagIds || []}
          options={tagOptions}
          onChange={(tagIds) => setDraft({ ...draft, tagIds })}
          disabled={!!disabled}
          type="general"
        />
      </Box>

      <Divider sx={{ my: 1.25 }}>
        <Typography level="body-xs" sx={{ opacity: 0.75 }}>
          הערות
        </Typography>
      </Divider>

      <Box sx={{ display: 'grid', gap: 0.5 }}>
        <Textarea
          minRows={3}
          value={draft?.notes || ''}
          onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
          placeholder="הערות קצרות על הוידאו…"
          disabled={!!disabled}
        />
      </Box>
    </Box>
  )
}
