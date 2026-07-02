// src/features/playersDatabase/components/scan/ScanCenterHeader.js

import React from 'react'
import { Box, Button, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { scanPageSx as sx } from './sx/page.sx.js'

export default function ScanCenterHeader({ kpis = [], onBack }) {
  return (
    <Box sx={sx.header}>
      <Box>
        <Typography level="h3" sx={sx.title}>תצוגת פרופילי סקאוט</Typography>
        <Typography level="body-sm" sx={sx.meta}>בחירת פרופילים לפי שנתון, לפי ליגה, או הצגת כל החיתוכים הזמינים.</Typography>
      </Box>

      <Box sx={sx.headerActions}>
        <Box sx={sx.kpis}>
          {kpis.map(item => <Chip key={item.id} size="sm" variant="soft" color="neutral">{item.value} {item.label}</Chip>)}
        </Box>

        <Button size="sm" variant="soft" color="neutral" startDecorator={iconUi({ id: 'back', size: 'small' })} onClick={onBack}>חזרה למאגר</Button>
      </Box>
    </Box>
  )
}
