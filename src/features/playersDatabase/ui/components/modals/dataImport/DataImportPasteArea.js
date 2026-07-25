// features/playersDatabase/ui/components/modals/dataImport/DataImportPasteArea.js

import * as React from 'react'
import {
  Box,
  Button,
  Card,
  Input,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { dataImportSx as sx } from '../sx/dataImport.sx.js'

export default function DataImportPasteArea({
  pasteValue,
  pastePlaceholder,
  onPasteChange,
  onPaste,
  onFileSelect,
}) {
  const fileInputRef = React.useRef(null)

  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = event => {
    const file = event.target.files?.[0] || null

    if (typeof onFileSelect === 'function') {
      onFileSelect(file)
    }

    event.target.value = ''
  }

  const handlePasteValueChange = event => {
    if (typeof onPasteChange === 'function') {
      onPasteChange(event.target.value)
    }
  }

  return (
    <Card sx={sx.pastePanel}>
      <Box sx={sx.sectionHeader}>
        <Box>
          <Typography
            level='title-md'
            sx={sx.sectionTitle}
          >
            הדבקת נתונים
          </Typography>

          <Typography
            level='body-xs'
            sx={sx.sectionDescription}
          >
            הדביקו נתונים שהועתקו מאקסל או ממקור טבלאי אחר.
          </Typography>
        </Box>

        <Button
          size='sm'
          variant='outlined'
          startDecorator={iconUi({ id: 'upload', size: 'sm' })}
          onClick={handleFileButtonClick}
          sx={sx.fileButton}
        >
          קובץ אקסל
        </Button>

        <Input
          slotProps={{
            input: {
              ref: fileInputRef,
              type: 'file',
              accept: '.xlsx,.xls,.csv',
              onChange: handleFileChange,
            },
          }}
          sx={sx.hiddenFileInput}
        />
      </Box>

      <Box
        component='textarea'
        value={pasteValue}
        placeholder={pastePlaceholder || 'הדביקו כאן את הנתונים באמצעות Ctrl+V'}
        onChange={handlePasteValueChange}
        sx={sx.pasteInput}
      />

      <Box sx={sx.pasteFooter}>
        <Typography
          level='body-xs'
          sx={sx.pasteHint}
        >
          השורה הראשונה יכולה לשמש כשורת כותרות.
        </Typography>

        <Button
          size='sm'
          variant='solid'
          disabled={!pasteValue}
          startDecorator={iconUi({
            id: 'addStats',
            size: 'sm',
          })}
          onClick={onPaste}
          sx={sx.pasteButton}
        >
          הצג נתונים
        </Button>
      </Box>
    </Card>
  )
}
