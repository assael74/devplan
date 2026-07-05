// features/playersDatabase/components/profilesPage/preview/toolbar/PreviewToolbar.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import { previewToolbarSx as sx } from './toolbar.sx.js'

export default function PreviewToolbar({
  profile,
  searchMode = 'all',
  leagueLevelsCount = 0,
  yearsCount = 0,
  disabled = false,
}) {
  const isInitialState = searchMode === 'all'
  const previewLabel = 'תצוגה מקדימה'
  const stageTitle =
    searchMode === 'league'
      ? `קיימות ${leagueLevelsCount} רמות ליגה`
      : searchMode === 'year'
        ? `יש ${yearsCount} שנתונים במערכת`
        : ''
  const subtitle =
    searchMode === 'league'
      ? 'בחר רמת ליגה'
      : searchMode === 'year'
        ? 'בחר שנתון'
        : 'לא נבחר סוג חיפוש'

  return (
    <Sheet sx={sx.root} aria-disabled={disabled || undefined}>
      <Box sx={sx.textBlock}>
        <Box sx={sx.headerRow}>
          <Chip size="sm" variant="soft" color="neutral" sx={sx.badge}>
            {previewLabel}
          </Chip>
        </Box>

        {!isInitialState ? (
          <Typography level="body-md" sx={sx.stageTitle}>
            {stageTitle}
          </Typography>
        ) : null}

        <Typography level="body-sm" sx={isInitialState ? sx.subtitleInitial : sx.subtitle}>
          {subtitle}
        </Typography>
      </Box>
    </Sheet>
  )
}
