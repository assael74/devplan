// src/ui/fields/selectUi/videos/ui/VideoOptionRow.js

import { Box, Typography } from '@mui/joy'
import VideoPreviewMedia from './VideoPreviewMedia.js'

const safe = (v) => (v == null ? '' : String(v).trim())

export default function VideoOptionRow({ opt }) {
  const sub = `וידאו לא משוייך${safe(opt?.ym) ? ` • ${safe(opt.ym)}` : ''}`

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', minWidth: 0 }}>
      <Box sx={{ width: 56, minWidth: 56 }}>
        <VideoPreviewMedia video={opt?.raw || opt} />
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
