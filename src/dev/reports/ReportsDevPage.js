// src/dev/reports/ReportsDevPage.js

import { useMemo, useState } from 'react'
import Box from '@mui/joy/Box'
import Chip from '@mui/joy/Chip'
import Typography from '@mui/joy/Typography'

import ReportPrintButton from '../../ui/patterns/reportPrint/ReportPrintButton.js'

import ReportsDevPreview from './components/ReportsDevPreview.js'
import ReportsDevToolbar from './components/ReportsDevToolbar.js'
import {
  DEFAULT_REPORTS_DEV_REPORT,
  getDefaultReportsDevScenario,
  getReportsDevScenarioOptions,
} from './reportsDev.constants.js'
import {
  getReportCatalogItem,
  getReportStatus,
} from './reportsDev.catalog.js'
import { getReportsDevFixture } from './fixtures/reportsDev.fixtures.js'
import { getReportsDevReportDefinition } from './reportsDev.registry.js'
import { sx } from './sx/reportsDev.sx.js'

export default function ReportsDevPage() {
  const [reportId, setReportId] = useState(DEFAULT_REPORTS_DEV_REPORT)
  const [scenario, setScenario] = useState(() => {
    return getDefaultReportsDevScenario(DEFAULT_REPORTS_DEV_REPORT)
  })

  const catalogItem = useMemo(() => {
    return getReportCatalogItem(reportId)
  }, [reportId])

  const reportStatus = useMemo(() => {
    return getReportStatus(catalogItem)
  }, [catalogItem])

  const reportDefinition = useMemo(() => {
    return getReportsDevReportDefinition(reportId)
  }, [reportId])

  const scenarioOptions = useMemo(() => {
    return getReportsDevScenarioOptions(reportId)
  }, [reportId])

  const selectedScenario = useMemo(() => {
    return scenarioOptions.find(option => option.id === scenario) || null
  }, [scenario, scenarioOptions])

  const fixture = useMemo(() => {
    return getReportsDevFixture({ reportId, scenario })
  }, [reportId, scenario])

  const handleReportChange = nextReportId => {
    setReportId(nextReportId)
    setScenario(getDefaultReportsDevScenario(nextReportId))
  }

  const canPrint = Boolean(reportDefinition && catalogItem?.connected)

  return (
    <Box sx={sx.page}>
      <Box component="header" sx={sx.header}>
        <Box sx={sx.headerContent}>
          <Typography level="h3">בדיקות דוחות</Typography>

          <Typography level="body-sm" textColor="text.secondary">
            סביבת בדיקה פנימית לכל הדוחות, התרחישים וההדפסות
          </Typography>
        </Box>

        <Box sx={sx.actions}>
          <Chip variant="soft" color="primary">
            {catalogItem?.label || 'דוח'}
          </Chip>

          <Chip variant="soft" color={reportStatus.color}>
            {reportStatus.label}
          </Chip>

          <Chip variant="soft" color="neutral">
            {selectedScenario?.label || 'תרחיש בדיקה'}
          </Chip>

          <ReportPrintButton
            label="הדפס / PDF"
            variant="solid"
            color="primary"
            disabled={!canPrint}
            documentTitle={
              reportDefinition
                ? reportDefinition.getDocumentTitle(fixture)
                : catalogItem?.label || 'דוח'
            }
          >
            {reportDefinition ? reportDefinition.render(fixture) : null}
          </ReportPrintButton>
        </Box>
      </Box>

      <Box sx={sx.content}>
        <ReportsDevToolbar
          reportId={reportId}
          scenario={scenario}
          scenarioOptions={scenarioOptions}
          selectedScenario={selectedScenario}
          onReportChange={handleReportChange}
          onScenarioChange={setScenario}
        />

        <ReportsDevPreview reportId={reportId} fixture={fixture} />
      </Box>
    </Box>
  )
}
