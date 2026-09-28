// src/features/playersDatabase/ui/pages/teamPage/stats/clear/components/ClearStatsModal.js

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/joy'

import RegularModal from '../../../../../components/modals/RegularModal.js'
import { clearStatsModalSx as sx } from '../sx/clearStatsModal.sx.js'

const ERROR_MESSAGES = {
  CLEAR_STATS_MULTIPLE_OPEN_RECEIPTS: 'נמצאו כמה פעולות סטטיסטיקה פתוחות. נדרשת בדיקה לפני המשך.',
  CLEAR_STATS_OTHER_OPERATION_OPEN: 'קיימת פעולת סטטיסטיקה אחרת שטרם הושלמה. יש להשלים אותה לפני התחלת המחיקה.',
  CLEAR_STATS_PROJECTION_SOURCE_MISMATCH: 'הנתונים השתנו מאז הצגת התצוגה המקדימה. יש לבנות תוכנית חדשה.',
  CLEAR_STATS_PROJECTION_TARGET_NOT_FOUND: 'אחד ממסמכי היעד לא נמצא.',
  CLEAR_STATS_AUDIT_FAILED: 'המחיקה הסתיימה, אך בדיקת הסנכרון מצאה פער.',
  CLEAR_STATS_TEAM_ROOT_NOT_FOUND: 'מסמך הקבוצה לא נמצא.',
  CLEAR_STATS_TEAM_SEASON_NOT_FOUND: 'מסמך העונה של הקבוצה לא נמצא.',
}

const FAILURE_STEP_LABELS = {
  receipt: 'פתיחת תיעוד הפעולה',
  canonical: 'עדכון נתוני הקבוצה והעונה',
  projections: 'עדכון המסמכים הנלווים',
  audit: 'בדיקת תקינות וסנכרון',
}

const TARGET_LABELS = {
  playerDocument: 'מסמכי השחקנים',
  playerSearchIndex: 'אינדקסי השחקנים',
  teamSearchIndex: 'אינדקס הקבוצה',
  league: 'מסמך הליגה',
  club: 'מסמך המועדון',
  clubsMaster: 'מאגר המועדונים',
}

const AUDIT_TARGET_LABELS = {
  teamSeason: 'נתוני הקבוצה והעונה',
  ...TARGET_LABELS,
}

const summarizeProjectionTargets = projectionWrite => {
  const groups = new Map()
  const add = target => {
    const targetType = String(target?.targetType || '').trim()
    if (!targetType) return
    const current = groups.get(targetType) || { written: 0, skipped: 0, failed: 0 }
    if (target?.status === 'written') current.written += 1
    if (target?.status === 'skipped') current.skipped += 1
    if (target?.status === 'failed') current.failed += 1
    groups.set(targetType, current)
  }

  ;(Array.isArray(projectionWrite?.targets) ? projectionWrite.targets : []).forEach(add)
  add(projectionWrite?.failedTarget)

  return Object.keys(TARGET_LABELS)
    .filter(targetType => groups.has(targetType))
    .map(targetType => ({
      targetType,
      label: TARGET_LABELS[targetType],
      ...groups.get(targetType),
    }))
}

const executionSummaryText = item => {
  const parts = []
  if (item.written) parts.push(`${item.written} נכתבו`)
  if (item.skipped) parts.push(`${item.skipped} כבר היו תקינים`)
  if (item.failed) parts.push('העדכון נעצר כאן')
  return parts.join(' · ')
}

