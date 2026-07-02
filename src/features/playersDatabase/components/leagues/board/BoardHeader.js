// src/features/playersDatabase/components/leagues/board/BoardHeader.js

import React from 'react'
import { Box, Button } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { ReportPrintButton } from '../../../../../ui/patterns/reportPrint/index.js'
import FirestoreLoadMapPrintReport from './print/FirestoreLoadMapPrintReport.js'
import { headerSx as sx } from './sx/header.sx.js'

export default function BoardHeader({
  onCreate,
  onScan,
}) {
  return (
    <Box sx={sx.top}>
      <Box sx={sx.controls}>
        <Box sx={sx.primaryActions}>
          <ReportPrintButton
            size="sm"
            variant="soft"
            color="neutral"
            startIcon="print"
            label="הסבר מסך"
            tooltip="הורדת מסמך על הקולקשנים ומסלולי טעינת המסמכים"
            documentTitle="players-database-firestore-load-map"
            renderContent={() => <FirestoreLoadMapPrintReport />}
          />

          <Button
            size="sm"
            color="primary"
            startDecorator={iconUi({ id: 'addLeague', size: 'small' })}
            sx={sx.createButton}
            onClick={onCreate}
          >
            יצירת ליגה
          </Button>
        </Box>

        <Button
          size="sm"
          variant="solid"
          color="primary"
          startDecorator={iconUi({ id: 'search', size: 'small' })}
          sx={sx.scanButton}
          onClick={onScan}
        >
          תצוגת פרופילי סקאוט
        </Button>
      </Box>
    </Box>
  )
}
