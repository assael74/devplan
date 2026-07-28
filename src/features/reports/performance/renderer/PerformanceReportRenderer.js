// src/features/reports/performance/renderer/PerformanceReportRenderer.js

import React from 'react'
import ReportRoot from './ReportRoot.js'

export default function PerformanceReportRenderer({ viewModel = null, ...props }) {
  return <ReportRoot {...props} viewModel={viewModel} />
}
