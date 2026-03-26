// src/features/videoHub/components/VideoCardMedia.js

import React, { useMemo, useState, useCallback } from 'react'
import {
  Box,
  IconButton,
  Tooltip,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  Divider,
  ListItemDecorator,
} from '@mui/joy'
import MoreVert from '@mui/icons-material/MoreVert'
import ImageNotSupportedRounded from '@mui/icons-material/ImageNotSupportedRounded'

import { getDriveThumbUrl, getDrivePreviewUrl } from '../../../../shared/media/driveLinks'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { videoMediaSx as sx } from './sx/media.sx'

const getThumb = (link) => {
  const base = getDriveThumbUrl(link)
  if (!base) return ''
  return base.includes('sz=') ? base : `${base}&sz=w640-h360`
}

export default function VideoCardMedia({
  video,
  entityType,
  onWatch,
  menuItems = [],
  playButtonColor = 'danger',
}) {
  const [imgOk, setImgOk] = useState(true)

  const link = video?.link || video?.videoLink || ''
  const thumb = useMemo(() => getThumb(link), [link])
  const preview = useMemo(() => getDrivePreviewUrl(link), [link])
  const canWatch = !!preview

  return (
    <Box sx={sx.cardMedia}>
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
          <Box className="video-overlay" sx={sx.boxOverLay} />
        </>
      ) : (
        <Box sx={sx.cardMediaFallback}>
          <ImageNotSupportedRounded />
        </Box>
      )}

      <Box sx={sx.menuBox}>
        <Dropdown>
          <MenuButton slots={{ root: IconButton }} slotProps={sx.menuButtonSlot}>
            <MoreVert sx={{ width: 16, height: 16 }} />
          </MenuButton>

          <Menu placement="bottom-end" sx={{ p: 0.5 }}>
            {menuItems.map((it, idx) => {
              if (it?.divider) return <Divider key={`div-${idx}`} />

              const handle = () => {
                it?.onClick(video)
              }

              return (
                <MenuItem key={it?.id || idx} onClick={handle} color={it?.color}>
                  {it?.icon ? (
                    <ListItemDecorator>{iconUi({ id: it.icon })}</ListItemDecorator>
                  ) : null}
                  {it?.label || ''}
                </MenuItem>
              )
            })}
          </Menu>
        </Dropdown>
      </Box>
    </Box>
  )
}
