// src/ui/fields/selectUi/videos/ui/VideoPreviewMedia.js
import { Box } from '@mui/joy'
import ImageNotSupportedRounded from '@mui/icons-material/ImageNotSupportedRounded'
import { getDriveThumbUrl } from '../../../../../shared/media/driveLinks.js'

const safe = (v) => (v == null ? '' : String(v).trim())

const getThumb = (link) => {
  const base = getDriveThumbUrl(link)
  if (!base) return ''
  return base.includes('sz=') ? base : `${base}&sz=w320-h180`
}

export default function VideoPreviewMedia({ video, compact = false }) {
  const link = safe(video?.link || video?.videoLink || video?.url || video?.videoUrl)
  const thumb = getThumb(link)

  return (
    <Box
      sx={{
        width: '100%',
        aspectRatio: '16 / 9',
        borderRadius: compact ? 'sm' : 'md',
        overflow: 'hidden',
        bgcolor: 'neutral.softBg',
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {thumb ? (
        <Box
          component="img"
          src={thumb}
          alt=""
          referrerPolicy="no-referrer"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.tertiary',
          }}
        >
          <ImageNotSupportedRounded sx={{ fontSize: compact ? 16 : 20 }} />
        </Box>
      )}
    </Box>
  )
}
