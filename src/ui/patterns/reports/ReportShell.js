// ui/patterns/reports/ReportShell.js

import { Box, Divider, Typography } from '@mui/joy'

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
  entity = null,
  showEntity = true,
  metaItems = [],
  metaColumns = 3,
  reportNumber,
  printPages = 1,
  fillPrintPage = false,
  brand = null,
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
    ? buildReportPdfSx({ systemColors, printPages, fillPrintPage })
    : device === 'mobile'
      ? buildReportUrlMobileSx({ systemColors })
      : buildReportUrlDesktopSx({ systemColors })

  const shellEntity = entity
    ? { ...entity, systemColors }
    : null
  const resolvedBrand = {
    name: brand?.name || brandName,
    subtitle: brand?.subtitle || brandSubtitle,
    logoUrl: brand?.logoUrl || '',
    markLogoUrl: brand?.markLogoUrl || '',
    fullLogoUrl: brand?.fullLogoUrl || '',
    mark: brand?.mark || 'DP',
    footerText: brand?.footerText || `${brand?.name || brandName} · ${brand?.subtitle || brandSubtitle}`,
  }
  const headerLogoUrl = resolvedBrand.fullLogoUrl || resolvedBrand.logoUrl
  const footerLogoUrl = resolvedBrand.markLogoUrl || resolvedBrand.logoUrl || resolvedBrand.fullLogoUrl

  return (
    <Box component='article' sx={sx.root}>
      <Box sx={sx.topBar}>
        <Box sx={sx.brand}>
          {headerLogoUrl ? (
            <Box
              component='img'
              src={headerLogoUrl}
              alt={resolvedBrand.name}
              sx={{
                display: 'block',
                width: { xs: 154, md: 230 },
                maxWidth: '46vw',
                height: { xs: 34, md: 48 },
                objectFit: 'contain',
                objectPosition: 'left center',
              }}
            />
          ) : (
            <>
              <Box sx={sx.brandMark}>{resolvedBrand.mark}</Box>

              <Box sx={sx.brandCopy}>
                <Typography component='span' sx={sx.brandName}>
                  {resolvedBrand.name}
                </Typography>

                <Typography component='span' sx={sx.brandSubtitle}>
                  {resolvedBrand.subtitle}
                </Typography>
              </Box>
            </>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
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
        showEntity={showEntity}
        sx={sx}
      />

      <Box
        sx={sx.scrollArea}
        className={isPdf ? undefined : 'dpScrollThin'}
      >
        <ReportMetaGrid
          items={metaItems}
          columns={metaColumns}
          systemColors={systemColors}
          sx={sx}
        />

        <Divider sx={{ my: 1 }} />

        <Box
          component='main'
          sx={sx.content({ typeColors })}
        >
          {children}
        </Box>

        <Box component='footer' sx={sx.footer}>
          <Box sx={sx.footerBrand}>
            {footerLogoUrl ? (
              <Box
                component='img'
                src={footerLogoUrl}
                alt={resolvedBrand.name}
                sx={sx.footerLogo}
              />
            ) : null}

            <Typography component='span' sx={sx.footerText}>
              {resolvedBrand.footerText}
            </Typography>
          </Box>

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
