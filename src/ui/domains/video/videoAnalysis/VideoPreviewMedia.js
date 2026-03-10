// ui/domains/video/videoAnalysis/VideoPreviewMedia.js

import React, { useCallback, useMemo, useState } from 'react'
import {
  Box,
  Divider,
  Dropdown,
  IconButton,
  ListItemDecorator,
  Menu,
  MenuButton,
  MenuItem,
} from '@mui/joy'
import MoreVert from '@mui/icons-material/MoreVert'
import ImageNotSupportedRounded from '@mui/icons-material/ImageNotSupportedRounded'

import { getDriveThumbUrl, getDrivePreviewUrl } from '../../../../shared/media/driveLinks.js'
import { iconUi } from '../../../core/icons/iconUi.js'
import { useLifecycle } from '../../entityLifecycle/LifecycleProvider'

const safe = (v) => (v == null ? '' : String(v).trim())

const getThumb = (link) => {
  const base = getDriveThumbUrl(link)
  if (!base) return ''
  return base.includes('sz=') ? base : `${base}&sz=w640-h360`
}

export default function VideoPreviewMedia({
  video,
  sx = {},
  entityType,
  onWatch,
  menuItems = [],
  showMenu = false,
  showWatch = false,
  clickable = true,
  playButtonColor = 'danger',
  menuPlacement = 'bottom-end',
}) {
  const [imgOk, setImgOk] = useState(true)
  const lifecycle = useLifecycle()

  const link = safe(video?.link || video?.videoLink || video?.url || video?.videoUrl)
  const thumb = useMemo(() => getThumb(link), [link])
  const preview = useMemo(() => getDrivePreviewUrl(link), [link])

  const entityName = useMemo(
    () => safe(video?.title || video?.name || 'וידאו'),
    [video?.title, video?.name]
  )

  const canWatch = !!preview && typeof onWatch === 'function'
  const hasMenu = showMenu && Array.isArray(menuItems) && menuItems.length > 0
  const hasActions = hasMenu || showWatch

  const onDeleteDefault = useCallback(() => {
    if (!video?.id || !entityType) return
    lifecycle.openLifecycle(
      { entityType, id: video.id, name: entityName },
      video?._meta
    )
  }, [entityName, entityType, lifecycle, video?.id, video?._meta])

  const handleItemClick = useCallback(
    (item) => {
      if (!item) return

      if (item?.id === 'delete' && typeof item?.onClick !== 'function') {
        onDeleteDefault()
        return
      }

      if (typeof item?.onClick === 'function') {
        item.onClick(video)
      }
    },
    [onDeleteDefault, video]
  )

  const handleWatch = useCallback(() => {
    if (!canWatch) return
    onWatch(video)
  }, [canWatch, onWatch, video])

  const handleKeyDown = useCallback(
    (e) => {
      if (!clickable || !canWatch) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleWatch()
      }
    },
    [clickable, canWatch, handleWatch]
  )

  return (
    <Box sx={sx?.root}>
      <Box
        sx={{ ...sx?.cardMedia, cursor: clickable && canWatch ? 'pointer' : 'default', }}
        onClick={clickable && canWatch ? handleWatch : undefined}
        onKeyDown={handleKeyDown}
        role={clickable && canWatch ? 'button' : undefined}
        tabIndex={clickable && canWatch ? 0 : undefined}
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
              sx={sx?.cardImg}
            />
            <Box className="video-overlay" sx={sx?.boxOverLay} />
          </>
        ) : (
          <Box sx={sx?.cardMediaFallback}>
            <ImageNotSupportedRounded />
          </Box>
        )}

        {hasActions ? (
          <Box
            sx={sx?.actionsBox}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {hasMenu ? (
              <Dropdown>
                <MenuButton
                  size="sm"
                  slots={{ root: IconButton }}
                  slotProps={sx?.menuButtonSlot}
                >
                  <MoreVert sx={{ width: 16, height: 16 }} />
                </MenuButton>

                <Menu
                  size="sm"
                  placement={menuPlacement}
                  sx={sx?.menuSx}
                  slotProps={{
                    listbox: { sx: sx?.menuListSx },
                    root: {
                      modifiers: [
                        { name: 'offset', options: { offset: [0, 8] } },
                        { name: 'preventOverflow', options: { padding: 12 } },
                        { name: 'flip', options: { padding: 12 } },
                      ],
                    },
                  }}
                >
                  {menuItems.map((item, idx) => {
                    if (item?.divider) return <Divider key={`div-${idx}`} />

                    return (
                      <MenuItem
                        key={item?.id || idx}
                        onClick={() => handleItemClick(item)}
                        color={item?.color}
                      >
                        {item?.icon ? (
                          <ListItemDecorator>
                            {iconUi({ id: item.icon })}
                          </ListItemDecorator>
                        ) : null}
                        {item?.label || ''}
                      </MenuItem>
                    )
                  })}
                </Menu>
              </Dropdown>
            ) : null}

            {showWatch ? (
              <IconButton
                size="sm"
                variant="soft"
                color={playButtonColor}
                disabled={!canWatch}
                onClick={() => canWatch && onWatch(video)}
                sx={sx?.watchButtonSx}
              >
                {iconUi({ id: 'playVideo' })}
              </IconButton>
            ) : null}
          </Box>
        ) : null}
      </Box>
    </Box>
  )
}
