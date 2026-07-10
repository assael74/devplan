// src/features/hub/teamProfile/sharedUi/management/print/pdf/PdfReport.js

import React from 'react'

import {
  ManagementReportContent,
} from '../shared/ManagementReportParts.js'

export default function PdfReport({ model }) {
  return (
    <ManagementReportContent model={model} />
  )
}
