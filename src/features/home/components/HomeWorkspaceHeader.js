// features/home/components/HomeWorkspaceHeader.js

import React from 'react'
import { Avatar, Box, Card, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../ui/core/icons/iconUi.js'
import roleImage from '../../../ui/core/images/roleImage.png'

export default function HomeWorkspaceHeader({ coreLoading = false }) {
  return (
    <Card variant="soft" sx={{ p: 1.5, gap: 0.75, flex: '0 0 auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
        <Avatar src={roleImage} />
        <Typography level="h3">שולחן עבודה אישי</Typography>

        <Box sx={{ marginInlineStart: 'auto', flexShrink: 0 }}>
          {coreLoading ? (
            <Chip
              size="sm"
              variant="outlined"
              color="warning"
              sx={{ '--Chip-minHeight': '25px' }}
            >
              טוען נתוני מערכת ברקע
            </Chip>
          ) : (
            <Chip
              size="sm"
              variant="outlined"
              color="success"
              startDecorator={iconUi({ id: 'data' })}
              sx={{ '--Chip-minHeight': '25px' }}
            >
              נתוני מערכת מוכנים
            </Chip>
          )}
        </Box>
      </Box>
    </Card>
  )
}
