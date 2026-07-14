// src/features/reports/dashboard/components/ReportView.js

import Box from '@mui/joy/Box'

import ViewDemoReport from './ViewDemoReport.js'
import ViewHeader from './ViewHeader.js'
import ViewKpiRow from './ViewKpiRow.js'
import ViewUrl from './ViewUrl.js'
import { viewSx as sx } from './sx/view.sx.js'

export default function ReportView({ model }) {
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

          <ViewDemoReport
            report={model.selectedReport}
            publication={model.selectedPublication}
            entity={model.selectedEntity}
          />
        </Box>
      </Box>
    </Box>
  )
}
