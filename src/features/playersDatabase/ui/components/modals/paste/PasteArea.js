// src/features/playersDatabase/ui/components/modals/paste/PasteArea.js

import {
  Box,
  Card,
  Typography,
} from '@mui/joy'

import { pasteAreaSx as sx } from './sx/pasteArea.sx.js'

export default function PasteArea({
  value,
  placeholder,
  compact = false,
  onChange,
  formatHint = '',
}) {
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

      </Box>

      <Box
        component='textarea'
        value={value}
        placeholder={placeholder || 'הדביקו כאן את הנתונים באמצעות Ctrl+V'}
        onChange={handleValueChange}
        sx={[sx.input, compact ? sx.inputCompact : null]}
      />

      {!compact ? (
        <Typography level='body-xs' sx={sx.hint}>
          השורה הראשונה יכולה לשמש כשורת כותרות.
        </Typography>
      ) : null}
    </Card>
  )
}
