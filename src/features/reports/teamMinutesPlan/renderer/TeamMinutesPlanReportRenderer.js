// src/features/reports/teamMinutesPlan/renderer/TeamMinutesPlanReportRenderer.js

import React from 'react'
import ReportRoot from './ReportRoot.js'

export default function TeamMinutesPlanReportRenderer({
  viewModel = null,
  ...props
}) {
  return (
    <ReportRoot
      {...props}
      viewModel={viewModel}
    />
  )
}
