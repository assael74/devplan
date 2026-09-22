// src/features/playersDatabase/ui/components/modals/paste/PasteArea.js

import {
  Box,
  Button,
  Card,
  IconButton,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { pasteAreaSx as sx } from './sx/pasteArea.sx.js'

export default function PasteArea({
  value,
  placeholder,
  compact = false,
  onChange,
  formatHint = '',
  headerActions = null,
  templateText = '',
  templateLabel = 'העתק תבנית',
  showClearAction = true,
  inputVariant = 'default',
  inputSx = null,
}) {
  const handleValueChange = event => {
    if (typeof onChange === 'function') {
      onChange(event.target.value)
    }
  }

  const handleCopyTemplate = async () => {
    if (!templateText) return
    await navigator.clipboard?.writeText(templateText)
  }

  return (
    <Card sx={sx.panel}>
      <Box sx={sx.header}>
        <Box>
          <Typography level='title-md' sx={sx.title}>
            הדבקת נתונים
          </Typography>

          {!compact ? (
            <Typography level='body-xs' sx={sx.description}>
              הדביקו נתונים שהועתקו מאקסל או ממקור טבלאי אחר.
            </Typography>
          ) : null}
          {formatHint ? (
            <Typography level='body-xs' sx={sx.description}>
              {formatHint}
            </Typography>
          ) : null}
        </Box>

        {headerActions ? (
          <Box sx={sx.headerActions}>
            {headerActions}
          </Box>
        ) : null}

        {templateText || showClearAction ? (
          <Box sx={sx.headerActions}>
            {templateText ? (
              <Button
                size='sm'
                variant='plain'
                onClick={handleCopyTemplate}
                sx={sx.templateButton}
              >
                {templateLabel}
              </Button>
            ) : null}
            {showClearAction ? (
              <IconButton
                size='sm'
                variant='soft'
                color='neutral'
                aria-label='ניקוי ההדבקה'
                title='ניקוי ההדבקה'
                disabled={!value}
                onClick={() => onChange?.('')}
                sx={sx.clearButton}
              >
                {iconUi({ id: 'clear', size: 'sm' })}
              </IconButton>
            ) : null}
          </Box>
        ) : null}
      </Box>

      <Box
        component='textarea'
        className='dpScrollThin'
        value={value}
        placeholder={placeholder || 'הדביקו כאן את הנתונים באמצעות Ctrl+V'}
        onChange={handleValueChange}
        sx={[
          sx.input,
          sx.inputVariant[inputVariant] || null,
          compact ? sx.inputCompact : null,
          inputSx,
        ]}
      />

      {!compact ? (
        <Typography level='body-xs' sx={sx.hint}>
          השורה הראשונה יכולה לשמש כשורת כותרות.
        </Typography>
      ) : null}
    </Card>
  )
}
