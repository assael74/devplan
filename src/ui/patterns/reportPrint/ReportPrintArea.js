// src/ui/patterns/reportPrint/ReportPrintArea.js

import React from 'react'
import { Box } from '@mui/joy'

import { reportPrintSx as sx } from './reportPrint.sx.js'

export default function ReportPrintArea({
  contentRef,
  children,
}) {
  return (
    <Box sx={sx.hiddenShell}>
      <Box ref={contentRef} className="dpPrintRoot" sx={sx.printContent}>
        {children}
      </Box>
    </Box>
  )
}
