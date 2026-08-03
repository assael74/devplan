// src/features/reports/dbSearch/renderer/pdf/PdfReport.js

import React from 'react'

import ReportRoot from '../ReportRoot.js'

export default function PdfReport({
  model = null,
  device = 'desktop',
  reportOptions = [],
  selectedReportValue = null,
  onReportChange = null,
}) {
  return (
    <ReportRoot
      model={model}
      presentation='pdf'
      device={device}
      reportOptions={reportOptions}
      selectedReportValue={selectedReportValue}
      onReportChange={onReportChange}
    />
  )
}
