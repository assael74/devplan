// src/features/reports/renderers/PlayerTargetsReportRenderer.js

import React from 'react'

import PlayerTargetsPrintView from './PlayerTargetsPrintView.js'

export default function PlayerTargetsReportRenderer({
  payload = null,
  inputModel = null,
  viewModel = null,
  ...props
}) {
  return (
    <PlayerTargetsPrintView
      {...props}
      inputModel={inputModel || payload}
      viewModel={viewModel}
    />
  )
}
