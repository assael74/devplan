// src/features/reports/dbSearch/renderer/DbSearchReportRenderer.js

import React from 'react'

import PdfReport from './pdf/PdfReport.js'
import UrlReport from './url/UrlReport.js'

export default function DbSearchReportRenderer({
  viewModel = null,
  presentation = 'url',
  device = 'desktop',
  loading = false,
}) {
  if (presentation === 'pdf') {
    return (
      <PdfReport
        model={viewModel}
        device={device}
      />
    )
  }

  return (
    <UrlReport
      model={viewModel}
      device={device}
      loading={loading}
    />
  )
}
