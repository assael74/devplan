// features/hub/sharedProfile/desktop/HeaderStrip.js

import React from 'react'
import { Sheet, Box, Typography, Avatar } from '@mui/joy'

export default function HeaderStrip({
  title,
  subtitle,
  avatarSrc,
  avatarAlt,
  left,
  right,
  sticky = true,
  sx,
  onAvatarClick,
}) {
  const isClickable = typeof onAvatarClick === 'function'

  return (
    <Sheet
      variant="soft"
      sx={{
        px: 1.25,
        py: 0.5,
        borderRadius: 12,
        ...(sticky ? { position: 'sticky', top: 0, zIndex: 10 } : null),
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {left ? (
          left
        ) : (
          <Box
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onClick={isClickable ? onAvatarClick : undefined}
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
            sx={{
              position: 'relative',
              borderRadius: 999,
              cursor: isClickable ? 'pointer' : 'default',
              lineHeight: 0,
              '&:focus-visible': isClickable
                ? { outline: '2px solid', outlineColor: 'primary.400', outlineOffset: 2 }
                : undefined,
              '&:hover ._hdrAvatarOverlay': isClickable ? { opacity: 1 } : undefined,
            }}
          >
            <Avatar src={avatarSrc || ''} alt={avatarAlt || ''} sx={{ width: 60, height: 60 }} />

            {isClickable ? (
              <Box
                className="_hdrAvatarOverlay"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 999,
                  bgcolor: 'rgba(0,0,0,0.35)',
                  opacity: 0,
                  transition: 'opacity 140ms ease',
                  pointerEvents: 'none',
                }}
              />
            ) : null}
          </Box>
        )}

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography level="title-lg" noWrap>
            {title || ''}
          </Typography>

          {subtitle ? (
            <Typography level="body-sm" sx={{ opacity: 0.75 }} noWrap>
              {subtitle}
            </Typography>
          ) : null}
        </Box>

        {right ? (
          <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
            {right}
          </Box>
        ) : null}
      </Box>
    </Sheet>
  )
}
