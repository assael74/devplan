import { Box, Typography, Divider } from '@mui/joy'
import ReportHeader from './ReportHeader'
import ReportMetaGrid from './ReportMetaGrid'
import { REPORT_SYSTEM_COLORS, getReportStatusColors, getReportTypeColors } from './reportColors'
import { shellSx, statusSx } from './report.sx'

const STATUS_LABELS = {
  active: 'פעיל',
  draft: 'טיוטה',
  archived: 'בארכיון',
}

export default function ReportShell({
  title,
  reportDate,
  reportType,
  status = 'draft',
  entity,
  metaItems = [],
  metaColumns = 3,
  reportNumber,
  printPages = 1,
  brandName = 'DevPlan',
  brandSubtitle = 'מערכת ניהול ופיתוח מקצועי',
  children,
}) {
  const systemColors = REPORT_SYSTEM_COLORS
  const typeColors = getReportTypeColors(reportType)
  const statusColors = getReportStatusColors(status)
  const sx = shellSx({ systemColors, printPages })
  const shellEntity = { ...entity, systemColors }

  return (
    <Box component='article' sx={sx.root}>
      <Box sx={sx.topBar}>
        <Box sx={sx.brand}>
          <Box sx={sx.brandMark}>DP</Box>
          <Box sx={sx.brandCopy}>
            <Typography component='span' sx={sx.brandName}>{brandName}</Typography>
            <Typography component='span' sx={sx.brandSubtitle}>{brandSubtitle}</Typography>
          </Box>
        </Box>
        <Box sx={statusSx({ colors: statusColors })}>{STATUS_LABELS[status] || status}</Box>
      </Box>

      <ReportHeader title={title} reportDate={reportDate} entity={shellEntity} />
      <ReportMetaGrid items={metaItems} columns={metaColumns} systemColors={systemColors} />

      <Divider sx={{ my: 1 }} />

      <Box component='main' sx={sx.content({ typeColors })}>{children}</Box>

      <Box component='footer' sx={sx.footer}>
        <Typography component='span'>DevPlan · מערכת ניהול ופיתוח מקצועי</Typography>
        {reportNumber ? <Typography component='span'>מספר דוח: {reportNumber}</Typography> : null}
      </Box>
    </Box>
  )
}
