// ui/patterns/reports/ReportShell.js

import { Box, Typography, Divider } from '@mui/joy'

import ReportHeader from './ReportHeader'
import ReportMetaGrid from './ReportMetaGrid'
import {
  REPORT_SYSTEM_COLORS,
  getReportStatusColors,
  getReportTypeColors,
} from './sx/reportColors'
import { buildReportPdfSx } from './sx/report.pdf.sx'
import { buildReportUrlDesktopSx } from './sx/report.urlDesktop.sx'
import { buildReportUrlMobileSx } from './sx/report.urlMobile.sx'

const STATUS_LABELS = {
  active: 'פעיל',
  draft: 'טיוטה',
  archived: 'בארכיון',
}

function getReportDevice(isMobileOverride = null) {
  if (typeof isMobileOverride === 'boolean') {
    return isMobileOverride ? 'mobile' : 'desktop'
  }

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
  reportOptions = [],
  selectedReportValue = null,
  onReportChange = null,
  reportType,
  presentation = 'pdf',
  isMobile = null,
  status = 'draft',
  entity,
  metaItems = [],
  metaColumns = 3,
  reportNumber,
  printPages = 1,
  brandName = 'DevPlan',
  brandSubtitle = 'מערכת ניהול וניתוח מקצועי',
  actions = null,
  children,
}) {
  const isPdf = presentation === 'pdf'
  const device = isPdf ? 'desktop' : getReportDevice(isMobile)
  const systemColors = REPORT_SYSTEM_COLORS
  const typeColors = getReportTypeColors(reportType)
  const statusColors = getReportStatusColors(status)
  const sx = isPdf
    ? buildReportPdfSx({ systemColors, printPages })
    : device === 'mobile'
      ? buildReportUrlMobileSx({ systemColors })
      : buildReportUrlDesktopSx({ systemColors })
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {!isPdf && actions ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {actions}
            </Box>
          ) : null}

          <Box sx={buildStatusSx({ colors: statusColors })}>
            {STATUS_LABELS[status] || status}
          </Box>
        </Box>
      </Box>

      <ReportHeader
        title={title}
        reportDate={reportDate}
        reportOptions={reportOptions}
        selectedReportValue={selectedReportValue}
        onReportChange={onReportChange}
        presentation={presentation}
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
            DevPlan · מערכת ניהול וניתוח מקצועי
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
