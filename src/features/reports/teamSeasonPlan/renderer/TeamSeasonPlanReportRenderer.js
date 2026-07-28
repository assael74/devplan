// src/features/reports/teamSeasonPlan/renderer/TeamSeasonPlanReportRenderer.js

import React from 'react'
import ReportRoot from './ReportRoot.js'

export default function TeamSeasonPlanReportRenderer({
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
