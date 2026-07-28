// src/features/reports/renderers/ManagementTargetsReportRenderer.js

import React from 'react'

import ManagementReportRoot from './ReportRoot.js'

export default function ManagementTargetsReportRenderer({
  payload = null,
  inputModel = null,
  viewModel = null,
  ...props
}) {
  return (
    <ManagementReportRoot
      {...props}
      inputModel={inputModel || payload}
      viewModel={viewModel}
    />
  )
}
