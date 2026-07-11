// src/features/hub/teamProfile/sharedUi/players/print/pdf/PdfReport.js

import React from 'react'

import ReportContentRouter from '../ReportContentRouter.js'

export default function PdfReport({ model, device = 'desktop' }) {
  return (
    <ReportContentRouter
      model={model}
      presentation='pdf'
      device={device}
    />
  )
}
