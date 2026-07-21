// features/playersDatabase/ui/pages/entryPage/EntryHeader.js

import { Box, Stack, Typography } from '@mui/joy'

import Breadcrumbs from '../../layout/Breadcrumbs.js'
import { DataPreviewGraphic } from './EntryVisuals.js'
import { entryPageSx as sx } from './sx/entryPage.sx.js'

export default function EntryHeader({ breadcrumbs }) {
  return (
    <Box sx={sx.header}>
      <Box sx={sx.headerVisual}>
        <DataPreviewGraphic />
      </Box>

      <Stack spacing={1.25} sx={sx.headerContent}>
        <Breadcrumbs items={breadcrumbs} />

        <Typography level='h1' sx={sx.pageTitle}>
          מאגר שחקנים חיצוני
        </Typography>

        <Typography level='body-lg' sx={sx.pageDescription}>
          כל המידע במקום אחד: ליגות, קבוצות, סגלים,
          סטטיסטיקות ואיתור מועמדים שמתאימים לפרופיל
          הסקאוט שלכם.
        </Typography>
      </Stack>
    </Box>
  )
}
