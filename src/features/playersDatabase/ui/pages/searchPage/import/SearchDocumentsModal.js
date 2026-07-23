// features/playersDatabase/ui/pages/searchPage/import/SearchDocumentsModal.js

import * as React from 'react'
import {
  Box,
  Button,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Textarea,
  Typography,
} from '@mui/joy'

import { SEARCH_IMPORT_TYPES } from '../logic/search.constants.js'
import { searchPageSx as sx } from '../sx/searchPage.sx.js'

export default function SearchDocumentsModal({ open, onClose }) {
  const [type, setType] = React.useState('stats')
  const [pasteValue, setPasteValue] = React.useState('')

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={sx.importModal}>
        <ModalClose />

        <Box>
          <Typography level='h3' sx={sx.importTitle}>טעינת מסמכים</Typography>
          <Typography level='body-sm' sx={sx.importDescription}>
            בחר את סוג הנתונים, הדבק את תוכן הקובץ ובחן אותו לפני שמירה.
          </Typography>
        </Box>

        <Box sx={sx.importTypeGrid}>
          {SEARCH_IMPORT_TYPES.map(option => (
            <Box
              key={option.value}
              role='button'
              tabIndex={0}
              sx={[sx.importTypeCard, type === option.value && sx.importTypeCardSelected]}
              onClick={() => setType(option.value)}
            >
              <Typography level='title-sm'>{option.label}</Typography>
              <Typography level='body-xs'>{option.description}</Typography>
            </Box>
          ))}
        </Box>

        <Textarea
          minRows={7}
          value={pasteValue}
          placeholder='הדבק כאן נתונים מאקסל...'
          onChange={event => setPasteValue(event.target.value)}
        />

        <Box sx={sx.importPreview}>
          <Typography level='title-sm'>תצוגה מקדימה</Typography>
          <Typography level='body-xs'>לאחר חיבור מנגנון הייבוא, הנתונים המזוהים יוצגו כאן לעריכה לפני שמירה.</Typography>
        </Box>

        <Stack direction='row' spacing={1} sx={sx.importActions}>
          <Button sx={sx.primaryButton} disabled={!pasteValue.trim()}>ניתוח נתונים</Button>
          <Button variant='outlined' sx={sx.secondaryButton} onClick={onClose}>ביטול</Button>
        </Stack>
      </ModalDialog>
    </Modal>
  )
}
