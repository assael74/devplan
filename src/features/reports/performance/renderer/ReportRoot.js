// src/features/reports/performance/renderer/ReportRoot.js

import React from 'react'
import { Sheet, Typography } from '@mui/joy'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import {
  ReportShell,
  REPORT_STATUS,
  REPORT_TYPES,
} from '../../../../ui/patterns/reports/index.js'

import PerformanceContent from './PerformanceContent.js'
import UrlSkeleton from './url/UrlSkeleton.js'
import { reportSx as sx } from './report.sx.js'

function hasRows(model = {}) {
  if (Array.isArray(model.rows) && model.rows.length) return true

  return Array.isArray(model.sections) && model.sections.some(section => {
    return Array.isArray(section.rows) && section.rows.length > 0
  })
}

function EmptyRows() {
  return (
    <Sheet variant='outlined' sx={sx.empty}>
      <Typography level='title-md'>אין שחקנים להצגה בדוח</Typography>
      <Typography level='body-sm'>יש לבדוק את נתוני הביצוע של הסגל.</Typography>
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
      title={model.title}
      reportDate={model.reportDate}
      reportType={REPORT_TYPES.PERFORMANCE}
      presentation={presentation}
      isMobile={isMobile}
      status={REPORT_STATUS.ACTIVE}
      entity={model.entity}
      metaItems={model.metaItems}
      metaColumns={4}
      actions={actions}
      reportOptions={reportOptions}
      selectedReportValue={selectedReportValue}
      onReportChange={onReportChange}
    >
      <Typography sx={sx.subtitle}>{model.subtitle}</Typography>

      {loading ? (
        <UrlSkeleton mode='performance' device={resolvedDevice} />
      ) : !hasRows(model) ? (
        <EmptyRows />
      ) : (
        <PerformanceContent
          model={model}
          presentation={presentation}
          device={resolvedDevice}
        />
      )}
    </ReportShell>
  )
}
