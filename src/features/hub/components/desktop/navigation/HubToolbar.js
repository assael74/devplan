// features/hub/components/desktop/navigation/HubToolbar.js

import React from 'react'
import { Sheet, Typography, Box } from '@mui/joy'

import { navSx as sx } from './nav.sx.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

export default function HubToolbar({ title, subtitle }) {
  return (
    <Sheet
      variant="outlined"
      sx={{
        ...sx.sheet,
        bgcolor: devPlanColors.primaryLight,
        borderColor: devPlanColors.border,
        color: devPlanColors.primary,
      }}
    >
      <Box>
        <Typography
          level="h3"
          startDecorator={iconUi({
            id: 'dashboard',
            sx: { color: devPlanColors.tertiary },
          })}
          sx={{ color: devPlanColors.primary }}
        >
          {title || 'מרכז שליטה'}
        </Typography>

        {subtitle ? (
          <Typography level="body-sm" sx={{ mt: 0.25, color: devPlanColors.subText }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
    </Sheet>
  )
}
