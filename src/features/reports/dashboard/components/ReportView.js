// src/features/reports/dashboard/components/ReportView.js

import Box from '@mui/joy/Box'
import CircularProgress from '@mui/joy/CircularProgress'
import Typography from '@mui/joy/Typography'

import ViewDemoReport from './ViewDemoReport.js'
import ViewHeader from './ViewHeader.js'
import ViewKpiRow from './ViewKpiRow.js'
import ViewUrl from './ViewUrl.js'
import { viewSx as sx } from './sx/view.sx.js'

export default function ReportView({ model }) {
  const hasSelectedPublication = Boolean(model.selectedPublicationId)
  const isLoadingPublication =
    hasSelectedPublication &&
    model.loadingSelectedPublication &&
    !model.selectedPublicationDocument

  return (
    <Box sx={sx.main}>
      <Box sx={sx.mainBody} className='dpScrollThin'>
        <Box sx={sx.reportContent}>
          <ViewHeader
            report={model.selectedReport}
            publication={model.selectedPublication}
            entity={model.selectedEntity}
          />

          <ViewKpiRow
            report={model.selectedReport}
            publication={model.selectedPublication}
            reports={model.reports}
          />

          <ViewUrl
            report={model.selectedReport}
            publication={model.selectedPublication}
          />

          {isLoadingPublication ? (
            <Box
              sx={{
                minHeight: 240,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <CircularProgress size='md' />

              <Typography level='body-sm'>
                טוען את תוכן הדוח שפורסם
              </Typography>
            </Box>
          ) : (
            <ViewDemoReport
              report={model.selectedReport}
              publication={model.selectedPublication}
              entity={model.selectedEntity}
            />
          )}
        </Box>
      </Box>
    </Box>
  )
}
