// src/features/playersDatabase/ui/pages/DataOpsPage/DataOpsReceiptsPage.js

import { useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Option,
  Select,
  Stack,
  Table,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import InfoPanel from '../../components/page/InfoPanel.js'
import useWriteActionReceipts from './hooks/useWriteActionReceipts.js'
import { downloadDataOpsJson } from './logic/dataOpsJsonDownload.logic.js'
import { buildReceiptDetails, buildReceiptRows, receiptDetailLabel } from './logic/receiptRows.logic.js'
import { dataOpsPageSx as sx } from './sx/dataOpsPage.sx.js'

const toneToJoyColor = tone => {
  if (tone === 'danger') return 'danger'
  if (tone === 'warning') return 'warning'
  if (tone === 'success') return 'success'
  if (tone === 'info') return 'primary'
  return 'neutral'
}

function ReceiptTable({ rows, model, emptyText }) {
  if (!rows.length) return <Typography sx={sx.receiptsState}>{emptyText}</Typography>

  return (
    <Box sx={sx.tableShell}>
      <Table hoverRow sx={sx.table}>
        <thead>
          <tr>
            <th>קבלה</th>
            <th>תחום</th>
            <th>פעולה</th>
            <th>סטטוס</th>
            <th>עדכון אחרון</th>
            <th>פעולה</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              <td><Typography component='code' level='body-sm'>{row.id}</Typography></td>
              <td>{row.scope}</td>
              <td>{row.action}</td>
              <td>
                <Chip size='sm' variant='soft' color={toneToJoyColor(row.tone)}>
                  {row.status}
                </Chip>
              </td>
              <td>{row.time}</td>
              <td>
                <Button
                  type='button'
                  size='sm'
                  variant='plain'
                  loading={model.detailsLoadingId === row.id}
                  disabled={Boolean(model.detailsLoadingId) && model.detailsLoadingId !== row.id}
                  onClick={() => model.openReceipt(row.id).catch(() => {})}
                >
                  הצג פרטים
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  )
}

function ReceiptDetailsDialog({ model }) {
  const [confirmed, setConfirmed] = useState(false)
  const details = buildReceiptDetails(model.selectedReceipt)
  if (!details) return null

  const syncAudit = model.syncCheck || null
  const syncStatus = String(
    syncAudit && (syncAudit.status || syncAudit.result)
      ? syncAudit.status || syncAudit.result
      : ''
  ).toUpperCase()
  const syncFindings = syncAudit && Array.isArray(syncAudit.findings)
    ? syncAudit.findings
    : []
  const coveredTargets = syncAudit && syncAudit.coverage
    && Array.isArray(syncAudit.coverage.coveredTargets)
    ? syncAudit.coverage.coveredTargets
    : []

  const close = () => {
    setConfirmed(false)
    model.closeReceipt()
  }

  const repair = async () => {
    try {
      await model.repairReceipt()
      setConfirmed(false)
    } catch {
      // The hook owns the visible error state.
    }
  }

  return (
    <Modal open onClose={model.repairing || model.checkingSync ? undefined : close}>
      <ModalDialog sx={sx.receiptDialog}>
        <ModalClose disabled={model.repairing || model.checkingSync} />
        <DialogTitle>פרטי קבלה</DialogTitle>
        <DialogContent className='dpScrollThin' sx={sx.receiptDialogContent}>
          <Stack spacing={1.5}>
            <Box sx={sx.receiptDetailHeader}>
              <Box>
                <Typography level='title-md'>{details.action}</Typography>
                <Typography component='code' level='body-xs'>{details.id}</Typography>
              </Box>
              <Chip size='sm' variant='soft' color={toneToJoyColor(details.tone)}>
                {details.status}
              </Chip>
            </Box>

            <Box sx={sx.receiptDetailGrid}>
              <Box><Typography level='body-xs'>שמירת הנתונים</Typography><Typography level='body-sm'>{details.canonicalOutcome}</Typography></Box>
              <Box><Typography level='body-xs'>מצב ביצוע</Typography><Typography level='body-sm'>{details.executionStatus || 'לא ידוע'}</Typography></Box>
              <Box><Typography level='body-xs'>בעיות בבדיקה הקודמת</Typography><Typography level='body-sm'>{details.findingsCount === null ? 'לא ידוע' : details.findingsCount}</Typography></Box>
            </Box>

            {details.target.length ? (
              <Box sx={sx.receiptDetailList}>
                {details.target.map(([label, value]) => (
                  <Box key={label} sx={sx.receiptDetailRow}>
                    <Typography level='body-xs'>{label}</Typography>
                    <Typography component='code' level='body-xs'>{value}</Typography>
                  </Box>
                ))}
              </Box>
            ) : null}

            <Box>
              <Typography level='body-xs'>שלבים שהושלמו</Typography>
              <Typography level='body-sm'>
                {details.completedStages.length ? details.completedStages.join(', ') : 'אין שלבים מאושרים'}
              </Typography>
            </Box>

            {details.failedStage ? (
              <Box sx={sx.receiptsError}>
                <Typography level='title-sm'>השלב שנכשל: {details.failedStage}</Typography>
                <Typography level='body-sm'>{details.failedReason || 'לא נשמר פירוט שגיאה'}</Typography>
              </Box>
            ) : null}

            <Box sx={sx.receiptSyncCheck}>
              <Box>
                <Typography level='title-sm'>בדיקת סנכרון נוכחית</Typography>
                <Typography level='body-xs'>בדיקת הנתונים העדכניים בכל המקומות שבהם נשמרו. קבלה תקינה תיסגר אוטומטית.</Typography>
              </Box>
              {syncAudit ? (
                <Box sx={sx.receiptSyncResult}>
                  <Chip
                    size='sm'
                    variant='soft'
                    color={syncStatus === 'CLEAN' ? 'success' : syncStatus === 'PARTIAL' ? 'warning' : 'danger'}
                  >
                    {syncStatus === 'CLEAN'
                      ? 'מסונכרן'
                      : syncStatus === 'PARTIAL'
                        ? 'בדיקה חלקית'
                        : `${syncFindings.length} ממצאים`}
                  </Chip>
                  <Typography level='body-xs'>
                    {coveredTargets.length ? `נבדקו: ${coveredTargets.map(receiptDetailLabel).join(', ')}` : 'לא דווחו רכיבים שנבדקו'}
                  </Typography>
                </Box>
              ) : null}
              {model.syncCheckError ? (
                <Typography level='body-sm' color='danger'>{model.syncCheckError}</Typography>
              ) : null}
            </Box>

            {model.syncClean ? (
              <Typography level='body-sm' color='success'>הבדיקה הנוכחית תקינה — אין צורך בתיקון.</Typography>
            ) : !model.repairEligibility.allowed ? (
              <Box sx={sx.receiptRepairBlocked}>
                <Typography level='title-sm'>לא ניתן לתקן אוטומטית</Typography>
                <Typography level='body-sm'>{model.repairEligibility.reason}</Typography>
              </Box>
            ) : (
              <>
                <Typography level='body-sm'>
                  התיקון יעדכן את הנתונים הנגזרים לפי הנתונים הראשיים, ואז יבדוק שוב.
                </Typography>
                <Checkbox
                  checked={confirmed}
                  disabled={model.repairing}
                  label='אני מאשר לתקן את הנתונים הקשורים לפעולה'
                  onChange={event => setConfirmed(event.target.checked)}
                />
              </>
            )}

            {model.actionError ? <Typography level='body-sm' color='danger'>{model.actionError}</Typography> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            type='button'
            variant='outlined'
            loading={model.checkingSync}
            disabled={model.repairing}
            startDecorator={iconUi({ id: 'search', size: 'sm' })}
            onClick={() => model.checkReceiptSync().catch(() => {})}
          >
            בדיקת סנכרון
          </Button>
          <Button
            type='button'
            color='warning'
            loading={model.repairing}
            disabled={model.syncClean || model.checkingSync || !model.repairEligibility.allowed || !confirmed}
            onClick={repair}
          >
            תקן נתונים ובדוק שוב
          </Button>
          <Button type='button' variant='outlined' color='neutral' onClick={close}>סגור</Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  )
}

export default function DataOpsReceiptsPage() {
  const model = useWriteActionReceipts({ maxProblemResults: 50 })
  const [maxResults, setMaxResults] = useState(25)
  const [fromDate, setFromDate] = useState('')
  const [actionType, setActionType] = useState('')
  const [retentionDays, setRetentionDays] = useState(90)
  const [cleanupConfirmed, setCleanupConfirmed] = useState(false)
  const [deletedCount, setDeletedCount] = useState(0)
  const problemRows = buildReceiptRows(model.problemReceipts)
  const historyRows = buildReceiptRows(model.historyReceipts)
  const cleanupRows = buildReceiptRows(model.cleanupReceipts)

  const loadHistory = () => {
    const date = fromDate ? new Date(`${fromDate}T00:00:00`) : null
    model.loadHistory({ maxResults, fromDate: date, actionType }).catch(() => {})
  }

  const cleanupBeforeDate = () => {
    const date = new Date()
    date.setDate(date.getDate() - retentionDays)
    return date
  }

  const loadCleanup = () => {
    setCleanupConfirmed(false)
    setDeletedCount(0)
    model.loadCleanupReceipts({ beforeDate: cleanupBeforeDate(), maxResults: 100 }).catch(() => {})
  }

  const deleteCleanup = async () => {
    if (!cleanupConfirmed || !model.cleanupReceipts.length) return
    try {
      const deletedIds = await model.deleteCleanupReceipts({ beforeDate: cleanupBeforeDate() })
      setDeletedCount(deletedIds.length)
      setCleanupConfirmed(false)
    } catch {
      // The hook owns the visible cleanup error.
    }
  }

  return (
    <>
      <Box sx={sx.receiptsPageLayout}>
        <InfoPanel
          title='דורשות טיפול'
          actions={(
            <Stack direction='row' spacing={0.75} sx={sx.resultHeaderActions}>
              <Button
                size='sm'
                variant='outlined'
                disabled={!model.problemReceipts.length}
                startDecorator={iconUi({ id: 'download', size: 'sm' })}
                onClick={() => downloadDataOpsJson({
                  fileName: `players-database-receipt-issues-${new Date().toISOString().slice(0, 10)}.json`,
                  data: {
                    type: 'receipt-issues',
                    count: model.problemReceipts.length,
                    receipts: model.problemReceipts,
                  },
                })}
              >
                ייצוא JSON
              </Button>
              <Button
                size='sm'
                variant='outlined'
                loading={model.refreshing}
                onClick={() => model.reload().catch(() => {})}
              >
                רענון
              </Button>
            </Stack>
          )}
          sx={sx.panel}
        >
          {model.loading ? (
            <Typography sx={sx.receiptsState}>טוען קבלות לא תקינות...</Typography>
          ) : model.error ? (
            <Box sx={sx.receiptsError}>
              <Typography level='body-sm'>{model.error}</Typography>
              <Button size='sm' variant='outlined' onClick={() => model.reload().catch(() => {})}>נסה שוב</Button>
            </Box>
          ) : (
            <ReceiptTable rows={problemRows} model={model} emptyText='אין קבלות הדורשות טיפול.' />
          )}
        </InfoPanel>

        <InfoPanel
          title='ניקוי קבלות ישנות'
          actions={(
            <Box sx={sx.receiptCleanupControls}>
              <Typography level='body-sm' color='neutral'>ישנות יותר מ־</Typography>
              <Select
                size='sm'
                aria-label='גיל הקבלות למחיקה'
                value={retentionDays}
                disabled={model.cleanupLoading || model.cleanupDeleting}
                onChange={(_event, value) => {
                  setRetentionDays(value || 90)
                  setCleanupConfirmed(false)
                }}
              >
                <Option value={30}>30 יום</Option>
                <Option value={90}>90 יום</Option>
                <Option value={180}>180 יום</Option>
                <Option value={365}>שנה</Option>
              </Select>
              <Button
                type='button'
                size='sm'
                variant='outlined'
                loading={model.cleanupLoading}
                onClick={loadCleanup}
              >
                הצג מועמדות
              </Button>
            </Box>
          )}
          sx={sx.receiptsFillPanel}
        >
          <Stack className='dpScrollThin' spacing={1} sx={sx.receiptsFillContent}>
            {model.cleanupError ? <Typography level='body-sm' color='danger'>{model.cleanupError}</Typography> : null}
            {deletedCount ? (
              <Box sx={sx.cleanState}>
                {iconUi({ id: 'check', size: 'md' })}
                <Typography level='body-sm'>{deletedCount} קבלות ישנות נמחקו.</Typography>
              </Box>
            ) : null}

            {cleanupRows.length ? (
              <>
                <ReceiptTable rows={cleanupRows} model={model} emptyText='' />
                <Box sx={sx.cleanupDeletePanel}>
                  <Checkbox
                    checked={cleanupConfirmed}
                    disabled={model.cleanupDeleting}
                    label={`אני מאשר למחוק ${cleanupRows.length} קבלות תקינות ישנות`}
                    onChange={event => setCleanupConfirmed(event.target.checked)}
                  />
                  <Button
                    type='button'
                    color='danger'
                    loading={model.cleanupDeleting}
                    disabled={!cleanupConfirmed}
                    onClick={deleteCleanup}
                  >
                    מחק קבלות
                  </Button>
                </Box>
              </>
            ) : null}
          </Stack>
        </InfoPanel>

        <InfoPanel title='טעינת קבלות אחרונות' sx={sx.panel}>
          <Box sx={sx.receiptHistoryFilters}>
            <FormControl size='sm'>
              <Select
                aria-label='מספר קבלות'
                placeholder='מספר קבלות'
                value={maxResults}
                onChange={(_event, value) => setMaxResults(value || 25)}
              >
                <Option value={10}>10</Option>
                <Option value={25}>25</Option>
                <Option value={50}>50</Option>
              </Select>
            </FormControl>
            <FormControl size='sm'>
              <Input
                type='date'
                aria-label='החל מתאריך'
                value={fromDate}
                onChange={event => setFromDate(event.target.value)}
              />
            </FormControl>
            <FormControl size='sm'>
              <Select
                aria-label='סוג פעולה'
                value={actionType}
                onChange={(_event, value) => setActionType(value || '')}
              >
                <Option value=''>הכול</Option>
                <Option value='leagueLoad'>טעינת ליגה</Option>
                <Option value='rosterLoad'>טעינת סגל</Option>
                <Option value='statsLoad'>טעינת Stats</Option>
                <Option value='statsClear'>מחיקת Stats</Option>
              </Select>
            </FormControl>
            <Button type='button' size='sm' loading={model.historyLoading} onClick={loadHistory}>
              טען קבלות
            </Button>
          </Box>
          {model.historyError ? <Typography level='body-sm' color='danger'>{model.historyError}</Typography> : null}
          {model.historyLoaded ? (
            <ReceiptTable rows={historyRows} model={model} emptyText='לא נמצאו קבלות בהיקף שנבחר.' />
          ) : null}
        </InfoPanel>
      </Box>

      <ReceiptDetailsDialog model={model} />
    </>
  )
}
