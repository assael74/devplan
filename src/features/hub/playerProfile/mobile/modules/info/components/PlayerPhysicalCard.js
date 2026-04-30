// playerProfile/mobile/modules/info/components/PlayerPhysicalCard.js

import React from 'react'
import { Box, Typography, Sheet, Input } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { infoModuleSx as sx } from '../info.module.sx.js'

export default function PlayerPhysicalCard({ draft, setDraft, pending }) {
  const setField = (key) => (event) => {
    const value = event?.target?.value ?? ''
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Typography level="title-md" noWrap startDecorator={iconUi({ id: 'performance' })}>
          מדדים פיזיים
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: 0.875, minWidth: 0 }}>
        <Box sx={sx.formGrid2}>
          <Box sx={{ display: 'grid', gap: 0.375, minWidth: 0 }}>
            <Typography level="body-xs" sx={{ opacity: 0.7 }}>
              גובה (ס״מ)
            </Typography>

            <Input
              value={draft?.heightCm || ''}
              onChange={setField('heightCm')}
              disabled={pending}
              placeholder="לדוגמה: 145"
              sx={{ minWidth: 0, width: '100%' }}
            />
          </Box>

          <Box sx={{ display: 'grid', gap: 0.375, minWidth: 0 }}>
            <Typography level="body-xs" sx={{ opacity: 0.7 }}>
              משקל (ק״ג)
            </Typography>

            <Input
              value={draft?.weightKg || ''}
              onChange={setField('weightKg')}
              disabled={pending}
              placeholder="לדוגמה: 38"
              sx={{ minWidth: 0, width: '100%' }}
            />
          </Box>
        </Box>
      </Box>
    </Sheet>
  )
}
