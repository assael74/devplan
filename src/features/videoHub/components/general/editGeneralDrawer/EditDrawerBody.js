// videoHub/components/general/editGeneralDrawer/EditDrawerBody.js

import React, { useMemo } from 'react'
import { Box, Textarea, Typography, Divider } from '@mui/joy'

import VideoNameField from '../../../../../ui/fields/inputUi/videos/VideoNameField'
import TagsContainer from '../../../../../ui/domains/tags/TagInputContainer'

import { editDrawerSx as sx } from './sx/editDrawer.sx'

export default function EditDrawerBody({ draft, setDraft, disabled, context }) {
  const tagOptions = useMemo(() => {
    const opts = context?.tags || []
    return Array.isArray(opts) ? opts : []
  }, [context?.tags])

  return (
    <Box sx={{ display: 'grid', gap: 1, px: 4, py: 1 }}>
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
          value={draft?.tagIds || []}
          options={tagOptions || []}
          onChange={(tagIds) => setDraft({ ...draft, tagIds })}
          disabled={disabled}
          type='general'
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
