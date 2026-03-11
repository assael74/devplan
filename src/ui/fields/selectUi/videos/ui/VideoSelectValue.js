// src/ui/fields/selectUi/videos/ui/VideoSelectValue.js

import { Box, Typography } from '@mui/joy'
import VideoPreviewMedia from './VideoPreviewMedia.js'

const safe = (v) => (v == null ? '' : String(v).trim())

export default function VideoSelectValue({ opt }) {
  if (!opt) return null

  const sub = `וידאו לא משוייך${safe(opt?.ym) ? ` • ${safe(opt.ym)}` : ''}`

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, width: '100%' }}>
      <Box sx={{ width: 38, minWidth: 38 }}>
        <VideoPreviewMedia video={opt?.raw || opt} compact />
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography level="body-sm" fontWeight="lg" noWrap>
          {safe(opt?.label || opt?.name) || 'וידאו'}
        </Typography>

        <Typography level="body-xs" sx={{ fontSize: 10, opacity: 0.72 }} noWrap>
          {sub}
        </Typography>
      </Box>
    </Box>
  )
}
