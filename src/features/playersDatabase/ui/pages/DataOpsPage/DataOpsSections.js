// src/features/playersDatabase/ui/pages/DataOpsPage/DataOpsSections.js

import { useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Checkbox,
  Divider,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import {
  COLLECTION_ROWS,
  DATABASE_AREAS,
  MAINTENANCE_ACTIONS,
} from './dataOps.mock.js'
import useClubBootstrapAction from './hooks/useClubBootstrapAction.js'
import { buildReceiptDetails, buildReceiptRows } from './logic/receiptRows.logic.js'
import { dataOpsPageSx as sx } from './sx/dataOpsPage.sx.js'

const toneToJoyColor = tone => {
  if (tone === 'danger') return 'danger'
  if (tone === 'warning') return 'warning'
  if (tone === 'success') return 'success'
  if (tone === 'info') return 'primary'
  return 'neutral'
}

export function DataOpsOverview({ onNavigate }) {
  return (
    <Box sx={sx.sectionGrid}>
      <InfoPanel title='תמונת מצב של הדאטה' sx={sx.panel}>
        <Stack spacing={1}>
          {DATABASE_AREAS.map(area => (
            <Box key={area.id} sx={sx.previewListItem}>
              <Typography level='body-sm' fontWeight={800}>{area.label}</Typography>
              <Chip size='sm' variant='soft' color={toneToJoyColor(area.tone)}>
                {area.value}
              </Chip>
            </Box>
          ))}
        </Stack>
      </InfoPanel>

      <InfoPanel title='המשך עבודה מומלץ' sx={sx.panel}>
        <Stack spacing={1.25}>
          <Box sx={sx.previewIntro}>
            {iconUi({ id: 'search', size: 'md' })}
            <Box>
              <Typography level='title-sm'>בדיקת סנכרון לפי ישות</Typography>
              <Typography level='body-sm'>מומלץ להתחיל מהקבוצה שבה נמצאו מרבית הפערים.</Typography>
            </Box>
          </Box>
          <Button
            type='button'
            onClick={() => onNavigate('entity')}
            startDecorator={iconUi({ id: 'teams', size: 'sm' })}
          >
            עבור לבדיקת קבוצה
          </Button>
          <Button
            type='button'
            variant='outlined'
            color='neutral'
            onClick={() => onNavigate('receipts')}
            startDecorator={iconUi({ id: 'report', size: 'sm' })}
          >
            הצג קבלות פתוחות
          </Button>
        </Stack>
      </InfoPanel>
    </Box>
  )
}

export function DataOpsCollection() {
  return (
    <InfoPanel title='בדיקת קולקשיין' sx={sx.panel}>
      <Stack spacing={2}>
        <Box sx={sx.sectionGrid}>
          <Box sx={sx.field}>
            <Typography component='label' htmlFor='data-ops-collection' sx={sx.fieldLabel}>
              קולקשיין
            </Typography>
            <Select id='data-ops-collection' defaultValue='playerSearchIndex'>
              <Option value='playerSearchIndex'>playerSearchIndex</Option>
              <Option value='teamSeasons'>teamSeasons</Option>
              <Option value='clubsDirectory'>clubsDirectory</Option>
            </Select>
          </Box>

          <Box sx={sx.field}>
            <Typography component='label' htmlFor='data-ops-collection-scope' sx={sx.fieldLabel}>
              טווח
            </Typography>
            <Select id='data-ops-collection-scope' defaultValue='all'>
              <Option value='all'>כל המסמכים</Option>
              <Option value='active'>עונה פעילה בלבד</Option>
              <Option value='sample'>מדגם מצומצם</Option>
            </Select>
          </Box>
        </Box>

        <Box sx={sx.collectionStats}>
          {COLLECTION_ROWS.map(row => (
            <Box key={row.label} sx={sx.collectionStat}>
              <Typography level='body-xs'>{row.label}</Typography>
              <Typography level='title-lg'>{row.value}</Typography>
            </Box>
          ))}
        </Box>

        <Divider />

        <Box sx={sx.finding('warning')}>
          <Box sx={sx.findingTop}>
            <Box sx={sx.findingCopy}>
              <Typography level='title-sm'>נמצאו מסמכים הדורשים בדיקה</Typography>
              <Typography sx={sx.findingDetail}>המסך יציג כאן קיבוץ לפי סוג הפער וקישור להקשר העסקי.</Typography>
            </Box>
            <Chip size='sm' color='warning' variant='soft'>6 ממצאים</Chip>
          </Box>
        </Box>

        <Button
          type='button'
          startDecorator={iconUi({ id: 'search', size: 'sm' })}
          sx={{ alignSelf: 'flex-start' }}
        >
          הרץ בדיקת קולקשיין
        </Button>
      </Stack>
    </InfoPanel>
  )
}

function ReceiptDetailsDialog({ model, confirmed, onConfirmedChange }) {
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
    onConfirmedChange(false)
    model.closeReceipt()
  }
  const repair = async () => {
    try {
      await model.repairReceipt()
      onConfirmedChange(false)
    } catch {
      // The hook owns the visible error state.
    }
  }
  const checkSync = async () => {
    try {
      await model.checkReceiptSync()
    } catch {
      // The hook owns the visible error state.
    }
  }

  return (
    <Modal open onClose={model.repairing || model.checkingSync ? undefined : close}>
      <ModalDialog sx={sx.receiptDialog}>
        <ModalClose disabled={model.repairing || model.checkingSync} />
        <DialogTitle>פרטי קבלה</DialogTitle>
        <DialogContent>
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
              <Box>
                <Typography level='body-xs' color='neutral'>תוצאת כתיבה קנונית</Typography>
                <Typography level='body-sm' fontWeight={800}>{details.canonicalOutcome}</Typography>
              </Box>
              <Box>
                <Typography level='body-xs' color='neutral'>כיסוי Audit</Typography>
                <Typography level='body-sm' fontWeight={800}>{details.auditCoverage || '—'}</Typography>
              </Box>
              <Box>
                <Typography level='body-xs' color='neutral'>ממצאים</Typography>
                <Typography level='body-sm' fontWeight={800}>
                  {details.findingsCount === null ? '—' : details.findingsCount}
                </Typography>
              </Box>
            </Box>

            {details.target.length ? (
              <Box sx={sx.receiptDetailList}>
                {details.target.map(([label, value]) => (
                  <Box key={label} sx={sx.receiptDetailRow}>
                    <Typography level='body-xs' color='neutral'>{label}</Typography>
                    <Typography component='code' level='body-xs'>{value}</Typography>
                  </Box>
                ))}
              </Box>
            ) : null}

            <Box>
              <Typography level='body-xs' color='neutral'>שלבים שהושלמו</Typography>
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
                <Typography level='body-xs' color='neutral'>
                  קריאה טרייה של מקור האמת ובדיקת כל התוצרים השייכים לקבלה.
                </Typography>
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
                    {coveredTargets.length
                      ? `נבדקו: ${coveredTargets.join(', ')}`
                      : 'לא דווחו רכיבים שנבדקו'}
                  </Typography>
                </Box>
              ) : null}
              {model.syncCheckError ? (
                <Box sx={sx.receiptsError}>
                  <Typography level='title-sm'>בדיקת הסנכרון נכשלה</Typography>
                  <Typography level='body-sm'>{model.syncCheckError}</Typography>
                </Box>
              ) : null}
            </Box>

            {!model.repairEligibility.allowed ? (
              <Box sx={sx.receiptRepairBlocked}>
                <Typography level='title-sm'>לא ניתן לתקן את הקבלה אוטומטית</Typography>
                <Typography level='body-sm'>{model.repairEligibility.reason}</Typography>
              </Box>
            ) : (
              <>
                <Typography level='body-sm'>
                  התיקון יקרא מקורות קנוניים טריים, יבנה מחדש את התוצרים בלבד,
                  יריץ Audit ויעדכן את אותה קבלה.
                </Typography>
                <Checkbox
                  checked={confirmed}
                  disabled={model.repairing}
                  label='אני מאשר לתקן את התוצרים של קבלה זו'
                  onChange={event => onConfirmedChange(event.target.checked)}
                />
              </>
            )}

            {model.actionError ? (
              <Box sx={sx.receiptsError}>
                <Typography level='title-sm'>תיקון הקבלה נכשל</Typography>
                <Typography level='body-sm'>{model.actionError}</Typography>
              </Box>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            type='button'
            variant='outlined'
            color='primary'
            loading={model.checkingSync}
            disabled={model.repairing}
            startDecorator={iconUi({ id: 'search', size: 'sm' })}
            onClick={checkSync}
          >
            בדיקת סנכרון
          </Button>
          <Button
            type='button'
            color='warning'
            loading={model.repairing}
            disabled={model.checkingSync || !model.repairEligibility.allowed || !confirmed}
            onClick={repair}
          >
            תקן תוצרים והריץ בדיקה
          </Button>
          <Button
            type='button'
            variant='outlined'
            color='neutral'
            disabled={model.repairing || model.checkingSync}
            onClick={close}
          >
            סגור
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  )
}

