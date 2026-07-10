// src/features/hub/teamProfile/sharedUi/players/print/ReportRoot.js

import React from 'react'
import { Sheet, Typography } from '@mui/joy'

import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import {
  ReportShell,
  REPORT_STATUS,
  REPORT_TYPES,
} from '../../../../../../ui/patterns/reports/index.js'

import {
  TEAM_PLAYERS_PRINT_MODES,
} from '../../../sharedLogic/players/print/index.js'

import {
  ActiveFilters,
} from './ReportParts.js'

import PdfReport from './pdf/PdfReport.js'
import UrlReport from './url/UrlReport.js'

import { reportSx as sx } from './sx/report.sx.js'

function getMode(model = {}) {
  return model.mode || TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN
}

function getType(mode) {
  if (mode === TEAM_PLAYERS_PRINT_MODES.PERFORMANCE) {
    return REPORT_TYPES.PERFORMANCE
  }

  return REPORT_TYPES.INSIGHTS
}

function getMeta(model = {}) {
  return model.meta || {}
}

function getReportTitle(model = {}) {
  const meta = getMeta(model)

  return model.title || meta.title || ''
}

function getReportSubtitle(model = {}) {
  const meta = getMeta(model)

  return model.subtitle || meta.subtitle || ''
}

function getReportDate(model = {}) {
  const meta = getMeta(model)

  return model.reportDate || meta.reportDate || ''
}

function getMetaItems(model = {}) {
  const meta = getMeta(model)

  return Array.isArray(model.metaItems) ? model.metaItems : meta.items || []
}

function getEntity(model = {}) {
  return model.entity || {}
}

function getPrintPages(model = {}) {
  return model.printPages || 1
}

function getColumns(model = {}, mode, presentation, isMobile) {
  const modeContent = model.modeContent || {}
  const baseColumns = Array.isArray(modeContent.columns)
    ? modeContent.columns
    : Array.isArray(model.columns)
      ? model.columns
      : []

  if (presentation === 'url' && isMobile) {
    return baseColumns.filter(column => column.key !== 'level')
  }

  return baseColumns
}

function buildModel(model, mode, presentation, isMobile) {
  const modeContent = model.modeContent || {}
  const columns = getColumns(model, mode, presentation, isMobile)

  return {
    ...model,
    ...modeContent,
    mode,
    title: getReportTitle(model),
    subtitle: getReportSubtitle(model),
    reportDate: getReportDate(model),
    metaItems: getMetaItems(model),
    entity: getEntity(model),
    isSeasonPlan: mode === TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN,
    isMinutesPlan: mode === TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN,
    isPerformance: mode === TEAM_PLAYERS_PRINT_MODES.PERFORMANCE,
    presentation,
    isMobile,
    columns,
  }
}

function hasRowsInSections(sections = []) {
  return sections.some(section => {
    return Array.isArray(section.rows) && section.rows.length > 0
  })
}

function hasRows(model = {}) {
  if (Array.isArray(model.rows) && model.rows.length > 0) {
    return true
  }

  if (Array.isArray(model.sections) && hasRowsInSections(model.sections)) {
    return true
  }

  if (Array.isArray(model.squadGroups) && hasRowsInSections(model.squadGroups)) {
    return true
  }

  return false
}

function EmptyRows() {
  return (
    <Sheet variant='outlined' sx={sx.empty}>
      <Typography level='title-md'>
        אין שחקנים להצגה בדוח
      </Typography>

      <Typography level='body-sm'>
        יש לבדוק את הפילטרים הפעילים או את נתוני הסגל.
      </Typography>
    </Sheet>
  )
}

function EmptyView() {
  return (
    <Sheet variant='outlined' sx={sx.empty}>
      <Typography level='title-md'>
        אין תצוגה מתאימה
      </Typography>
    </Sheet>
  )
}

function getModel(inputModel, legacyProps) {
  if (inputModel) {
    return inputModel
  }

  return legacyProps || {}
}

export default function ReportRoot({
  inputModel = null,
  presentation = 'pdf',
  device = '',
  loading = false,
  actions = null,
  reportOptions = [],
  selectedReportValue = null,
  onReportChange = null,
  ...legacyProps
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const model = getModel(inputModel, legacyProps)
  const mode = getMode(model)
  const contentModel = buildModel(model, mode, presentation, isMobile)
  const reportType = getType(mode)

  return (
    <ReportShell
      title={contentModel.title}
      reportDate={contentModel.reportDate}
      reportType={reportType}
      presentation={presentation}
      isMobile={isMobile}
      status={REPORT_STATUS.ACTIVE}
      printPages={getPrintPages(contentModel)}
      entity={contentModel.entity}
      metaItems={contentModel.metaItems}
      metaColumns={4}
      actions={actions}
      reportOptions={reportOptions}
      selectedReportValue={selectedReportValue}
      onReportChange={onReportChange}
    >
      <Typography sx={sx.subtitle}>
        {contentModel.subtitle}
      </Typography>

      {loading ? (
        <UrlReport
          model={contentModel}
          device={device}
          isMobile={isMobile}
          presentation={presentation}
          loading
        />
      ) : !hasRows(contentModel) ? (
        <EmptyRows />
      ) : presentation === 'pdf' ? (
        <PdfReport model={contentModel} presentation='pdf' />
      ) : presentation === 'url' ? (
        <UrlReport
          model={contentModel}
          device={device}
          presentation='url'
          isMobile={isMobile}
        />
      ) : (
        <EmptyView />
      )}
    </ReportShell>
  )
}
