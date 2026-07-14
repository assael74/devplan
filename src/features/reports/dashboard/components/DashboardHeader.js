// src/features/reports/dashboard/components/DashboardHeader.js

import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'

import { headerSx as sx } from './sx/header.sx.js'

export default function DashboardHeader({ title, subtitle }) {
  return (
    <Box sx={sx.header}>
      <Box sx={sx.headerInfo}>
        <Typography level='h2' sx={sx.headerTitle}>
          {title}
        </Typography>

        <Typography level='body-sm' sx={sx.headerSubtitle}>
          {subtitle}
        </Typography>
      </Box>
    </Box>
  )
}