export function DataOpsReceipts({ model }) {
  const rows = buildReceiptRows(model.receipts)
  const [confirmed, setConfirmed] = useState(false)

  const openReceipt = receiptId => {
    setConfirmed(false)
    model.openReceipt(receiptId).catch(() => {})
  }

  return (
    <>
      <InfoPanel
        title='תיקון קבלות'
        actions={(
          <Button
            type='button'
            size='sm'
            variant='outlined'
            color='neutral'
            loading={model.refreshing}
            disabled={model.loading}
            startDecorator={iconUi({ id: 'reset', size: 'sm' })}
            onClick={() => model.reload().catch(() => {})}
          >
            רענון
          </Button>
        )}
        sx={sx.panel}
      >
      {model.actionError && !model.selectedReceipt ? (
        <Box sx={sx.receiptsError}>
          <Typography level='title-sm'>טעינת פרטי הקבלה נכשלה</Typography>
          <Typography level='body-sm'>{model.actionError}</Typography>
        </Box>
      ) : null}
      {model.loading ? (
        <Typography sx={sx.receiptsState}>טוען קבלות ביצוע...</Typography>
      ) : model.error ? (
        <Box sx={sx.receiptsError}>
          <Typography level='title-sm'>טעינת הקבלות נכשלה</Typography>
          <Typography level='body-sm'>{model.error}</Typography>
          <Button
            type='button'
            size='sm'
            variant='outlined'
            color='danger'
            onClick={() => model.reload().catch(() => {})}
          >
            נסה שוב
          </Button>
        </Box>
      ) : rows.length === 0 ? (
        <Typography sx={sx.receiptsState}>עדיין לא נוצרו קבלות ביצוע.</Typography>
      ) : (
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
                      loading={model.detailsLoading}
                      onClick={() => openReceipt(row.id)}
                    >
                      הצג פרטים
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Box>
      )}
      </InfoPanel>
      <ReceiptDetailsDialog
        model={model}
        confirmed={confirmed}
        onConfirmedChange={setConfirmed}
      />
    </>
  )
}

