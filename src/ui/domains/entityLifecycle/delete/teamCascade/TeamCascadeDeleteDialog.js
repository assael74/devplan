// src/ui/entityLifecycle/delete/teamCascade/TeamCascadeDeleteDialog.js

import React, { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Modal,
  ModalDialog,
  Stack,
  Typography,
} from '@mui/joy'

const LABELS = {
  players: 'שחקנים',
  games: 'משחקים',
  stats: 'טפסי סטטיסטיקה',
  meetings: 'פגישות',
  payments: 'תשלומים לארכוב',
  photos: 'תמונות',
}

const WARNING_LABELS = {
  TEAM_NOT_FOUND: 'הקבוצה לא נמצאה בדאטה',
  TEAM_HAS_NO_PLAYERS: 'לא נמצאו שחקנים משויכים לקבוצה',
  TEAM_HAS_NO_GAMES: 'לא נמצאו משחקים משויכים לקבוצה',
  ADVANCED_STATS_WILL_BE_DELETED: 'סטטיסטיקה מתקדמת תימחק לפני מחיקת המשחקים',
  PAYMENTS_WILL_BE_ARCHIVED_WITH_SNAPSHOTS:
    'תשלומים יעברו לארכיון עם פרטי שחקן, קבוצה ומועדון',
  MEETINGS_WILL_BE_DELETED: 'פגישות משויכות יימחקו',
}

function CountRow({ label, value, tone = 'neutral' }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        py: 0.75,
      }}
    >
      <Typography level="body-sm">{label}</Typography>
      <Chip size="sm" variant="soft" color={tone}>
        {value || 0}
      </Chip>
    </Box>
  )
}

function WarningList({ warnings }) {
  if (!warnings?.length) return null

  return (
    <Alert color="warning" variant="soft" sx={{ alignItems: 'flex-start' }}>
      <Stack spacing={0.5}>
        <Typography level="title-sm">שים לב</Typography>
        {warnings.map(warning => (
          <Typography key={warning} level="body-xs">
            {WARNING_LABELS[warning] || warning}
          </Typography>
        ))}
      </Stack>
    </Alert>
  )
}

export default function TeamCascadeDeleteDialog({
  open,
  plan,
  busy = false,
  onClose,
  onConfirm,
}) {
  const [confirmText, setConfirmText] = useState('')

  const teamName = plan?.teamSnapshot?.name || plan?.team?.teamName || ''
  const clubName = plan?.teamSnapshot?.clubName || plan?.club?.clubName || ''
  const counts = plan?.counts || {}
  const teamYear = plan?.team?.teamYear || ''

const teamLabel = teamName || 'קבוצה ללא שם'
const clubLabel = clubName || 'מועדון לא מזוהה'
const yearLabel = teamYear || 'שנתון לא מזוהה'

  const canConfirm = useMemo(() => {
    return confirmText.trim() === 'מחיקה מלאה'
  }, [confirmText])

  const handleClose = () => {
    if (busy) return
    setConfirmText('')
    onClose?.()
  }

  const handleConfirm = async () => {
    if (!canConfirm || busy) return
    await onConfirm?.()
    setConfirmText('')
  }

  return (
    <Modal open={!!open} onClose={handleClose}>
      <ModalDialog
        variant="outlined"
        sx={{
          width: 'min(520px, calc(100vw - 24px))',
          maxHeight: 'calc(100dvh - 48px)',
          overflow: 'hidden',
          p: 0,
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography level="title-lg" color="danger">
            מחיקה מלאה של קבוצה
          </Typography>

          <Typography level="body-sm" sx={{ mt: 0.5 }}>
            פעולה זו תמחק את הקבוצה ואת כל הדאטה המשויך אליה.
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ p: 2, overflowY: 'auto' }} className="dpScrollThin">
          <Stack spacing={1.5}>
            <Box
              sx={{
                p: 1.25,
                borderRadius: 12,
                bgcolor: 'background.level1',
                border: '1px solid',
                borderColor: 'divider',
              }}
              >
              <Typography level="title-sm" sx={{ fontWeight: 700 }}>
                {teamLabel}
              </Typography>

              <Typography level="body-sm" color="neutral">
                מועדון: {clubLabel}
              </Typography>

              <Typography level="body-sm" color="neutral">
                שנתון: {yearLabel}
              </Typography>
            </Box>

            <Alert color="danger" variant="soft">
              <Typography level="body-sm">
                המחיקה אינה פעולה רגילה. שחקנים, משחקים, פגישות וסטטיסטיקה יימחקו.
                תשלומים לא יימחקו — הם יעברו לארכיון עם snapshot מזהה.
              </Typography>
            </Alert>

            <Box>
              <Typography level="title-sm" sx={{ mb: 0.5 }}>
                מה יושפע
              </Typography>

              <CountRow label="קבוצה" value={counts.teams || 0} tone="danger" />
              <CountRow label={LABELS.players} value={counts.players} tone="danger" />
              <CountRow label={LABELS.games} value={counts.games} tone="danger" />
              <CountRow label={LABELS.stats} value={counts.stats} tone="danger" />
              <CountRow label={LABELS.meetings} value={counts.meetings} tone="warning" />
              <CountRow label={LABELS.payments} value={counts.payments} tone="primary" />
              <CountRow label={LABELS.photos} value={counts.photos} tone="neutral" />
            </Box>

            <WarningList warnings={plan?.warnings || []} />

            <Box>
              <Typography level="body-xs" sx={{ mb: 0.75 }}>
                כדי לאשר, כתוב: <b>מחיקה מלאה</b>
              </Typography>

              <input
                value={confirmText}
                disabled={busy}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="מחיקה מלאה"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--joy-palette-neutral-outlinedBorder)',
                  background: 'var(--joy-palette-background-surface)',
                  color: 'var(--joy-palette-text-primary)',
                  fontFamily: 'inherit',
                }}
              />
            </Box>
          </Stack>
        </Box>

        <Divider />

        <Box
          sx={{
            p: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Button
            size="sm"
            variant="plain"
            color="neutral"
            disabled={busy}
            onClick={handleClose}
          >
            ביטול
          </Button>

          <Button
            size="sm"
            color="danger"
            loading={busy}
            disabled={!canConfirm || busy}
            onClick={handleConfirm}
          >
            מחק קבוצה וכל הנתונים
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  )
}
