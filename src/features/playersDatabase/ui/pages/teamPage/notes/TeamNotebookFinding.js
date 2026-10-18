// src/features/playersDatabase/ui/pages/teamPage/notes/TeamNotebookFinding.js

import React from 'react'
import {
  Accordion, AccordionDetails, AccordionGroup, AccordionSummary,
  Box, Button, Chip, FormControl, FormHelperText, FormLabel,
  Option, Select, Textarea, Typography,
} from '@mui/joy'
import TeamNotebookLinks from './TeamNotebookLinks.js'
import { formatNoteDate, NOTE_STATUSES } from './model/teamNotebook.ui.js'
import { teamNotebookSx as sx } from './sx/teamNotebook.sx.js'

export default function TeamNotebookFinding({ notebook, seasonOptions, playerOptions }) {
  const finding = notebook.selectedFinding
  const updatedDate = formatNoteDate(finding.updatedAt || finding.createdAt)
  const linkCount = finding.insightIds.length + finding.relatedSeasonIds.length + finding.relatedPlayerIds.length

  return (
    <Box sx={sx.pane}>
      <Box sx={sx.browseBar}>
        <Button variant='plain' size='sm' color='neutral' onClick={notebook.backToList}>כל הממצאים</Button>
        <Box sx={sx.browseControls}>
          <Button
            size='sm' variant='outlined' color='neutral'
            disabled={notebook.navigationIndex <= 0}
            onClick={() => notebook.moveFinding(-1)}
            aria-label='הממצא הקודם'
          >הקודם</Button>
          <Typography level='body-xs' aria-live='polite' sx={{ whiteSpace: 'nowrap' }}>
            {`${notebook.navigationIndex + 1} מתוך ${notebook.navigationCount}`}
          </Typography>
          <Button
            size='sm' variant='outlined' color='neutral'
            disabled={notebook.navigationIndex >= notebook.navigationCount - 1}
            onClick={() => notebook.moveFinding(1)}
            aria-label='הממצא הבא'
          >הבא</Button>
        </Box>
      </Box>
      <Box key={finding.id} sx={sx.editorScroll}>
        <Box sx={sx.rowBetween}>
          <Typography level='title-md'>{finding.isNew ? 'ממצא חדש' : 'תיעוד הממצא'}</Typography>
          {notebook.dirtyIds.has(finding.id) && <Chip size='sm' variant='soft' color='warning'>טיוטה מקומית</Chip>}
        </Box>
        <FormControl required sx={sx.formControl}>
          <FormLabel>מה זיהיתי?</FormLabel>
          <Textarea
            value={finding.text}
            minRows={5}
            maxRows={12}
            onChange={event => notebook.changeFinding({ text: event.target.value })}
            placeholder='כתוב את ההתרשמות, החשד או המסקנה שלך, ומה כדאי לבדוק בהמשך…'
            slotProps={{ textarea: { dir: 'rtl' } }}
            sx={sx.textarea}
          />
          <FormHelperText>הטקסט שלך הוא העיקר. הקישורים מוסיפים הקשר, ואינם מחליפים אותו.</FormHelperText>
        </FormControl>
        <FormControl size='sm' sx={sx.formControl}>
          <FormLabel>מצב הבדיקה</FormLabel>
          <Select
            size='sm'
            value={finding.status}
            onChange={(_event, status) => notebook.changeFinding({ status: status || 'open' })}
            slotProps={{ listbox: { dir: 'rtl' } }}
          >
            {NOTE_STATUSES.map(status => <Option value={status.id} key={status.id}>{status.label}</Option>)}
          </Select>
        </FormControl>
        <AccordionGroup sx={sx.linksAccordion}>
          <Accordion defaultExpanded>
            <AccordionSummary>
              <Typography level='title-sm'>קישורים לממצא</Typography>
              <Chip size='sm' variant='soft'>{linkCount}</Chip>
            </AccordionSummary>
            <AccordionDetails>
              <TeamNotebookLinks
                finding={finding}
                seasonOptions={seasonOptions}
                playerOptions={playerOptions}
                onChange={notebook.changeFinding}
              />
            </AccordionDetails>
          </Accordion>
        </AccordionGroup>
        <Box sx={sx.pdfPlaceholder}>
          <Box>
            <Typography level='title-sm'>תיעוד מצב היסטורי</Typography>
            <Typography level='body-xs'>צירוף PDF אינו פעיל בשלב זה.</Typography>
          </Box>
          <Button size='sm' variant='outlined' color='neutral' disabled title='צירוף קבצים טרם חובר'>צירוף PDF</Button>
        </Box>
        {updatedDate && <Typography level='body-xs'>תאריך הממצא שסופק: {updatedDate}</Typography>}
        <Box sx={sx.rowBetween}>
          <Typography level='body-xs'>הדפדוף נשאר במחברת ואינו מחליף מסלול בעמוד.</Typography>
          <Button size='sm' variant='plain' color='danger' disabled>מחיקה</Button>
        </Box>
      </Box>
    </Box>
  )
}
