// src/features/reports/teamMinutesPlan/renderer/pdf/PdfReport.js

import React from 'react'
import MinutesPlanContent from '../MinutesPlanContent.js'

export default function PdfReport({ model, device = 'desktop' }) {
  return (
    <MinutesPlanContent
      model={model}
      presentation='pdf'
      device={device}
    />
  )
}
