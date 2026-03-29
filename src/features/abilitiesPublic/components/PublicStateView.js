// features/abilitiesPublic/components/PublicStateView.js

import React from 'react'
import Sheet from '@mui/joy/Sheet'
import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'

import { iconUi } from '../../../ui/core/icons/iconUi.js'

export default function PublicStateView({
  title,
  text,
  color = 'neutral',
}) {
  return (
    <Sheet
      variant="soft"
      color={color}
      sx={{ p: 2, borderRadius: 'xl' }}
    >
      <Stack spacing={1} alignItems="center" sx={{ textAlign: 'center' }}>
        <Sheet
          variant="solid"
          color={color}
          sx={{ width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center' }}
        >
          {iconUi({ id: 'info' })}
        </Sheet>

        <Typography level="title-md">{title}</Typography>
        <Typography level="body-sm">{text}</Typography>
      </Stack>
    </Sheet>
  )
}