function ClubBootstrapDialog({
  open,
  confirmed,
  running,
  error,
  onConfirmedChange,
  onClose,
  onRun,
}) {
  return (
    <Modal open={open} onClose={running ? undefined : onClose}>
      <ModalDialog sx={sx.bootstrapDialog}>
        <ModalClose disabled={running} />
        <DialogTitle>יצירת מועדונים מחדש</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            <Typography level='body-sm'>
              הפעולה תקרא את הקטלוג הפנימי ותיצור את מסמכי המועדונים ואת ספריית המועדונים.
            </Typography>

            <Box component='ul' sx={sx.bootstrapTargets}>
              <Typography component='li' level='body-sm'>dbClubs/{'{clubId}'}</Typography>
              <Typography component='li' level='body-sm'>dbClubsDirectory/all</Typography>
              <Typography component='li' level='body-sm'>קבלת clubsBootstrap בתוך dbWriteActions</Typography>
            </Box>

            <Typography level='body-xs' color='neutral'>
              הפעולה מיועדת למסד ריק. אם קיים מידע שונה מהקטלוג, הכתיבה תיעצר.
            </Typography>

            <Checkbox
              checked={confirmed}
              disabled={running}
              label='בדקתי שהקולקשנים ריקים ואני מאשר את יצירת המועדונים'
              onChange={event => onConfirmedChange(event.target.checked)}
            />

            {error ? (
              <Box sx={sx.receiptsError}>
                <Typography level='title-sm'>הפעולה נכשלה</Typography>
                <Typography level='body-sm'>{error}</Typography>
              </Box>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            type='button'
            loading={running}
            disabled={!confirmed}
            startDecorator={iconUi({ id: 'clubs', size: 'sm' })}
            onClick={onRun}
          >
            צור מועדונים מחדש
          </Button>
          <Button
            type='button'
            variant='outlined'
            color='neutral'
            disabled={running}
            onClick={onClose}
          >
            ביטול
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  )
}

export function DataOpsMaintenance({ onNavigate, onCompleted }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const bootstrap = useClubBootstrapAction()

  const closeDialog = () => {
    if (bootstrap.running) return
    setDialogOpen(false)
    setConfirmed(false)
    bootstrap.clearError()
  }

  const runBootstrap = async () => {
    try {
      await bootstrap.run()
      setDialogOpen(false)
      setConfirmed(false)
    } catch {
      // The hook owns the visible error and snackbar state.
    }

    if (typeof onCompleted === 'function') {
      await onCompleted().catch(() => {})
    }
  }

  return (
    <>
      <Box sx={sx.maintenanceNotice}>
        {iconUi({ id: 'warning', size: 'md' })}
        <Box>
          <Typography level='title-sm'>פעולות כתיבה מופרדות מבדיקות</Typography>
          <Typography level='body-sm'>כל פעולה תציג תכנון השפעה, תדרוש אישור מפורש ותייצר קבלת ביצוע.</Typography>
        </Box>
      </Box>

      <Box sx={sx.sectionGrid}>
        {MAINTENANCE_ACTIONS.map(action => (
          <Box key={action.id} sx={sx.operationCard(action.tone)}>
            <Box sx={sx.findingCopy}>
              <Box sx={sx.operationIcon(action.tone)}>
                {iconUi({ id: action.iconId, size: 'md' })}
              </Box>
              <Typography level='title-md'>{action.title}</Typography>
              <Typography level='body-sm'>{action.description}</Typography>
            </Box>
            <Button
              type='button'
              size='sm'
              variant='outlined'
              color={toneToJoyColor(action.tone)}
              disabled={action.id === 'cleanup'}
              onClick={action.id === 'clubsBootstrap'
                ? () => setDialogOpen(true)
                : undefined}
              sx={{ justifySelf: 'start' }}
            >
              {action.id === 'clubsBootstrap' ? 'יצירת מועדונים מחדש' : 'פתח תכנון פעולה'}
            </Button>

            {action.id === 'clubsBootstrap' && bootstrap.result ? (
              <Box sx={sx.bootstrapResult}>
                <Chip size='sm' color='success' variant='soft'>
                  {bootstrap.result.writeResult.written ? 'האתחול הושלם' : 'כבר מאותחל'}
                </Chip>
                <Typography level='body-xs'>
                  נוצרה קבלה {bootstrap.result.receiptId}
                </Typography>
                <Button
                  type='button'
                  size='sm'
                  variant='plain'
                  onClick={() => onNavigate('receipts')}
                >
                  הצג קבלה
                </Button>
              </Box>
            ) : null}
          </Box>
        ))}
      </Box>

      <ClubBootstrapDialog
        open={dialogOpen}
        confirmed={confirmed}
        running={bootstrap.running}
        error={bootstrap.error}
        onConfirmedChange={setConfirmed}
        onClose={closeDialog}
        onRun={runBootstrap}
      />
    </>
  )
}
