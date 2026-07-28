// src/features/reports/teamMinutesPlan/renderer/url/UrlReport.js

import React from 'react'
import { Box } from '@mui/joy'
import MinutesPlanContent from '../MinutesPlanContent.js'
import UrlSkeleton from './UrlSkeleton.js'
import { urlSx as sx } from './url.sx.js'

export default function UrlReport({ model, device = 'desktop', loading = false }) {
  if (loading) {
    return <UrlSkeleton device={device} />
  }

  return (
    <Box sx={sx.root({ device })}>
      <MinutesPlanContent
        model={model}
        presentation='url'
        device={device}
      />
    </Box>
  )
}
