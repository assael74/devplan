// features/playersDatabase/ui/components/modals/WriteFlowReportModal.js

import * as React from 'react'
import {
  Alert,
  Box,
  Button,
  Sheet,
  Table,
  Typography,
} from '@mui/joy'

import PlayersDatabaseModal from './PlayersDatabaseModal.js'
import { writeFlowReportSx as sx } from './sx/writeFlowReport.sx.js'

const clean = value => String(value || '').trim()

const formatTechnicalReport = report => JSON.stringify(report || {}, null, 2)

export default function WriteFlowReportModal({
  open,
  report,
  onClose,
}) {
  const [copied, setCopied] = React.useState(false)
  const failures = Array.isArray(report?.failures) ? report.failures : []
  const duplicates = Array.isArray(report?.duplicates) ? report.duplicates : []
  const completedStages = Array.isArray(report?.completedStages)
    ? report.completedStages
    : []

  React.useEffect(() => {
    if (open) setCopied(false)
  }, [open])

  const copyReport = async () => {
    const text = formatTechnicalReport(report)

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch (error) {
      console.error('[playersDatabase/write-report-copy]', error)
    }
  }

  return (
    <PlayersDatabaseModal
      open={open}
      title='דוח תהליך כתיבה'
      description='הדוח נשאר פתוח עד לסגירה ידנית'
      iconId='warning'
      size='xl'
      hideFooter
      persistent
      contentSx={sx.content}
      onClose={onClose}
    >
      <Alert color='danger' variant='soft'>
        <Box>
          <Typography level='title-sm'>
            {clean(report?.message) || 'פעולת הכתיבה לא הושלמה במלואה'}
          </Typography>
          <Typography level='body-sm'>
            ניתן לצלם את המסך או להעתיק את פרטי הדוח המלאים.
          </Typography>
        </Box>
      </Alert>

      <Box sx={sx.summary}>
        <Sheet variant='soft' sx={sx.summaryItem}>
          <Typography level='body-xs' sx={sx.label}>תהליך</Typography>
          <Typography level='title-sm'>{clean(report?.flow) || '—'}</Typography>
        </Sheet>
        <Sheet variant='soft' sx={sx.summaryItem}>
          <Typography level='body-xs' sx={sx.label}>שלב שנכשל</Typography>
          <Typography level='title-sm'>{clean(report?.failedStage) || '—'}</Typography>
        </Sheet>
        <Sheet variant='soft' sx={sx.summaryItem}>
          <Typography level='body-xs' sx={sx.label}>כשלים</Typography>
          <Typography level='title-sm'>{failures.length}</Typography>
        </Sheet>
        <Sheet variant='soft' sx={sx.summaryItem}>
          <Typography level='body-xs' sx={sx.label}>כפילויות</Typography>
          <Typography level='title-sm'>{duplicates.length}</Typography>
        </Sheet>
      </Box>

      <Box sx={sx.section}>
        <Typography level='title-sm'>שלבים שהושלמו</Typography>
        <Typography level='body-sm'>
          {completedStages.length ? completedStages.join(' · ') : 'לא הושלם שלב קודם'}
        </Typography>
      </Box>

      {failures.length ? (
        <Box sx={sx.section}>
          <Typography level='title-sm'>פירוט כשלים</Typography>
          <Box className='dpScrollThin' sx={sx.tableWrap}>
            <Table stickyHeader size='sm' hoverRow>
              <thead>
                <tr>
                  <th>שחקן</th>
                  <th>קוד</th>
                  <th>עונה</th>
                  <th>קבוצה</th>
                  <th>סלוט</th>
                  <th>הודעה</th>
                </tr>
              </thead>
              <tbody>
                {failures.map((failure, index) => (
                  <tr key={`${failure.code || 'failure'}-${index}`}>
                    <td>{clean(failure.displayName || failure.playerId) || '—'}</td>
                    <td>{clean(failure.code) || '—'}</td>
                    <td>{clean(failure.seasonId) || '—'}</td>
                    <td>{clean(failure.birthTeamId) || '—'}</td>
                    <td>{failure.birthTeamSlot || '—'}</td>
                    <td>{clean(failure.message) || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Box>
        </Box>
      ) : null}

      {duplicates.length ? (
        <Box sx={sx.section}>
          <Typography level='title-sm'>כפילויות מלאות שנמצאו</Typography>
          <Box className='dpScrollThin' sx={sx.tableWrap}>
            <Table stickyHeader size='sm' hoverRow>
              <thead>
                <tr>
                  <th>Player ID</th>
                  <th>עונה</th>
                  <th>קבוצה</th>
                  <th>סלוט</th>
                  <th>מסמכים</th>
                </tr>
              </thead>
              <tbody>
                {duplicates.map((duplicate, index) => (
                  <tr key={`${duplicate.playerId || 'duplicate'}-${index}`}>
                    <td>{clean(duplicate.playerId) || '—'}</td>
                    <td>{clean(duplicate.seasonId) || '—'}</td>
                    <td>{clean(duplicate.birthTeamId) || '—'}</td>
                    <td>{duplicate.birthTeamSlot || '—'}</td>
                    <td>{(duplicate.documentIds || []).join(', ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Box>
        </Box>
      ) : null}

      <Box sx={sx.section}>
        <Typography level='title-sm'>פרטים טכניים</Typography>
        <Sheet variant='outlined'>
          <Box component='pre' sx={sx.technical}>
            {formatTechnicalReport(report)}
          </Box>
        </Sheet>
      </Box>

      <Box sx={sx.actions}>
        <Button variant='outlined' onClick={copyReport}>
          {copied ? 'הדוח הועתק' : 'העתקת פרטי הדוח'}
        </Button>
        <Button variant='solid' onClick={onClose}>
          סגירת הדוח
        </Button>
      </Box>
    </PlayersDatabaseModal>
  )
}
