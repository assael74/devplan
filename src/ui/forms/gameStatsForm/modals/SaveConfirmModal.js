// src/ui/forms/gameStatsForm/modals/SaveConfirmModal.js

import React from 'react'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Modal,
  ModalDialog,
  Sheet,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../core/icons/iconUi.js'

const statusLabels = {
  draft: 'טיוטה',
  partial: 'חלקי',
  committed: 'מלא',
}

const getStatusLabel = status => {
  return statusLabels[status] || status || 'טיוטה'
}

const getConfirmButtonText = ({ status, pending }) => {
  if (pending) return 'שומר...'

  if (status === 'draft') return 'שמירה לטיוטה'
  if (status === 'partial') return 'שמירה כחלקי'
  if (status === 'committed') return 'אישור ושמירה מלאה'

  return 'אישור ושמירה'
}

const getErrorMessage = error => {
  if (!error) return ''

  return error?.message || String(error)
}

function PreviewRow({ label, value, color = 'neutral' }) {
  return (
    <Sheet variant="outlined" sx={{ p: 1, borderRadius: 'md' }}>
      <Typography level="body-xs" color="neutral">
        {label}
      </Typography>

      <Chip size="sm" variant="soft" color={color}>
        {value}
      </Chip>
    </Sheet>
  )
}

function EmptySaveNotice({ show }) {
  if (!show) return null

  return (
    <Sheet variant="soft" color="warning" sx={{ p: 1, borderRadius: 'md' }}>
      <Typography level="body-sm">
        אין נתונים משמעותיים לשמירה. מלא לפחות שדה אחד לפני אישור.
      </Typography>
    </Sheet>
  )
}

function SaveErrorNotice({ error }) {
  const message = getErrorMessage(error)
  if (!message) return null

  return (
    <Sheet variant="soft" color="danger" sx={{ p: 1, borderRadius: 'md' }}>
      <Typography level="body-sm">
        השמירה נכשלה. הטיוטה המקומית לא נמחקה.
      </Typography>

      <Typography level="body-xs" sx={{ mt: 0.5 }}>
        {message}
      </Typography>
    </Sheet>
  )
}

function SaveRulesNotice() {
  return (
    <Sheet variant="soft" color="neutral" sx={{ p: 1, borderRadius: 'md' }}>
      <Typography level="body-xs">
        שדות ריקים או שדות שערכם 0 בלבד לא יישמרו ב־Firestore.
        ב־triplet, אם אין total או success גדול מ־0, כל השלישייה תוסר מהשמירה.
      </Typography>
    </Sheet>
  )
}

export default function SaveConfirmModal({
  open,
  preview,
  pending = false,
  error = null,
  onClose,
  onConfirm,
}) {
  if (!preview) return null

  const hasData = Boolean(preview.hasDataToSave)
  const disabled = pending || !hasData
  const buttonText = getConfirmButtonText({
    status: preview.status,
    pending,
  })

  return (
    <Modal
      open={!!open}
      onClose={pending ? undefined : onClose}
    >
      <ModalDialog sx={{ width: 'min(540px, calc(100vw - 24px))' }}>
        <Box sx={{ display: 'grid', gap: 1.25 }}>
          <Box>
            <Typography level="title-md" startDecorator={iconUi({ id: 'save' })}>
              {preview.status === 'draft'
                ? 'אישור שמירה לטיוטה'
                : 'אישור שמירת סטטיסטיקה'}
            </Typography>

            <Typography level="body-sm" color="neutral">
              בדוק את סיכום הפעולה לפני עדכון הנתונים.
            </Typography>
          </Box>

          <Chip size="sm" variant="soft" color="primary">
            {preview.modeLabel}
          </Chip>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, minmax(0, 1fr))',
              },
              gap: 0.75,
            }}
          >
            <PreviewRow
              label="שחקנים שנבחרו"
              value={preview.selectedPlayersCount}
            />

            <PreviewRow
              label="שחקנים עם נתונים לשמירה"
              value={preview.savedPlayersCount}
              color="success"
            />

            <PreviewRow
              label="שחקנים ריקים שלא יישמרו"
              value={preview.skippedPlayersCount}
              color={preview.skippedPlayersCount ? 'warning' : 'neutral'}
            />

            <PreviewRow
              label="פרמטרים שנבחרו"
              value={preview.selectedParmsCount}
            />

            <PreviewRow
              label="שדות בפועל שיישמרו"
              value={preview.statsFieldsCount}
              color="primary"
            />

            <PreviewRow
              label="סטטוס"
              value={getStatusLabel(preview.status)}
              color="warning"
            />

            <PreviewRow
              label="זמן משחק"
              value={`${preview.timePlayed} דק׳`}
            />

            <PreviewRow
              label="זמן וידאו"
              value={`${preview.timeVideoStats} דק׳`}
            />
          </Box>

          <SaveRulesNotice />

          <EmptySaveNotice show={!hasData} />

          <SaveErrorNotice error={error} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="soft"
              color="neutral"
              disabled={pending}
              onClick={onClose}
            >
              ביטול
            </Button>

            <Button
              variant="solid"
              color="success"
              disabled={disabled}
              onClick={onConfirm}
              startDecorator={
                pending
                  ? <CircularProgress size="sm" />
                  : iconUi({ id: 'save' })
              }
            >
              {buttonText}
            </Button>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  )
}
