// ui/forms/VideoCreateForm.js
import React, { useEffect, useMemo } from 'react'
import { Box } from '@mui/joy'

import { vaSx } from './ui/videoAnalysis/sx/form.sx.js'
import VideoLinkField from '../fields/inputUi/videos/VideoLinkField'
import VideoNameField from '../fields/inputUi/videos/VideoNameField'

const clean = (v) => String(v ?? '').trim()

export default function VideoCreateForm({
  draft = {},
  onDraft,
  onValidChange,
}) {
  const name = draft.name || ''
  const link = draft.link || ''

  const isValid = useMemo(() => {
    return !!clean(name) && !!clean(link)
  }, [name, link])

  useEffect(() => {
    onValidChange(isValid)
  }, [isValid, onValidChange])

  return (
    <Box sx={vaSx.root}>
      <Box sx={vaSx.grid2}>
        <VideoNameField
          value={name}
          onChange={(v) => onDraft({ ...draft, name: v })}
          required
        />
        <VideoLinkField
          value={link}
          onChange={(v) => onDraft({ ...draft, link: v })}
          required
        />
      </Box>
    </Box>
  )
}
