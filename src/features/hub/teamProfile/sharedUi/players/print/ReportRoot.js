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

import PdfReport from './pdf/PdfReport.js'
import UrlReport from './url/UrlReport.js'

import { reportSx as sx } from './report.sx.js'

function getMode(model = {}) {
  return model.mode || TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN
}

function getReportType(mode) {
  if (mode === TEAM_PLAYERS_PRINT_MODES.PERFORMANCE) {
    return REPORT_TYPES.PERFORMANCE
  }

  return REPORT_TYPES.INSIGHTS
}

function getMeta(model = {}) {
  return model.meta || {}
}

function getModelValue(model, key, fallback = '') {
  const meta = getMeta(model)

  return model[key] || meta[key] || fallback
}

function getMetaItems(model = {}) {
  if (Array.isArray(model.metaItems)) {
    return model.metaItems
  }

  const meta = getMeta(model)

  return Array.isArray(meta.items) ? meta.items : []
}

function normalizeModel(model = {}) {
  const modeContent = model.modeContent || {}

  return {
    ...model,
    ...modeContent,
    mode: getMode(model),
    title: getModelValue(model, 'title'),
    subtitle: getModelValue(model, 'subtitle'),
    reportDate: getModelValue(model, 'reportDate'),
    metaItems: getMetaItems(model),
    entity: model.entity || {},
  }
}

function hasSectionRows(sections = []) {
  return sections.some(section => {
    return Array.isArray(section.rows) && section.rows.length > 0
  })
}

function hasRows(model = {}) {
  if (Array.isArray(model.rows) && model.rows.length) {
    return true
  }

  return Array.isArray(model.sections)
    ? hasSectionRows(model.sections)
    : false
}

function EmptyRows() {
  return (
    <Sheet variant='outlined' sx={sx.empty}>
      <Typography level='title-md'>
        אין שחקנים להצגה בדוח
      </Typography>

      <Typography level='body-sm'>
        יש לבדוק את נתוני הסגל או את תוכן הדוח.
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
  const mediaMobile = useMediaQuery(theme.breakpoints.down('md'))

  const sourceModel = inputModel || legacyProps
  const model = normalizeModel(sourceModel)
  const resolvedDevice = device || (mediaMobile ? 'mobile' : 'desktop')
  const isMobile = resolvedDevice === 'mobile'

  return (
    <ReportShell
      title={model.title}
      reportDate={model.reportDate}
      reportType={getReportType(model.mode)}
      presentation={presentation}
      isMobile={isMobile}
      status={REPORT_STATUS.ACTIVE}
      entity={model.entity}
      metaItems={model.metaItems}
      metaColumns={4}
      actions={actions}
      reportOptions={reportOptions}
      selectedReportValue={selectedReportValue}
      onReportChange={onReportChange}
    >
      <Typography sx={sx.subtitle}>
        {model.subtitle}
      </Typography>

      {loading ? (
        <UrlReport
          model={model}
          device={resolvedDevice}
          loading
        />
      ) : !hasRows(model) ? (
        <EmptyRows />
      ) : presentation === 'pdf' ? (
        <PdfReport
          model={model}
          device={resolvedDevice}
        />
      ) : presentation === 'url' ? (
        <UrlReport
          model={model}
          device={resolvedDevice}
        />
      ) : (
        <EmptyView />
      )}
    </ReportShell>
  )
}
