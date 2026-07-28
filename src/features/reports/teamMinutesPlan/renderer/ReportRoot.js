// src/features/reports/teamMinutesPlan/renderer/ReportRoot.js

import React from 'react'
import { Sheet, Typography } from '@mui/joy'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import {
  ReportShell,
  REPORT_STATUS,
  REPORT_TYPES,
} from '../../../../ui/patterns/reports/index.js'

import PdfReport from './pdf/PdfReport.js'
import UrlReport from './url/UrlReport.js'
import { reportSx as sx } from './report.sx.js'

function hasSectionRows(sections = []) {
  return sections.some(section => {
    return Array.isArray(section.rows) && section.rows.length > 0
  })
}

function hasRows(model = {}) {
  if (Array.isArray(model.rows) && model.rows.length) return true
  return Array.isArray(model.sections) ? hasSectionRows(model.sections) : false
}

function EmptyRows() {
  return (
    <Sheet variant='outlined' sx={sx.empty}>
      <Typography level='title-md'>אין שחקנים להצגה בדוח</Typography>
      <Typography level='body-sm'>יש לבדוק את נתוני הסגל או את תוכן הדוח.</Typography>
    </Sheet>
  )
}

function EmptyView() {
  return (
    <Sheet variant='outlined' sx={sx.empty}>
      <Typography level='title-md'>אין תצוגה מתאימה</Typography>
    </Sheet>
  )
}

export default function ReportRoot({
  viewModel = null,
  presentation = 'pdf',
  device = '',
  loading = false,
  actions = null,
  reportOptions = [],
  selectedReportValue = null,
  onReportChange = null,
}) {
  const theme = useTheme()
  const mediaMobile = useMediaQuery(theme.breakpoints.down('md'))
  const model = viewModel || {}
  const resolvedDevice = device || (mediaMobile ? 'mobile' : 'desktop')
  const isMobile = resolvedDevice === 'mobile'

  return (
    <ReportShell
      title={model.title || ''}
      reportDate={model.reportDate || ''}
      reportType={REPORT_TYPES.INSIGHTS}
      presentation={presentation}
      isMobile={isMobile}
      status={REPORT_STATUS.ACTIVE}
      entity={model.entity || {}}
      metaItems={Array.isArray(model.metaItems) ? model.metaItems : []}
      metaColumns={4}
      actions={actions}
      reportOptions={reportOptions}
      selectedReportValue={selectedReportValue}
      onReportChange={onReportChange}
    >
      <Typography sx={sx.subtitle}>{model.subtitle || ''}</Typography>

      {loading ? (
        <UrlReport model={model} device={resolvedDevice} loading />
      ) : !hasRows(model) ? (
        <EmptyRows />
      ) : presentation === 'pdf' ? (
        <PdfReport model={model} device={resolvedDevice} />
      ) : presentation === 'url' ? (
        <UrlReport model={model} device={resolvedDevice} />
      ) : (
        <EmptyView />
      )}
    </ReportShell>
  )
}
