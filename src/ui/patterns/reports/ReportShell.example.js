import { Box, Typography } from '@mui/joy'
import { ReportShell, REPORT_STATUS, REPORT_TYPES } from './index'

export default function ReportShellExample() {
  return (
    <ReportShell
      title='יעדי קבוצה'
      reportDate='27 ביוני 2026'
      reportType={REPORT_TYPES.GOALS}
      status={REPORT_STATUS.ACTIVE}
      reportNumber='DPR-2026-0042'
      entity={{ type: 'team', name: 'נערים ג', avatarUrl: '', subtitle: 'מאמן: שם מאמן · מועדון: מכבי יבנה' }}
      metaItems={[
        { id: 'season', label: 'עונה', value: '2025/2026' },
        { id: 'birthYear', label: 'שנתון', value: '2012' },
        { id: 'league', label: 'ליגה', value: 'נערים ג על' },
      ]}
    >
      <Box sx={{ border: '1px solid var(--report-type-border)', borderRadius: 14, overflow: 'hidden' }}>
        <Box sx={{ px: 1.5, py: 1.25, bgcolor: 'var(--report-type-soft)', borderBottom: '2px solid var(--report-type-accent)' }}>
          <Typography sx={{ color: 'var(--report-type-dark)', fontWeight: 700 }}>כותרת תוכן לדוגמה</Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          <Typography>כאן נכנס התוכן העצמאי של הדוח.</Typography>
        </Box>
      </Box>
    </ReportShell>
  )
}
