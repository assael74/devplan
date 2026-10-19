// src/features/playersDatabase/ui/pages/teamPage/notes/preview/TeamNotebookPreview.js

import * as React from 'react'
import { Box, Button, Typography } from '@mui/joy'
import TeamNotebookDrawer from '../TeamNotebookDrawer.js'
import { notebookPreviewData } from './teamNotebookPreview.data.js'

// Optional, isolated preview. Not imported by TeamPage, any panel, or application routing.
// Render under the application's existing theme providers and DrawerShell dependencies.
export default function TeamNotebookPreview() {
  const [open, setOpen] = React.useState(false)
  return (
    <Box sx={{ p: 3, display: 'grid', gap: 2, maxWidth: 680 }}>
      <Typography level='h3'>מחברת חקירה — תצוגת ממשק</Typography>
      <Typography level='body-sm'>
        אפשר לדפדף בין שבעה שלבים ולראות סיכום. אין עדיין שמירה.
      </Typography>
      <Button onClick={() => setOpen(true)}>פתיחת המחברת</Button>
      <TeamNotebookDrawer
        {...notebookPreviewData}
        open={open}
        onClose={() => setOpen(false)}
      />
    </Box>
  )
}
