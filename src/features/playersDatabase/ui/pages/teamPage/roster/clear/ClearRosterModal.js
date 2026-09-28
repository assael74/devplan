// src/features/playersDatabase/ui/pages/teamPage/roster/clear/ClearRosterModal.js

import * as React from 'react'
import { Modal, ModalDialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Stack } from '@mui/joy'
import { CLEAR_ROSTER_STEPS } from '../../../../../services/writeV2/roster/clear/clearRosterSession.js'
import { clearRosterSx as sx } from './clearRoster.sx.js'

export default function ClearRosterModal({ controller, seasonKey }) {
  const c = controller
  const busy = c.status === 'writing' || c.status === 'preparing'
  const step = CLEAR_ROSTER_STEPS[c.stepIndex]
  return (
    <Modal open={c.open} onClose={c.close}>
      <ModalDialog sx={sx.dialog}>
        <DialogTitle>מחיקת סגל — {seasonKey}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            {c.status === 'preparing' && <Typography>קורא את הנתונים מהשרת…</Typography>}
            {c.proposal && (
              <>
                <Typography>יימחקו {c.proposal.impact.players} שחקנים מהסגל ו־{c.proposal.impact.playerIndexes} אינדקסי שחקנים.</Typography>
                <Typography>נתוני הייבוא, ההיעדרויות הפתוחות ו־{c.proposal.impact.transfers || 0} מעברים של הקבוצה בעונה יתאפסו. מסמכי שחקנים שיושפעו: 0.</Typography>
                <Typography>יישמרו עונת הקבוצה, זהותה, נתוני הטבלה וכל העונות האחרות. הסטטיסטיקה ואיזון הסגל לא ישתנו. קבוצות אחרות שמופיעות במעברים לא ייקראו ולא ישתנו.</Typography>
                <details>
                  <summary>פירוט המסמכים</summary>
                  {CLEAR_ROSTER_STEPS.map(item => {
                    const count = c.counts[item.id] || { written: 0, skipped: 0, failed: 0 }
                    return (
                      <details key={item.id}>
                        <summary>{item.label}</summary>
                        <Typography level='body-sm'>נכתבו או הוסרו: {count.written} · דולגו: {count.skipped} · נכשלו: {count.failed}</Typography>
                      </details>
                    )
                  })}
                </details>
              </>
            )}
            {c.status === 'steps' && <Typography>השלב הבא: {step?.label || 'ביקורת מהשרת וסגירת הפעולה'}</Typography>}
            {busy && c.status !== 'preparing' && <Typography>הפעולה מתבצעת…</Typography>}
            {c.message && <Typography role='status'>{c.message}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          {c.status === 'preview' && <Button color='danger' onClick={c.approve}>אישור תוכנית המחיקה</Button>}
          {c.status === 'steps' && <Button onClick={c.next}>{step ? `ביצוע: ${step.label}` : 'בדיקה וסיום'}</Button>}
          {c.status === 'failed' && <Button onClick={c.retry}>הכנה ואישור מחדש לאותה פעולה</Button>}
          <Button variant='plain' disabled={busy || c.status === 'steps'} onClick={c.close}>סגירה</Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  )
}
