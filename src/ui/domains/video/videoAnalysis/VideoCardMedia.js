// ui/domains/video/videoAnalysis/VideoCardMedia.js

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
import { useLifecycle } from '../../../../ui/domains/entityLifecycle/LifecycleProvider'

const getThumb = (link) => {
  const base = getDriveThumbUrl(link)
  if (!base) return ''
  return base.includes('sz=') ? base : `${base}&sz=w640-h360`
}

export default function VideoCardMedia({
  sx,
  video,
  entityType,
  onWatch,
  menuItems = [],
  playButtonColor = 'danger',
}) {
  const [imgOk, setImgOk] = useState(true)
  const lifecycle = useLifecycle()

  const link = video?.link || video?.videoLink || ''
  const thumb = useMemo(() => getThumb(link), [link])

  const preview = useMemo(() => getDrivePreviewUrl(link), [link])
  const canWatch = !!preview

  const entityName = useMemo(() => {
    return String(video?.title || video?.name || 'וידאו').trim()
  }, [video?.title, video?.name])

  const onDeleteDefault = useCallback(() => {
    if (!video?.id) return
    if (!entityType) return
    lifecycle.openLifecycle({ entityType, id: video.id, name: entityName }, video?._meta)
  }, [lifecycle, video?.id, video?._meta, entityName, entityType])

  return (
    <Box sx={sx?.cardMedia}>
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
            sx={sx?.cardImg}
          />
          <Box className="video-overlay" sx={sx?.boxOverLay} />
        </>
      ) : (
        <Box sx={sx?.cardMediaFallback}>
          <ImageNotSupportedRounded />
        </Box>
      )}

      <Box sx={sx?.menuBox}>
        <Dropdown>
          <MenuButton size="sm" slots={{ root: IconButton }} slotProps={sx?.menuButtonSlot}>
            <MoreVert sx={{ width: 16, height: 16 }} />
          </MenuButton>

          <Menu
            size="sm"
            placement="bottom-end"
            sx={{ zIndex: 15000 }}
            slotProps={{
              listbox: { sx: { minWidth: 220 } },
              root: {
                modifiers: [
                  { name: 'offset', options: { offset: [0, 8] } },
                  { name: 'preventOverflow', options: { padding: 12 } },
                  { name: 'flip', options: { padding: 12 } },
                ],
              },
            }}
          >
            {menuItems.map((it, idx) => {
              if (it?.divider) return <Divider key={`div-${idx}`} />

              const handle = () => {
                if (it?.id === 'delete' && typeof it?.onClick !== 'function') {
                  onDeleteDefault()
                  return
                }
                if (typeof it?.onClick === 'function') it.onClick(video)
              }

              return (
                <MenuItem key={it?.id || idx} onClick={handle} color={it?.color}>
                  {it?.icon ? <ListItemDecorator>{iconUi({ id: it.icon })}</ListItemDecorator> : null}
                  {it?.label || ''}
                </MenuItem>
              )
            })}
          </Menu>
        </Dropdown>

        <Tooltip title={canWatch ? 'צפייה' : 'אין תצוגה מקדימה'}>
          <span>
            <IconButton
              size="sm"
              variant="soft"
              color={playButtonColor}
              disabled={!canWatch}
              onClick={() => typeof onWatch === 'function' && onWatch(video)}
              sx={{ minWidth: 22, minHeight: 22, '--IconButton-size': '22' }}
            >
              {iconUi({ id: 'playVideo' })}
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  )
}
