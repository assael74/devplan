// src/features/bulkImport/components/BulkPasteDrawer.js

import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  LinearProgress,
  ModalClose,
  Sheet,
  Typography,
} from '@mui/joy'

import BulkPasteInput from './BulkPasteInput.js'
import BulkImportPreview from './BulkImportPreview.js'
import {
  buildGamesImportPreview,
  getValidGamesImportPayload,
} from '../index.js'
import { bulkSx as sx } from './sx/bulk.sx.js'

const SAMPLE_TEXT = `תאריך	מחזור	יריבה	בית/חוץ	סוג משחק	משך משחק	שעה
12/09/2026	1	מכבי נתניה	בית	ליגה	80
19/09/2026	2	הפועל רעננה	חוץ	ליגה	80	17:30
26/09/2026	3	בית"ר טוברוק	בית	ליגה	80`

export default function BulkPasteDrawer({
  open,
  onClose,
  title = 'ייבוא משחקים',
  onPreviewReady,
  saving = false,
  error = '',
}) {
  const [text, setText] = useState('')
  const [savingSeconds, setSavingSeconds] = useState(0)

  useEffect(() => {
    if (!saving) {
      setSavingSeconds(0)
      return undefined
    }

    const intervalId = setInterval(() => {
      setSavingSeconds(value => value + 1)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [saving])

  const preview = useMemo(() => {
    return buildGamesImportPreview(text)
  }, [text])

  const validPayload = useMemo(() => {
    return getValidGamesImportPayload(preview)
  }, [preview])

  function handleUseSample() {
    if (saving) return
    setText(SAMPLE_TEXT)
  }

  function handleClear() {
    if (saving) return
    setText('')
  }

  function handleConfirmPreview() {
    if (!preview?.ok || saving) return

    onPreviewReady({
      preview,
      payload: validPayload,
    })
  }

  function handleClose() {
    if (saving) return
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      anchor="right"
      size="lg"
      slotProps={{
        content: {
          sx: sx.drawerContent,
        },
      }}
    >
      <Sheet sx={sx.drawerSheet}>
        <Box sx={sx.drawerHeader}>
          <Box sx={sx.drawerTitleWrap}>
            <Typography level="title-lg">
              {title}
            </Typography>

            <Typography level="body-sm" sx={sx.mutedText}>
              הדבק טבלה מאקסל, בדוק Preview, ורק לאחר מכן יהיה ניתן לשמור.
            </Typography>
          </Box>

          {!saving ? <ModalClose /> : null}
        </Box>

        <Box sx={sx.statusStack}>
          {saving ? (
            <Sheet variant="soft" color="primary" sx={sx.savingSheet}>
              <Box sx={sx.savingHeader}>
                <CircularProgress size="sm" />

                <Box sx={sx.savingTextWrap}>
                  <Typography level="title-sm">
                    מייבא משחקים...
                  </Typography>

                  <Typography level="body-xs" sx={sx.mutedText}>
                    הפעולה מתבצעת עכשיו. אין לסגור את החלון עד לסיום.
                    {savingSeconds > 0 ? ` זמן שעבר: ${savingSeconds} שניות` : ''}
                  </Typography>
                </Box>
              </Box>

              <LinearProgress />
            </Sheet>
          ) : null}

          {error ? (
            <Sheet variant="soft" color="danger" sx={sx.errorSheet}>
              <Typography level="body-sm">
                {error}
              </Typography>
            </Sheet>
          ) : null}
        </Box>

        <Divider />

        <Box sx={sx.drawerBody}>
          <BulkPasteInput
            value={text}
            onChange={setText}
            placeholder={SAMPLE_TEXT}
          />

          <BulkImportPreview preview={preview} />
        </Box>

        <Box sx={sx.drawerFooter}>
          <Box sx={sx.drawerFooterGroup}>
            <Button
              size="sm"
              variant="soft"
              color="neutral"
              onClick={handleUseSample}
              disabled={saving}
            >
              טען דוגמה
            </Button>

            <Button
              size="sm"
              variant="plain"
              color="neutral"
              onClick={handleClear}
              disabled={!text || saving}
            >
              נקה
            </Button>
          </Box>

          <Box sx={sx.drawerFooterGroup}>
            <Button
              size="sm"
              variant="plain"
              color="neutral"
              onClick={handleClose}
              disabled={saving}
            >
              סגור
            </Button>

            <Button
              size="sm"
              color="primary"
              disabled={!preview?.ok || saving}
              loading={saving}
              onClick={handleConfirmPreview}
            >
              {saving ? 'מייבא משחקים...' : 'ייבוא משחקים'}
            </Button>
          </Box>
        </Box>
      </Sheet>
    </Drawer>
  )
}
