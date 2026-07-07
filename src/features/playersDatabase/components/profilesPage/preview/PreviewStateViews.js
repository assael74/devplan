// features/playersDatabase/components/profilesPage/preview/PreviewStateViews.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { stateSx as sx } from './sx/state.sx.js'

export function InitialState() {
  return (
    <Box sx={sx.initialState}>
      <Typography sx={sx.initialText}>
        {'לא נבחר סוג חיפוש.\nצריך לבחור לפחות שני סלקטים כדי להתחיל.'}
      </Typography>
    </Box>
  )
}

export function PrimaryState({ title, subtitle }) {
  return (
    <Box sx={sx.primaryState}>
      {title ? <Typography sx={sx.primaryTitle}>{title}</Typography> : null}
      {subtitle ? <Typography sx={sx.primarySubtitle}>{subtitle}</Typography> : null}
    </Box>
  )
}
