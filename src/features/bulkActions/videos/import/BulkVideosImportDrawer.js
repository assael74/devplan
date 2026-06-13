//  src/features/bulkActions/videos/import/BulkVideosImportDrawer.js

import React from 'react'
import {
  Alert,
  Box,
  Button,
  Drawer,
  ModalClose,
  Sheet,
  Stack,
  Textarea,
  Typography,
} from '@mui/joy'

import { bulkVideosImportSx as sx } from './sx/bulkVideosImport.sx.js'
import { useBulkVideosImport } from './hooks/useBulkVideosImport.js'
import BulkVideosImportPreview from './BulkVideosImportPreview.js'

export default function BulkVideosImportDrawer({
  open,
  onClose,
  onImported,
  onImportVideos,
}) {
  const model = useBulkVideosImport({ onImportVideos })

  const handleClose = () => {
    if (model.pending) return

    model.reset()
    onClose()
  }

  const handleImport = async () => {
    const res = await model.runImport()

    if (!res) return

    if (typeof onImported === 'function') {
      onImported(res)
    }

    handleClose()
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      anchor="right"
      size="lg"
      slotProps={{
        content: {
          className: 'dpScrollThin',
          sx: sx.drawer,
        },
      }}
    >
      <ModalClose disabled={model.pending} />

      <Sheet sx={sx.root}>
        <Box sx={sx.header}>
          <Box>
            <Typography level="title-lg">
              ייבוא מספר קטעי וידאו
            </Typography>

            <Typography level="body-xs" sx={sx.subtitle}>
              הדבק מאקסל שתי עמודות: שם וידאו וקישור Google Drive. לאחר מכן אפשר לערוך שם ולבחור קטגוריה לכל קטע.
            </Typography>
          </Box>
        </Box>

        <Stack spacing={2} sx={sx.content} className="dpScrollThin">
          <Box>
            <Typography level="title-sm" sx={sx.sectionTitle}>
              נתונים להדבקה
            </Typography>

            <Textarea
              minRows={7}
              value={model.pasteValue}
              disabled={model.pending}
              placeholder={'שם וידאו\tקישור\nבילד אפ מול לחץ גבוה\thttps://drive.google.com/file/d/...'}
              onChange={event => model.setPasteValue(event.target.value)}
              sx={sx.textarea}
            />
          </Box>

          {model.hasRows && (
            <BulkVideosImportPreview
              rows={model.rows}
              categories={model.categories}
              pending={model.pending}
              onNameChange={model.setRowName}
              onCategoryChange={model.setRowCategory}
            />
          )}

          {model.hasInvalidRows && (
            <Alert color="danger" variant="soft" size="sm">
              קיימות שורות לא תקינות. יש לתקן שם וידאו או קישור לפני העלאה.
            </Alert>
          )}

          {!model.hasInvalidRows && model.hasMissingCategories && (
            <Alert color="warning" variant="soft" size="sm">
              יש לבחור קטגוריה לכל קטע וידאו לפני העלאה.
            </Alert>
          )}

          {model.error && (
            <Alert color="danger" variant="soft" size="sm">
              {model.error}
            </Alert>
          )}
        </Stack>

        <Box sx={sx.footer}>
          <Box>
            <Typography level="body-xs">
              שורות תקינות: {model.validRows.length}
            </Typography>

            {!!model.invalidRows.length && (
              <Typography level="body-xs" color="danger">
                שורות לא תקינות: {model.invalidRows.length}
              </Typography>
            )}

            {!!model.rowsMissingCategory.length && (
              <Typography level="body-xs" color="warning">
                חסרה קטגוריה: {model.rowsMissingCategory.length}
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              size="sm"
              variant="plain"
              color="neutral"
              disabled={model.pending}
              onClick={handleClose}
            >
              ביטול
            </Button>

            <Button
              size="sm"
              variant="solid"
              color="primary"
              loading={model.pending}
              disabled={!model.canImport}
              onClick={handleImport}
            >
              העלאת מספר קטעי וידאו
            </Button>
          </Stack>
        </Box>
      </Sheet>
    </Drawer>
  )
}
