// src/features/playersDatabase/ui/pages/teamPage/stats/import/components/StatsFinalSyncPanel.js

import { Alert, Box, Card, CircularProgress, Stack, Typography } from '@mui/joy'

import SyncStageCards from '../../../../../components/sync/SyncStageCards.js'
import SyncStatusHeader from '../../../../../components/sync/SyncStatusHeader.js'
import { statsImportModalSx as sx } from '../sx/statsImportModal.sx.js'

export default function StatsFinalSyncPanel({ controller }) {
  const executionStatus = controller?.executionStatus || controller?.status || 'idle'
  const stages = Array.isArray(controller?.syncStages) ? controller.syncStages : []
  const audit = controller?.auditResult
  const findingsCount = Array.isArray(audit?.findings) ? audit.findings.length : 0
  const auditClean = audit?.coverage?.complete === true && findingsCount === 0
  const receiptId = controller?.receiptId ||
    controller?.executionReceipt?.id ||
    controller?.result?.receiptId ||
    ''

  return (
    <Box sx={sx.syncPanel}>
      <Box sx={sx.syncHeading}>
        <Typography level='title-md'>סדר עדכון המסמכים</Typography>
      </Box>

      <Box sx={sx.syncCardsArea}>
        <SyncStageCards stages={stages} compact />
      </Box>

      {executionStatus === 'ready' ? (
        <Alert color='primary' variant='soft' sx={sx.syncStatusNotice}>
          הנתונים אושרו ומוכנים לטעינה. הפעולה תתחיל רק לאחר לחיצה על הכפתור הראשי.
        </Alert>
      ) : null}

      {executionStatus === 'writing' ? (
        <Card variant='soft' color='primary'>
          <Stack direction='row' spacing={1} alignItems='center'>
            <CircularProgress size='sm' />
            <Box sx={sx.syncStatusContent}>
              <SyncStatusHeader
                title='טעינת הסטטיסטיקות מתבצעת'
                receiptId={receiptId}
              />
              <Typography level='body-xs'>אין לסגור את החלון עד לסיום הכתיבה והבדיקה.</Typography>
            </Box>
          </Stack>
        </Card>
      ) : null}

      {executionStatus === 'failed' ? (
        <Alert color='danger' variant='soft' sx={sx.syncStatusNotice}>
          <Box sx={sx.syncStatusContent}>
            <SyncStatusHeader
              title='טעינת הסטטיסטיקות לא הושלמה'
              receiptId={receiptId}
            />
            <Typography level='body-sm'>
              {controller?.executionError || 'הפעולה לא הושלמה.'}
            </Typography>
            <Typography level='body-xs' sx={{ mt: 0.5 }}>
              {controller?.retryMode === 'repair'
                ? 'מקור האמת כבר אושר. הפעולה הבאה תתקן רק את התוצרים באותה קבלה.'
                : 'מקור האמת לא אושר. ניסיון חוזר ישתמש בקלט המאושר ובאותה קבלה.'}
            </Typography>
          </Box>
        </Alert>
      ) : null}

      {executionStatus === 'audit_failed' ? (
        <Alert color='warning' variant='soft' sx={sx.syncStatusNotice}>
          <Box sx={sx.syncStatusContent}>
            <SyncStatusHeader
              title='בדיקת הסנכרון אינה נקייה'
              receiptId={receiptId}
            />
            <Typography level='body-xs'>
              {`${findingsCount} ממצאים. ניתן לנסות שוב עם אותה קבלה.`}
            </Typography>
          </Box>
        </Alert>
      ) : null}

      {executionStatus === 'success' ? (
        <Alert
          color={auditClean && controller?.listenerConfirmed ? 'success' : auditClean ? 'primary' : 'danger'}
          variant='soft'
          sx={sx.syncStatusNotice}
        >
          <Box sx={sx.syncStatusContent}>
            <SyncStatusHeader
              title={auditClean ? 'טעינת הסטטיסטיקות והבדיקה הושלמו' : 'בדיקת הסנכרון מצאה פערים'}
              receiptId={receiptId}
            />
            <Typography level='body-xs'>
              {auditClean && controller?.listenerConfirmed
                ? 'העמוד התעדכן בזמן אמת.'
                : auditClean
                  ? 'הקבלה תקינה. ממתין לעדכון עמוד הקבוצה.'
                  : `נמצאו ${findingsCount} פערים.`}
            </Typography>
          </Box>
        </Alert>
      ) : null}
    </Box>
  )
}
