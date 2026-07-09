// features/reports/public/PublicReportRenderer.js

import React from 'react'
import { Alert, Typography } from '@mui/joy'

import {
  getReportDefinition,
} from '../reports.registry.js'

export default function PublicReportRenderer({
  reportType,
  payload,
  presentation = 'url',
}) {
  const definition = getReportDefinition(reportType)

  if (!definition) {
    return (
      <Alert color='danger' variant='soft'>
        <Typography level='title-sm'>
          סוג הדוח אינו נתמך
        </Typography>
      </Alert>
    )
  }

  return definition.render(payload, { presentation })
}