const ProjectionExecutionSummary = ({ projectionWrite }) => {
  const items = summarizeProjectionTargets(projectionWrite)
  if (items.length === 0) return null

  return (
    <Box component='details' sx={sx.executionGroup}>
      <Box component='summary' sx={sx.executionGroupSummary}>
        <Typography level='title-sm'>פירוט עדכון המסמכים</Typography>
      </Box>
      <Box sx={sx.executionItemsGroup}>
        {items.map(item => (
          <Box component='details' key={item.targetType} sx={sx.executionItem}>
            <Box component='summary' sx={sx.executionItemSummaryButton}>
              <Box sx={sx.executionItemSummary}>
                <Typography level='body-sm'>{item.label}</Typography>
                <Typography
                  level='body-xs'
                  textColor={item.failed ? 'danger.600' : 'text.secondary'}
                >
                  {executionSummaryText(item)}
                </Typography>
              </Box>
            </Box>
            <Box sx={sx.executionItemDetails}>
              {item.written ? (
                <Typography level='body-xs'>נכתבו {item.written} מסמכים</Typography>
              ) : null}
              {item.skipped ? (
                <Typography level='body-xs'>
                  {item.skipped} מסמכים כבר היו תקינים ולא נכתבו מחדש
                </Typography>
              ) : null}
              {item.failed ? (
                <Typography level='body-xs' textColor='danger.600'>
                  העדכון נעצר בסוג מסמך זה
                </Typography>
              ) : null}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

const SummaryItem = ({ label, value }) => (
  <Box sx={sx.summaryItem}>
    <Typography level='body-xs' textColor='text.tertiary'>
      {label}
    </Typography>
    <Typography level='title-sm'>
      {value}
    </Typography>
  </Box>
)

export default function ClearStatsModal({
  controller,
  teamName,
  seasonKey,
}) {
  const {
    open,
    status,
    proposedPlan,
    result,
    error,
    close,
    execute,
    retry,
  } = controller

  const projectionImpact = proposedPlan?.projectionPlan?.impact || {}
  const noWork = Boolean(
    proposedPlan?.isIdempotent === true &&
    Number(projectionImpact.operationsRequired || 0) === 0
  )
  const busy = status === 'loadingPreview' || status === 'executing'
  const failedStepLabel = FAILURE_STEP_LABELS[error?.failedStep] || 'לא ידוע'
  const auditFailures = Array.isArray(error?.audit?.checks)
    ? error.audit.checks.filter(item => item?.status === 'failed')
    : []

  return (
    <RegularModal
      open={open}
      title='מחיקת נתוני סטטיסטיקה'
      iconId='delete'
      busy={busy}
      persistent={busy}
      hideFooter
      contentSx={sx.content}
      onClose={close}
    >
      <Box sx={sx.body}>
        {status === 'loadingPreview' ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size='sm' />
            <Typography level='body-sm'>טוען מצב עדכני מהשרת...</Typography>
          </Box>
        ) : null}

        {status === 'ready' ? (
          <>
            <Typography level='body-sm'>
              הפעולה תנקה את נתוני הסטטיסטיקה ואת נתוני הסקאוטינג שנגזרו מהם עבור הקבוצה והעונה שנבחרו.
            </Typography>
            <Alert color='neutral' variant='soft'>
              הפעולה לא תמחק שחקנים, סגל, תנועות שחקנים, מסמכי שחקנים, נתוני טבלה רשמיים או ביצועי קבוצה.
            </Alert>

            {noWork ? (
              <Alert color='success' variant='soft'>
                נתוני הסטטיסטיקה כבר נקיים. ניתן לאשר ביקורת מהשרת ולתעד את השלמת הפעולה, ללא שינוי נתונים שכבר תקינים.
              </Alert>
            ) : (
              <Box sx={sx.summaryGrid}>
                <SummaryItem label='קבוצה' value={teamName || proposedPlan?.identity?.birthTeamDocumentId || '—'} />
                <SummaryItem label='עונה' value={seasonKey || proposedPlan?.identity?.seasonKey || '—'} />
                <SummaryItem label='מצב הנתונים הנוכחי' value={proposedPlan?.currentStatsState === 'absent' ? 'חסרים' : 'קיימים'} />
                <SummaryItem label='שחקנים שיושפעו' value={proposedPlan?.impact?.playersAffected || 0} />
                <SummaryItem
                  label='שחקנים שפרופיל הסקאוט שלהם ינוקה'
                  value={proposedPlan?.impact?.scoutProfilePlayersAffected || 0}
                />
                <SummaryItem label='מסמכים נלווים לעדכון' value={projectionImpact.operationsRequired || 0} />
                <SummaryItem label='עדכון מסמך הקבוצה והעונה' value={proposedPlan?.isIdempotent ? 'לא נדרש' : 'נדרש'} />
              </Box>
            )}

            <Box sx={sx.actions}>
              <Button color={noWork ? 'primary' : 'danger'} onClick={execute}>
                {noWork ? 'אישור ביקורת וסיום' : 'מחק נתוני סטטיסטיקה'}
              </Button>
              <Button variant='plain' color='neutral' onClick={close}>
                {noWork ? 'סגור' : 'ביטול'}
              </Button>
            </Box>
          </>
        ) : null}

        {status === 'executing' ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size='sm' />
            <Typography level='body-sm'>מנקה ומאמת את הנתונים...</Typography>
          </Box>
        ) : null}

        {status === 'succeeded' ? (
          <>
            <Alert color='success' variant='soft'>
              {noWork ? 'נתוני הסטטיסטיקה נקיים והביקורת הושלמה בהצלחה' : 'נתוני הסטטיסטיקה נמחקו בהצלחה'}
            </Alert>
            {error ? (
              <Alert color='warning' variant='soft'>
                המחיקה הסתיימה, אך רענון הנתונים בעמוד נכשל. ניתן לסגור ולרענן את העמוד ידנית.
              </Alert>
            ) : null}
            <Box sx={sx.summaryGrid}>
              <SummaryItem label='שחקנים שעודכנו' value={result?.canonicalWrite?.playersAffected || 0} />
              <SummaryItem label='מסמכים שנכתבו' value={result?.projectionWrite?.writesCompleted || 0} />
              <SummaryItem label='מסמכים שכבר היו תקינים' value={result?.projectionWrite?.writesSkipped || 0} />
              <SummaryItem label='בדיקת תקינות' value={result?.audit?.status === 'passed' ? 'עברה בהצלחה' : 'נכשלה'} />
            </Box>
            <ProjectionExecutionSummary projectionWrite={result?.projectionWrite} />
            <Box
              aria-hidden='true'
              sx={{ display: 'none' }}
              data-receipt-id={result?.receiptId || ''}
            />
            <Box sx={sx.actions}>
              <Button variant='plain' color='neutral' onClick={close}>סגור</Button>
            </Box>
          </>
        ) : null}

        {status === 'failed' ? (
          <>
            <Alert color='danger' variant='soft'>
              <Box>
                <Typography level='title-sm'>מחיקת נתוני הסטטיסטיקה לא הושלמה</Typography>
                <Typography level='body-sm'>
                  {ERROR_MESSAGES[error?.code] || 'אירעה שגיאה במהלך הפעולה. ניתן לנסות שוב.'}
                </Typography>
              </Box>
            </Alert>
            <Box sx={sx.summaryGrid}>
              <SummaryItem label='השלב שבו הפעולה נעצרה' value={failedStepLabel} />
              <SummaryItem
                label='נתוני הקבוצה והעונה'
                value={error?.canonicalWrite ? 'העדכון הסתיים' : 'העדכון לא הושלם'}
              />
              <SummaryItem
                label='מסמכים נלווים שנכתבו'
                value={error?.projectionWrite?.writesCompleted || 0}
              />
            </Box>
            <ProjectionExecutionSummary projectionWrite={error?.projectionWrite} />
            {auditFailures.length > 0 ? (
              <Alert color='warning' variant='soft'>
                <Box>
                  <Typography level='title-sm'>פערים שנמצאו בבדיקת התקינות</Typography>
                  {auditFailures.slice(0, 3).map((finding, index) => (
                    <Typography key={`${finding.targetType}-${finding.check}-${index}`} level='body-xs'>
                      נמצא פער ב־{AUDIT_TARGET_LABELS[finding.targetType] || 'אחד המסמכים הנלווים'}
                    </Typography>
                  ))}
                  {auditFailures.length > 3 ? (
                    <Typography level='body-xs'>ועוד {auditFailures.length - 3} ממצאים</Typography>
                  ) : null}
                </Box>
              </Alert>
            ) : null}
            <Box
              aria-hidden='true'
              sx={{ display: 'none' }}
              data-receipt-id={error?.receiptId || ''}
              data-error-code={error?.code || ''}
              data-failed-document-id={error?.projectionWrite?.failedTarget?.docId || ''}
            />
            <Typography level='body-sm'>
              הנתונים לא ימשיכו להימחק אוטומטית. ניסיון נוסף יבנה תוכנית חדשה לפי המצב הנוכחי.
            </Typography>
            <Box sx={sx.actions}>
              <Button color='danger' onClick={retry}>נסה שוב</Button>
              <Button variant='plain' color='neutral' onClick={close}>סגור</Button>
            </Box>
          </>
        ) : null}
      </Box>
    </RegularModal>
  )
}
