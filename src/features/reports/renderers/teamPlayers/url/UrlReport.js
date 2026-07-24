// src/features/hub/teamProfile/sharedUi/players/print/url/UrlReport.js

import React from 'react'
import { Box } from '@mui/joy'

import ReportContentRouter from '../ReportContentRouter.js'
import UrlSkeleton from './UrlSkeleton.js'

import { urlSx as sx } from './url.sx.js'

export default function UrlReport({ model, device = 'desktop', loading = false }) {
  if (loading) {
    return (
      <UrlSkeleton
        mode={model.mode}
        device={device}
      />
    )
  }

  return (
    <Box sx={sx.root({ device })}>
      <ReportContentRouter
        model={model}
        presentation='url'
        device={device}
      />
    </Box>
  )
}
