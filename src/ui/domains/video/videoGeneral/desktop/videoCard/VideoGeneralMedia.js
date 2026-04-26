// src/ui/domains/video/videoGeneral/desktop/videoCard/VideoGeneralDesktopMedia.js

import React, { useMemo, useState } from 'react'
import { Box } from '@mui/joy'
import ImageNotSupportedRounded from '@mui/icons-material/ImageNotSupportedRounded'

import { getDriveThumbUrl, getDrivePreviewUrl } from '../../../../../../shared/media/driveLinks.js'
import { iconUi } from '../../../../../core/icons/iconUi.js'
import { videoGeneralDesktopMediaSx as sx } from './sx/media.sx.js'

function getThumb(link) {
  const base = getDriveThumbUrl(link)
  if (!base) return ''
  return base.includes('sz=') ? base : `${base}&sz=w640-h360`
}

export default function VideoGeneralDesktopMedia({
  video,
  onWatch,
}) {
  const [imgOk, setImgOk] = useState(true)

  const link = video?.link || video?.videoLink || ''
  const thumb = useMemo(() => getThumb(link), [link])
  const preview = useMemo(() => getDrivePreviewUrl(link), [link])
  const canWatch = !!preview && typeof onWatch === 'function'

  return (
    <Box
      sx={sx.cardMedia}
      role={canWatch ? 'button' : undefined}
      tabIndex={canWatch ? 0 : undefined}
      onClick={canWatch ? () => onWatch(video) : undefined}
      onKeyDown={
        canWatch
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onWatch(video)
              }
            }
          : undefined
      }
    >
      {thumb && imgOk ? (
        <>
          <Box
            component="img"
            src={thumb}
            alt=""
            loading="lazy"
            className="video-img"
            referrerPolicy="no-referrer"
            onError={() => setImgOk(false)}
            sx={sx.cardImg}
          />

          <Box className="video-overlay" sx={sx.boxOverlay} />

          {canWatch ? (
            <Box sx={sx.playBadge}>
              {iconUi({ id: 'playVideo', size: 'sm' })}
            </Box>
          ) : null}
        </>
      ) : (
        <Box sx={sx.cardMediaFallback}>
          <ImageNotSupportedRounded />
        </Box>
      )}
    </Box>
  )
}
