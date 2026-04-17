// src/features/hub/sharedProfile/mobile/HeaderStripMobile.js

import React from 'react'
import { Sheet, Box, Typography, Avatar, IconButton, Link } from '@mui/joy'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'

import { sharedSx as sx } from './shared.sx'

function PathInline({ pathItems = [] }) {
  const list = Array.isArray(pathItems) ? pathItems.filter(Boolean) : []

  if (!list.length) return null

  return (
    <Box sx={sx.pathRoot}>
      {list.map((item, index) => {
        const isLast = index === list.length - 1
        const key = `${item?.label || 'path'}-${index}`

        return (
          <React.Fragment key={key}>
            {typeof item?.onClick === 'function' ? (
              <Link component="button" type="button" underline="none" onClick={item.onClick} sx={sx.link(isLast)}>
                {item?.label || ''}
              </Link>
            ) : (
              <Typography level="body-xs" sx={sx.typoLink(isLast)}>
                {item?.label || ''}
              </Typography>
            )}

            {!isLast ? (
              <Typography level="body-xs" sx={{ color: 'text.tertiary', whiteSpace: 'nowrap' }}>
                /
              </Typography>
            ) : null}
          </React.Fragment>
        )
      })}
    </Box>
  )
}

export default function HeaderStripMobile({
  title,
  subtitle,
  avatarSrc,
  avatarAlt,
  right,
  sticky = true,
  onAvatarClick,
  onBack,
  pathItems,
}) {
  const isClickable = typeof onAvatarClick === 'function'

  return (
    <Sheet variant="soft" sx={sx.headerSheet(sticky)}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
       {/* שורה ראשונה */}
        <Box sx={sx.topRow}>
          <Box sx={sx.iconBox}>
            <IconButton
              size="sm"
              variant="soft"
              color="neutral"
              onClick={onBack}
              aria-label="חזרה"
              sx={{ flexShrink: 0 }}
            >
              <ArrowBackRoundedIcon />
            </IconButton>

            <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
              <PathInline pathItems={pathItems} />
            </Box>
          </Box>
        </Box>

         {/* שורה שניה */}
        <Box sx={sx.secondRow}>
          <Box sx={{ minWidth: 0, mt: 0.5 }}>
            <Typography level="title-lg" noWrap>
              {title || ''}
            </Typography>

            <Typography level="body-sm" sx={{ opacity: subtitle ? 0.75 : 0 }} noWrap>
              {subtitle || '—'}
            </Typography>
          </Box>

          <Box sx={sx.avatarWraper}>
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
          </Box>
        </Box>
      </Box>
    </Sheet>
  )
}
