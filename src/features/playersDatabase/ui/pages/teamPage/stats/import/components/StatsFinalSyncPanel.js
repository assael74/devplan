// src/features/playersDatabase/ui/pages/teamPage/stats/import/components/StatsFinalSyncPanel.js

import * as React from 'react'
import { Button, Chip, Stack, Typography } from '@mui/joy'

export default function StatsFinalSyncPanel({ controller }) {
  const status = controller?.status || 'idle'
  const audit = controller?.auditResult
  const findingsCount = Array.isArray(audit?.findings) ? audit.findings.length : 0

  return (
    <Stack spacing={1.5}>
      <Typography level='title-lg'>סנכרון סופי</Typography>
      <Typography level='body-sm'>הכתיבה, ההקרנות, הבדיקה וסגירת הקבלה מבוצעות בתוך פעולת Stats Load אחת.</Typography>

      {status === 'writing' ? (
        <Chip color='primary' variant='soft'>כותב ובודק את הנתונים...</Chip>
      ) : null}
      {status === 'success' ? (
        controller?.listenerConfirmed ? (
          <Chip color='success' variant='soft'>הסנכרון הושלם והעמוד התעדכן בזמן אמת</Chip>
        ) : (
          <Chip color='primary' variant='soft'>הקבלה נסגרה. ממתין לעדכון עמוד הקבוצה...</Chip>
        )
      ) : null}
      {status === 'audit_failed' ? (
        <>
          <Chip color='warning' variant='soft'>{`הבדיקה אינה נקייה · ${findingsCount} ממצאים`}</Chip>
          <Button size='sm' variant='soft' color='warning' onClick={controller.retry}>נסה שוב</Button>
        </>
      ) : null}
      {status === 'failed' ? (
        <>
          <Typography level='body-sm' color='danger'>{controller.error?.message || 'טעינת הסטטיסטיקות נכשלה'}</Typography>
          <Button size='sm' variant='soft' color='danger' onClick={controller.retry}>נסה שוב</Button>
        </>
      ) : null}
      {controller?.receiptId ? (
        <Typography level='body-xs'>{`Receipt: ${controller.receiptId}`}</Typography>
      ) : null}
    </Stack>
  )
}
