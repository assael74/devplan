// src/features/hub/teamProfile/sharedUi/players/print/ReportRoot.js

import React from 'react'
import { Sheet, Typography } from '@mui/joy'

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

function getMode(model) {
  return model.mode || TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN
}

function getType(mode) {
  if (mode === TEAM_PLAYERS_PRINT_MODES.PERFORMANCE) {
    return REPORT_TYPES.PERFORMANCE
  }

  return REPORT_TYPES.INSIGHTS
}

function buildModel(model, mode) {
  const modeContent = model.modeContent || {}

  return {
    ...model,
    ...modeContent,
    mode,
    isSeasonPlan: mode === TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN,
    isMinutesPlan: mode === TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN,
    isPerformance: mode === TEAM_PLAYERS_PRINT_MODES.PERFORMANCE,
  }
}

function hasRows(model) {
  return Array.isArray(model.rows) && model.rows.length > 0
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
  ...legacyProps
}) {
  const model = getModel(inputModel, legacyProps)
  const mode = getMode(model)
  const contentModel = buildModel(model, mode)
  const reportType = getType(mode)

  return (
    <ReportShell
      title={model.title}
      reportDate={model.reportDate}
      reportType={reportType}
      presentation={presentation}
      status={REPORT_STATUS.ACTIVE}
      printPages={model.printPages || 1}
      entity={model.entity}
      metaItems={model.metaItems}
      metaColumns={4}
    >
      <Typography sx={sx.subtitle}>
        {model.subtitle}
      </Typography>

      <ActiveFilters items={model.activeFilters} />

      {loading ? (
        <UrlReport
          model={contentModel}
          device={device}
          loading
        />
      ) : !hasRows(contentModel) ? (
        <EmptyRows />
      ) : presentation === 'pdf' ? (
        <PdfReport model={contentModel} />
      ) : presentation === 'url' ? (
        <UrlReport
          model={contentModel}
          device={device}
        />
      ) : (
        <EmptyView />
      )}
    </ReportShell>
  )
}
