// players/components/desktop/preview/PreviewDomainCard/PreviewDomainCardHeader.js

import React from 'react'
import { Avatar, Box, Chip, Typography } from '@mui/joy'
import gamesImg from '../../../../../../ui/core/images/games.png'

export default function PreviewDomainCardHeader({
  label,
  playerPhoto,
  fullName,
  birthYearText,
  variant = 'modal',
  domainImg
}) {
  const isDrawer = variant === 'drawer'
  const src = domainImg || gamesImg

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Avatar
        src={src}
        sx={{
          width: isDrawer ? 56 : 34,
          height: isDrawer ? 56 : 34,
          boxShadow: isDrawer ? 'sm' : 'none',
        }}
      />

      <Box sx={{ minWidth: 0, flex: 1 }}>
        {/* שם שחקן – פריימרי */}
        <Typography level={isDrawer ? 'title-lg' : 'title-md'} noWrap sx={{ lineHeight: 1.15 }}>
          {fullName}
          {birthYearText}
        </Typography>

        {/* דומיין – משני אבל ברור */}
        <Box sx={{ mt: 0.35, display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip size={isDrawer ? 'md' : 'sm'} variant="soft" color="primary">
            {label}
          </Chip>
        </Box>
      </Box>
    </Box>
  )
}
