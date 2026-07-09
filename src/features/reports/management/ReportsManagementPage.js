// src/features/reports/management/ReportsManagementPage.js

import { useMemo, useState } from 'react'
import Box from '@mui/joy/Box'
import Chip from '@mui/joy/Chip'
import Typography from '@mui/joy/Typography'

import ReportPrintButton from '../../../ui/patterns/reportPrint/ReportPrintButton.js'

import ReportsManagementPreview from './components/ReportsManagementPreview.js'
import ReportsManagementToolbar from './components/ReportsManagementToolbar.js'
import {
  DEFAULT_REPORTS_MANAGEMENT_REPORT,
  getDefaultReportsManagementScenario,
  getReportsManagementScenarioOptions,
} from './reportsManagement.constants.js'
import {
  getReportCatalogItem,
  getReportStatus,
} from './reportsManagement.catalog.js'
import { getReportsManagementFixture } from './fixtures/reportsManagement.fixtures.js'
import { getReportsManagementReportDefinition } from './reportsManagement.registry.js'
import { pageSx as sx } from './sx/index.js'

export default function ReportsManagementPage() {
  const [reportId, setReportId] = useState(DEFAULT_REPORTS_MANAGEMENT_REPORT)
  const [scenario, setScenario] = useState(() => {
    return getDefaultReportsManagementScenario(DEFAULT_REPORTS_MANAGEMENT_REPORT)
  })

  const catalogItem = useMemo(() => {
    return getReportCatalogItem(reportId)
  }, [reportId])

  const reportStatus = useMemo(() => {
    return getReportStatus(catalogItem)
  }, [catalogItem])

  const reportDefinition = useMemo(() => {
    return getReportsManagementReportDefinition(reportId)
  }, [reportId])

  const scenarioOptions = useMemo(() => {
    return getReportsManagementScenarioOptions(reportId)
  }, [reportId])

  const selectedScenario = useMemo(() => {
    return scenarioOptions.find(option => option.id === scenario) || null
  }, [scenario, scenarioOptions])

  const fixture = useMemo(() => {
    return getReportsManagementFixture({ reportId, scenario })
  }, [reportId, scenario])

  const handleReportChange = nextReportId => {
    setReportId(nextReportId)
    setScenario(getDefaultReportsManagementScenario(nextReportId))
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
        <ReportsManagementToolbar
          reportId={reportId}
          scenario={scenario}
          scenarioOptions={scenarioOptions}
          selectedScenario={selectedScenario}
          onReportChange={handleReportChange}
          onScenarioChange={setScenario}
        />

        <ReportsManagementPreview reportId={reportId} fixture={fixture} />
      </Box>
    </Box>
  )
}
