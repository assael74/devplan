// src/features/hub/teamProfile/sharedUi/players/print/TeamPlayersPrintReport.js

import React, { useMemo } from 'react'
import { Sheet, Typography } from '@mui/joy'

import {
  ReportShell,
  REPORT_STATUS,
  REPORT_TYPES,
} from '../../../../../../ui/patterns/reports/index.js'

import {
  buildTeamPlayersReportModel,
} from '../../../sharedLogic/players/print/index.js'

import {
  ActiveFilters,
} from './PlayersPrintShared.js'
import SeasonPlanPrintContent from './SeasonPlanPrintContent.js'
import MinutesPlanPrintContent from './MinutesPlanPrintContent.js'
import PerformancePrintContent from './PerformancePrintContent.js'
import { reportSx as sx } from './sx/report.sx.js'

function ReportContent({ model }) {
  if (model.isSeasonPlan) {
    return <SeasonPlanPrintContent model={model} />
  }

  if (model.isMinutesPlan) {
    return <MinutesPlanPrintContent model={model} />
  }

  if (model.isPerformance) {
    return <PerformancePrintContent model={model} />
  }

  return null
}

export default function TeamPlayersPrintReport({
  team,
  rows = [],
  filters,
  summary,
  seasonLabel = '',
  mode,
  reportDate,
}) {
  const model = useMemo(() => {
    return buildTeamPlayersReportModel({
      team,
      rows,
      filters,
      summary,
      seasonLabel,
      mode,
      reportDate,
    })
  }, [team, rows, filters, summary, seasonLabel, mode, reportDate])

  return (
    <ReportShell
      title={model.title}
      reportDate={model.reportDate}
      reportType={
        model.isPerformance
          ? REPORT_TYPES.PERFORMANCE
          : REPORT_TYPES.INSIGHTS
      }
      status={REPORT_STATUS.ACTIVE}
      printPages={model.printPages}
      entity={model.entity}
      metaItems={model.metaItems}
      metaColumns={4}
    >
      <Typography sx={sx.subtitle}>
        {model.subtitle}
      </Typography>

      <ActiveFilters items={model.activeFilters} />

      {!model.rows.length ? (
        <Sheet variant='outlined' sx={sx.empty}>
          <Typography level='title-md'>
            אין שחקנים להצגה בדוח
          </Typography>

          <Typography level='body-sm'>
            יש לבדוק את הפילטרים הפעילים או את נתוני הסגל.
          </Typography>
        </Sheet>
      ) : (
        <ReportContent model={model} />
      )}
    </ReportShell>
  )
}
