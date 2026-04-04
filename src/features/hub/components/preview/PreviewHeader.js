// features/hub/components/preview/PreviewHeader.js

import React, { useCallback } from 'react'
import { Box, Typography, Avatar } from '@mui/joy'
import PhotoCameraRounded from '@mui/icons-material/PhotoCameraRounded'
import { sx } from './PreviewHeader.sx.js'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'

export default function PreviewHeader({
  photo,
  title,
  subtitle,
  idIcon = '',
  onOpenImage,
}) {
  const canOpen = typeof onOpenImage === 'function'

  const handleOpen = useCallback(
    (e) => {
      if (!canOpen) return
      e?.stopPropagation()
      onOpenImage()
    },
    [canOpen, onOpenImage]
  )

  const onKeyDown = useCallback(
    (e) => {
      if (!canOpen) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleOpen(e)
      }
    },
    [canOpen, handleOpen]
  )

  return (
    <Box sx={sx.root}>
      <Box
        sx={sx.avatarBtn}
        role={canOpen ? 'button' : undefined}
        tabIndex={canOpen ? 0 : undefined}
        aria-label={canOpen ? 'עריכת תמונה' : undefined}
        onClick={handleOpen}
        onKeyDown={onKeyDown}
      >
        <Avatar size="lg" src={photo}>
          {(title || '?').slice(0, 1)}
        </Avatar>

        {canOpen ? (
          <Box className="_imgOverlay" sx={sx.overlay}>
            <PhotoCameraRounded />
          </Box>
        ) : null}
      </Box>

      <Box sx={sx.textCol}>
        <Typography level="h3" noWrap sx={{ fontWeight: 700 }}>
          {title || '—'}
        </Typography>
        <Typography level="body-sm" noWrap sx={{ opacity: 0.8, fontWeight: 500 }} startDecorator={iconUi({id: idIcon})}>
          {subtitle || ''}
        </Typography>
      </Box>
    </Box>
  )
}
