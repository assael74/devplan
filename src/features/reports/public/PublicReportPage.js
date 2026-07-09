// features/reports/public/PublicReportPage.js

import React from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  CircularProgress,
  Sheet,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../ui/core/icons/iconUi.js'
import ReportPrintButton from '../../../ui/patterns/reportPrint/ReportPrintButton.js'

import {
  getPublicReport,
  PUBLIC_REPORT_ERROR_CODES,
} from '../service/index.js'

import PublicReportRenderer from './PublicReportRenderer.js'
import { publicReportSx as sx } from './sx/publicReport.sx.js'

function PublicReportState({ loading = false, title, text }) {
  return (
    <Box sx={sx.statePage}>
      <Sheet variant='outlined' sx={sx.stateCard}>
        {loading ? (
          <CircularProgress size='lg' />
        ) : (
          iconUi({ id: 'report', size: 'lg' })
        )}

        <Typography level='title-lg' sx={sx.stateTitle}>
          {title}
        </Typography>

        {text ? (
          <Typography level='body-sm' sx={sx.stateText}>
            {text}
          </Typography>
        ) : null}
      </Sheet>
    </Box>
  )
}

function getReportPageTitle(report = {}) {
  const content = report.reportContent || {}
  const reportTitle = content.title || 'דוח'
  const entity = content.entity || {}
  const entityName = entity.teamName || entity.name || ''

  return [reportTitle, entityName, 'DevPlan'].filter(Boolean).join(' · ')
}

export default function PublicReportPage() {
  const { reportId, versionId } = useParams()

  const [state, setState] = React.useState({
    loading: true,
    report: null,
    error: null,
  })

  React.useEffect(() => {
    let active = true

    const loadReport = async () => {
      setState({
        loading: true,
        report: null,
        error: null,
      })

      try {
        const report = await getPublicReport({
          reportId,
          versionId,
        })

        if (!active) return

        setState({
          loading: false,
          report,
          error: report ? null : PUBLIC_REPORT_ERROR_CODES.NOT_FOUND,
        })
      } catch (error) {
        if (!active) return

        console.error('[PublicReportPage] Failed to load report', error)

        setState({
          loading: false,
          report: null,
          error: 'load-failed',
        })
      }
    }

    loadReport()

    return () => {
      active = false
    }
  }, [reportId, versionId])

  React.useEffect(() => {
    if (!state.report) return undefined

    const previousTitle = document.title

    document.title = getReportPageTitle(state.report)

    return () => {
      document.title = previousTitle
    }
  }, [state.report])

  if (state.loading) {
    return (
      <PublicReportState
        loading
        title='טוען דוח'
        text='הדוח הציבורי נטען כעת'
      />
    )
  }

  if (!state.report) {
    const errorText =
      state.error === PUBLIC_REPORT_ERROR_CODES.NOT_FOUND
        ? 'הקישור לא תקין, הדוח בוטל או שהגרסה המבוקשת אינה קיימת.'
        : 'אירעה שגיאה בטעינת הדוח. נסה שוב מאוחר יותר.'

    return (
      <PublicReportState
        title='הדוח אינו זמין'
        text={errorText}
      />
    )
  }

  return (
    <Box sx={sx.page}>
      <Box sx={sx.actions}>
        <ReportPrintButton
          label='הדפס / PDF'
          tooltip='הדפס / שמור PDF'
          documentTitle={getReportPageTitle(state.report)}
          renderContent={() => (
            <PublicReportRenderer
              reportType={state.report.reportType}
              payload={state.report.reportContent}
              presentation='pdf'
            />
          )}
        />
      </Box>

      <Box sx={sx.viewer}>
        <PublicReportRenderer
          reportType={state.report.reportType}
          payload={state.report.reportContent}
          presentation='url'
        />
      </Box>
    </Box>
  )
}
