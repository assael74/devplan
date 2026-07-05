// features/playersDatabase/components/profilesPage/list/ProfileTooltip.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { getScoutProfileTooltipData } from './logic/scout.logic.js'

export default function ProfileTooltip({ profileId }) {
  const data = getScoutProfileTooltipData(profileId)

  return (
    <Box sx={{ display: 'grid', gap: 0.35, maxWidth: 300 }}>
      <Typography level="body-sm" sx={{ fontWeight: 700 }}>
        {data.title}
      </Typography>

      {data.context ? (
        <Typography level="body-xs">{data.context}</Typography>
      ) : null}

      {data.rules.length ? (
        <Typography level="body-xs">
          תנאי התאמה: {data.rules.join(' · ')}
        </Typography>
      ) : null}
    </Box>
  )
}
