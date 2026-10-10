// src/features/playersDatabase/ui/pages/DataOpsPage/DataOpsPage.js

import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  Tooltip,
  Typography,
} from '@mui/joy'
import { Link, useLocation } from 'react-router-dom'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import focusedSyncAuditVisual from '../../../../../ui/core/images/focusedSyncAudit.png'
import receiptMaintenanceVisual from '../../../../../ui/core/images/receiptMaintenance.png'
import systemAuditVisual from '../../../../../ui/core/images/systemAudit.png'
import { CollapseBox } from '../../../../../ui/patterns/collapseBox/index.js'
import { PLAYERS_DATABASE_UI_ROUTES } from '../../logic/routeBuilders.js'
import useCollectionInventory from './hooks/useCollectionInventory.js'
import { readSystemAuditSnapshot } from './logic/systemAuditSnapshot.logic.js'
import { dataOpsPageSx as sx } from './sx/dataOpsPage.sx.js'

const formatSnapshotTime = value => {
  const date = value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return 'מועד לא ידוע'
  return new Intl.DateTimeFormat('he-IL', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

const formatDelta = value => {
  if (value === null) return 'ספירה ראשונה'
  if (value === 0) return 'ללא שינוי'
  return value > 0 ? `+${value}` : String(value)
}

function InventoryColumns() {
  return (
    <colgroup>
      <col style={{ width: '28%' }} />
      <col style={{ width: '32%' }} />
      <col style={{ width: '18%' }} />
      <col style={{ width: '22%' }} />
    </colgroup>
  )
}

function ActionCard({
  visualSrc,
  visualSize = 54,
  title,
  description,
  meta,
  tone = 'info',
  actionLabel,
  to,
  routeState,
}) {
  return (
    <Box component={Link} to={to} state={routeState} sx={sx.homeActionCard(tone)}>
      <Box sx={sx.homeActionHeader}>
        <Box sx={sx.homeActionVisual(visualSize)}>
          <Box
            component='img'
            src={visualSrc}
            alt=''
            aria-hidden='true'
            sx={sx.homeActionImage}
          />
        </Box>
        <Typography level='title-lg'>{title}</Typography>
      </Box>
      <Box sx={sx.homeActionCopy}>
        <Typography level='body-sm'>{description}</Typography>
      </Box>
      <Box sx={sx.homeActionFooter}>
        <Chip size='sm' variant='soft' color={tone === 'warning' ? 'warning' : 'neutral'}>
          {meta}
        </Chip>
        <Button component='span' tabIndex={-1} size='sm'>{actionLabel}</Button>
      </Box>
    </Box>
  )
}

export default function DataOpsPage() {
  const location = useLocation()
  const inventory = useCollectionInventory()
  const [inventoryOpen, setInventoryOpen] = useState(true)
  const largestCollections = useMemo(() => {
    const collections = inventory.inventory && Array.isArray(inventory.inventory.collections)
      ? inventory.inventory.collections
      : []
    return [...collections]
      .sort((left, right) => right.count - left.count)
      .slice(0, 4)
  }, [inventory.inventory])
  const snapshot = useMemo(() => (
    typeof window === 'undefined' ? null : readSystemAuditSnapshot(window.localStorage)
  ), [])

  return (
    <Stack spacing={1.5}>
        <CollapseBox
          open={inventoryOpen}
          disableHover
          onToggle={() => setInventoryOpen(value => !value)}
          headerLeft={(
            <Box sx={sx.inventoryCollapseHeader}>
              <Typography level='title-lg' sx={sx.inventoryCollapseTitle}>מצב המאגר</Typography>
              {!inventoryOpen ? (
                <Box sx={sx.inventorySummaryChips}>
                  {largestCollections.length ? largestCollections.map(item => (
                    <Chip key={item.id} size='sm' variant='soft' color='neutral'>
                      {item.label}: {item.count.toLocaleString('he-IL')}
                    </Chip>
                  )) : (
                    <Chip size='sm' variant='soft' color={inventory.error ? 'danger' : 'neutral'}>
                      {inventory.error ? 'הספירה אינה זמינה' : 'טוען כמויות...'}
                    </Chip>
                  )}
                </Box>
              ) : null}
            </Box>
          )}
          rootSx={sx.inventoryCollapseRoot}
          headerSx={sx.inventoryCollapseToggle}
          contentSx={sx.inventoryCollapseContent}
          innerSx={inventoryOpen
            ? sx.inventoryCollapseInner
            : sx.inventoryCollapseInnerClosed}
        >
          {inventory.loading ? (
            <Box role='status' sx={sx.inventoryLoading}>
              <CircularProgress size='sm' />
              <Typography level='body-sm'>בודק את כמויות המסמכים...</Typography>
            </Box>
          ) : inventory.error ? (
            <Box sx={sx.receiptsError}>
              <Typography level='body-sm'>{inventory.error}</Typography>
              <Button size='sm' variant='outlined' onClick={() => inventory.reload().catch(() => {})}>
                נסה שוב
              </Button>
            </Box>
          ) : (
            <>
              <Box sx={sx.inventoryMeta}>
                <Typography level='body-sm'>כמות מסמכים נוכחית לפי קולקשיין</Typography>
                <Box sx={sx.inventoryMetaStatus}>
                  <Typography level='body-xs'>עודכן: {formatSnapshotTime(inventory.inventory.checkedAt)}</Typography>
                  <Tooltip title='רענן כמויות'>
                    <IconButton
                      type='button'
                      size='sm'
                      variant='outlined'
                      color='primary'
                      aria-label='רענן כמויות'
                      disabled={inventory.refreshing}
                      sx={sx.inventoryRefreshButton}
                      onClick={() => inventory.reload().catch(() => {})}
                    >
                      {inventory.refreshing
                        ? <CircularProgress size='sm' />
                        : iconUi({ id: 'reset', size: 'sm' })}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={sx.inventoryTableShell}>
                <Box sx={sx.inventoryTableHeaderWrap}>
                  <Table size='sm' sx={sx.inventoryTableHeader}>
                    <InventoryColumns />
                    <thead>
                      <tr>
                        <th>אזור מידע</th>
                        <th>קולקשיין</th>
                        <th>מסמכים</th>
                        <th>מהספירה הקודמת</th>
                      </tr>
                    </thead>
                  </Table>
                </Box>
                <Box className='dpScrollThin' sx={sx.inventoryTableBodyWrap}>
                  <Table size='sm' sx={sx.inventoryTableBody}>
                    <InventoryColumns />
                    <tbody>
                      {inventory.inventory.collections.map(item => (
                        <tr key={item.id}>
                          <td><Typography level='body-sm' fontWeight={700}>{item.label}</Typography></td>
                          <td><Typography component='code' level='body-xs'>{item.collectionName}</Typography></td>
                          <td><Typography level='body-sm' fontWeight={800}>{item.count.toLocaleString('he-IL')}</Typography></td>
                          <td>
                            <Chip
                              size='sm'
                              variant='soft'
                              color={item.delta === 0 ? 'neutral' : item.delta === null ? 'primary' : 'warning'}
                            >
                              {formatDelta(item.delta)}
                            </Chip>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Box>
              </Box>
              <Typography level='body-xs' color='neutral' sx={{ mt: 1 }}>
                הספירה אינה קוראת את תוכן המסמכים. סריקת קשרים מתבצעת רק במסלול הניקיון.
              </Typography>
            </>
          )}
        </CollapseBox>

        <Box sx={sx.homeActionGrid}>
          <ActionCard
            visualSrc={focusedSyncAuditVisual}
            title='בדיקת סנכרון ממוקדת'
            description='בדוק את הסנכרון של ליגה, קבוצה או שחקן מול כל המסמכים הקשורים.'
            meta='חקירה נקודתית'
            actionLabel='בחר מה לבדוק'
            to={PLAYERS_DATABASE_UI_ROUTES.dataOpsAudit()}
            routeState={location.state}
          />
          <ActionCard
            visualSrc={systemAuditVisual}
            visualSize={46}
            title='בדיקת תקינות כוללת'
            description='בדוק את כל הנתונים, אתר מסמכים מיותרים ובעיות שדורשות טיפול.'
            meta={snapshot
              ? `${snapshot.findingsCount} ממצאים בבדיקה האחרונה`
              : 'טרם בוצעה בדיקה'}
            tone='warning'
            actionLabel='פתח בדיקה'
            to={PLAYERS_DATABASE_UI_ROUTES.dataOpsSystemAudit}
            routeState={location.state}
          />
          <ActionCard
            visualSrc={receiptMaintenanceVisual}
            title='תחזוקת קבלות'
            description='צפה בקבלות בעייתיות ונקה קבלות תקינות ישנות לפי גיל.'
            meta='ניקוי לפי גיל'
            actionLabel='פתח תחזוקה'
            to={PLAYERS_DATABASE_UI_ROUTES.dataOpsReceipts}
            routeState={location.state}
          />
        </Box>
    </Stack>
  )
}
