// src/features/playersDatabase/components/leagues/board/BoardHeader.js

import React from 'react'
import {
  Box,
  Button,
  Typography,
} from '@mui/joy'

import { headerSx as sx } from './sx/header.sx.js'

export default function BoardHeader({ loading, onReload, onCreate }) {
  return (
    <Box sx={sx.top}>
      <Box>
        <Typography level="title-lg" sx={sx.title}>
          ליגות המאגר
        </Typography>

        <Typography level="body-sm" sx={sx.meta}>
          הליגות נטענות מתוך dbLeagues. טעינת טבלאות
          וצילומים מתבצעת מתוך ליגה קיימת.
        </Typography>
      </Box>

      <Box sx={sx.controls}>
        <Button
          size="sm"
          variant="soft"
          color="neutral"
          loading={loading}
          onClick={onReload}
        >
          רענן
        </Button>

        <Button
          size="sm"
          color="primary"
          onClick={onCreate}
        >
          יצירת ליגה
        </Button>
      </Box>
    </Box>
  )
}
