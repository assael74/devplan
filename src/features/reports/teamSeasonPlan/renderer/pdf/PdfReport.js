// src/features/reports/teamSeasonPlan/renderer/pdf/PdfReport.js

import React from 'react'
import SeasonPlanContent from '../SeasonPlanContent.js'

export default function PdfReport({ model, device = 'desktop' }) {
  return (
    <SeasonPlanContent
      model={model}
      presentation='pdf'
      device={device}
    />
  )
}
