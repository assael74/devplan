// src/features/playersDatabase/ui/pages/teamPage/notes/TeamNotebookGeneralNote.js

import React from 'react'
import { Box, FormControl, FormHelperText, FormLabel, Textarea, Typography } from '@mui/joy'
import { teamNotebookSx as sx } from './sx/teamNotebook.sx.js'

export default function TeamNotebookGeneralNote({ value, onChange }) {
  return (
    <Box sx={sx.editorScroll}>
      <Box>
        <Typography level='title-md'>הערת רקע לשנתון</Typography>
        <Typography level='body-sm' sx={{ mt: 0.5 }}>
          תמונה כללית שחשוב לזכור לאורך השנים. ממצאים נקודתיים מתועדים בנפרד, בלשונית הממצאים.
        </Typography>
      </Box>
      <FormControl sx={sx.formControl}>
        <FormLabel>הערה כללית</FormLabel>
        <Textarea
          value={value}
          onChange={event => onChange(event.target.value)}
          minRows={10}
          maxRows={20}
          placeholder='מה חשוב לזכור על השנתון לאורך העונות?'
          slotProps={{ textarea: { dir: 'rtl' } }}
          sx={sx.textarea}
        />
        <FormHelperText>הטקסט זמני בלבד. סגירת המחברת אינה שומרת אותו.</FormHelperText>
      </FormControl>
    </Box>
  )
}
