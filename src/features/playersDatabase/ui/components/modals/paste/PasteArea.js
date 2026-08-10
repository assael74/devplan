// src/features/playersDatabase/ui/components/modals/paste/PasteArea.js

import * as React from 'react'
import {
  Box,
  Button,
  Card,
  Input,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { pasteAreaSx as sx } from './sx/pasteArea.sx.js'

export default function PasteArea({
  value,
  placeholder,
  compact = false,
  onChange,
  onPaste,
  onFileSelect,
  onClear,
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

  const handleValueChange = event => {
    if (typeof onChange === 'function') {
      onChange(event.target.value)
    }
  }

  return (
    <Card sx={sx.panel}>
      <Box sx={sx.header}>
        <Box>
          <Typography level='title-md' sx={sx.title}>
            הדבקת נתונים
          </Typography>

          <Typography level='body-xs' sx={sx.description}>
            הדביקו נתונים שהועתקו מאקסל או ממקור טבלאי אחר.
          </Typography>
        </Box>

        <Button
          size='sm'
          variant='outlined'
          startDecorator={iconUi({id: 'upload', size: 'sm'})}
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
        value={value}
        placeholder={placeholder || 'הדביקו כאן את הנתונים באמצעות Ctrl+V'}
        onChange={handleValueChange}
        sx={[sx.input, compact ? sx.inputCompact : null]}
      />

      <Box sx={sx.footer}>
        <Typography level='body-xs' sx={sx.hint}>
          השורה הראשונה יכולה לשמש כשורת כותרות.
        </Typography>

        <Box sx={sx.actions}>
          <Button
            size='sm'
            variant='outlined'
            color='danger'
            disabled={!value}
            startDecorator={iconUi({id: 'delete', size: 'sm'})}
            onClick={onClear}
          >
            ניקוי מלא
          </Button>

          <Button
            size='sm'
            variant='solid'
            disabled={!value}
            startDecorator={iconUi({id: 'addStats', size: 'sm'})}
            onClick={onPaste}
            sx={sx.pasteButton}
          >
            הצג נתונים
          </Button>
        </Box>
      </Box>
    </Card>
  )
}
