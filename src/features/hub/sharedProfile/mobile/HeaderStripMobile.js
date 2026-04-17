// src/features/hub/sharedProfile/mobile/HeaderStripMobile.js

import React from 'react'
import { Sheet, Box, Typography, Avatar } from '@mui/joy'

import { sharedSx as sx } from './shared.sx'

export default function HeaderStripMobile({
  title,
  subtitle,
  avatarSrc,
  avatarAlt,
  left,
  right,
  sticky = true,
  onAvatarClick,
}) {
  const isClickable = typeof onAvatarClick === 'function'

  return (
    <Sheet variant="soft" sx={sx.headerSheet(sticky)}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          {left}
        </Box>

        <Box sx={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onClick={isClickable ? onAvatarClick : undefined}
            sx={sx.clickBox(isClickable)}
            onKeyDown={
              isClickable
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onAvatarClick()
                    }
                  }
                : undefined
            }
          >
            <Avatar src={avatarSrc || ''} alt={avatarAlt || ''} sx={{ width: 45, height: 45 }} />

            <Box className="_hdrAvatarOverlay" sx={sx.avatarBox} />
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography level="title-lg" noWrap>
              {title || ''}
            </Typography>

            <Typography level="body-sm" sx={{ opacity: subtitle ? 0.75 : 0 }} noWrap>
              {subtitle || '—'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          {right}
        </Box>
      </Box>
    </Sheet>
  )
}
