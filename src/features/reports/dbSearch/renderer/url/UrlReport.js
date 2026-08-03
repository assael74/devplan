// src/features/reports/dbSearch/renderer/url/UrlReport.js

import React from 'react'
import { Box, CircularProgress } from '@mui/joy'

import ReportRoot from '../ReportRoot.js'
import { urlSx as sx } from './url.sx.js'

export default function UrlReport({
  model = null,
  device = 'desktop',
  loading = false,
  actions = null,
  reportOptions = [],
  selectedReportValue = null,
  onReportChange = null,
}) {
  if (loading) {
    return (
      <Box sx={sx.loading}>
        <CircularProgress size='lg' />
      </Box>
    )
  }

  return (
    <Box sx={sx.root({ device })}>
      <ReportRoot
        model={model}
        presentation='url'
        device={device}
        actions={actions}
        reportOptions={reportOptions}
        selectedReportValue={selectedReportValue}
        onReportChange={onReportChange}
      />
    </Box>
  )
}
