// src/features/playersDatabase/ui/pages/teamPage/notes/preview/TeamNotebookPreview.js

import * as React from 'react'
import { Box, Button, Typography } from '@mui/joy'
import TeamNotebookDrawer from '../TeamNotebookDrawer.js'
import { notebookPreviewData } from './teamNotebookPreview.data.js'

// Optional, isolated preview. Not imported by TeamPage, any panel, or application routing.
// Render under the application's existing theme providers and DrawerShell dependencies.
export default function TeamNotebookPreview() {
  const [mode, setMode] = React.useState('')
  return (
    <Box dir='rtl' sx={{ p: 3, display: 'grid', gap: 2, maxWidth: 680 }}>
      <Typography level='h3'>מחברת השנתון — תצוגת ממשק</Typography>
      <Typography level='body-sm'>
        נתוני הדגמה פיקטיביים. אפשר לבחון דפדוף, סינון ועריכת טיוטות. אין חיבור לפאנל, למסד נתונים או להעלאת קבצים.
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={() => setMode('example')}>פתיחת המחברת לדוגמה</Button>
        <Button variant='outlined' onClick={() => setMode('empty')}>בדיקת מחברת ריקה</Button>
      </Box>
      <TeamNotebookDrawer
        {...notebookPreviewData}
        notes={mode === 'empty' ? { generalText: '', findingsById: {} } : notebookPreviewData.notes}
        open={Boolean(mode)}
        onClose={() => setMode('')}
      />
    </Box>
  )
}
