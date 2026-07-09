import { Box, Typography, Divider } from '@mui/joy'

import ReportHeader from './ReportHeader'
import ReportMetaGrid from './ReportMetaGrid'
import {
  REPORT_SYSTEM_COLORS,
  getReportStatusColors,
  getReportTypeColors,
} from './reportColors'
import { buildReportPdfSx } from './report.pdf.sx'
import { buildReportUrlDesktopSx } from './report.urlDesktop.sx'
import { buildReportUrlMobileSx } from './report.urlMobile.sx'

const STATUS_LABELS = {
  active: 'פעיל',
  draft: 'טיוטה',
  archived: 'בארכיון',
}

function getReportDevice() {
  if (typeof window === 'undefined') {
    return 'desktop'
  }

  return window.matchMedia('(max-width: 820px)').matches
    ? 'mobile'
    : 'desktop'
}

function buildStatusSx({ colors }) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.875,
    px: 1.25,
    py: 0.75,
    bgcolor: colors.softBg,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    '&::before': {
      content: '""',
      width: 7,
      height: 7,
      bgcolor: colors.solid,
      borderRadius: '50%',
    },
  }
}

export default function ReportShell({
  title,
  reportDate,
  reportType,
  presentation = 'pdf',
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
  const isPdf = presentation === 'pdf'
  const device = isPdf ? 'desktop' : getReportDevice()
  const systemColors = REPORT_SYSTEM_COLORS
  const typeColors = getReportTypeColors(reportType)
  const statusColors = getReportStatusColors(status)
  const sx = isPdf
    ? buildReportPdfSx({
        systemColors,
        printPages,
      })
    : device === 'mobile'
      ? buildReportUrlMobileSx({
          systemColors,
        })
      : buildReportUrlDesktopSx({
          systemColors,
        })
  const shellEntity = { ...entity, systemColors }

  return (
    <Box component='article' sx={sx.root}>
      <Box sx={sx.topBar}>
        <Box sx={sx.brand}>
          <Box sx={sx.brandMark}>DP</Box>
          <Box sx={sx.brandCopy}>
            <Typography component='span' sx={sx.brandName}>
              {brandName}
            </Typography>
            <Typography component='span' sx={sx.brandSubtitle}>
              {brandSubtitle}
            </Typography>
          </Box>
        </Box>

        <Box sx={buildStatusSx({ colors: statusColors })}>
          {STATUS_LABELS[status] || status}
        </Box>
      </Box>

      <ReportHeader
        title={title}
        reportDate={reportDate}
        entity={shellEntity}
        sx={sx}
      />

      <Box sx={sx.scrollArea} className={isPdf ? undefined : 'dpScrollThin'}>
        <ReportMetaGrid
          items={metaItems}
          columns={metaColumns}
          systemColors={systemColors}
          sx={sx}
        />

        <Divider sx={{ my: 1 }} />

        <Box component='main' sx={sx.content({ typeColors })}>
          {children}
        </Box>

        <Box component='footer' sx={sx.footer}>
          <Typography component='span'>
            DevPlan · מערכת ניהול ופיתוח מקצועי
          </Typography>

          {reportNumber ? (
            <Typography component='span'>
              מספר דוח: {reportNumber}
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Box>
  )
}
