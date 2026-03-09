// src/ui/entityLifecycle/EntityLifecycleDialog.js
import React from 'react'
import { Modal, ModalDialog, ModalClose, Typography, Box, Button, Alert } from '@mui/joy'

const titleFor = (entityType) => {
  if (entityType === 'team') return 'קבוצה'
  if (entityType === 'player') return 'שחקן'
  if (entityType === 'club') return 'מועדון'
  if (entityType === 'role') return 'איש צוות'
  if (entityType === 'tag') return 'תג וידאו'
  if (entityType === 'videoAnalysis') return 'ניתוח וידאו'
  if (entityType === 'videoGeneral') return 'וידאו כללי'
  return 'יישות'
}

export default function EntityLifecycleDialog({
  open,
  entityType,
  entityName,
  policy,
  onDelete,
  onArchive,
  onClose,
  busy,
}) {
  if (!open) return null
  if (!policy) return null

  const { canDelete, reason } = policy
  const entityLabel = titleFor(entityType)

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <ModalClose disabled={!!busy} />

        <Typography level="h4" mb={1}>
          {canDelete ? `מחיקת ${entityLabel}` : `לא ניתן למחוק ${entityLabel}`}
        </Typography>

        <Box mb={2}>
          {canDelete ? (
            <Alert variant="soft" color="danger" sx={{ mb: 1 }}>
              מחיקה היא פעולה סופית. לא ניתן לשחזר לאחר ביצוע.
            </Alert>
          ) : (
            <Alert variant="soft" color="warning" sx={{ mb: 1 }}>
              לא ניתן למחוק — ניתן לבצע ארכוב במקום.
            </Alert>
          )}

          {canDelete ? (
            <Typography>
              למחוק את <b>{entityName}</b> לצמיתות?
            </Typography>
          ) : (
            <>
              <Typography>
                <b>{entityName}</b> לא ניתן למחיקה.
              </Typography>

              {reason ? (
                <Typography level="body-sm" mt={0.5} color="neutral">
                  {reason}
                </Typography>
              ) : null}

              <Typography level="body-sm" mt={1} color="neutral">
                ארכוב משאיר את הנתונים במערכת אך מסמן את היישות כלא פעילה (ניתן להחזיר בהמשך).
              </Typography>
            </>
          )}
        </Box>

        <Box display="flex" gap={1} justifyContent="flex-end">
          <Button variant="plain" disabled={!!busy} onClick={onClose}>
            סגור
          </Button>

          {canDelete ? (
            <Button color="danger" loading={!!busy} disabled={!!busy} onClick={onDelete}>
              מחק לצמיתות
            </Button>
          ) : (
            <Button variant="solid" loading={!!busy} disabled={!!busy} onClick={onArchive}>
              ארכב במקום למחוק
            </Button>
          )}
        </Box>
      </ModalDialog>
    </Modal>
  )
}
