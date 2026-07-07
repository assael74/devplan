// src/features/reports/public/PublicReportPage.js

import React from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Button,
  CircularProgress,
  Sheet,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../ui/core/icons/iconUi.js'

import {
  getPublicReport,
} from './publicReport.service.js'

import {
  PUBLIC_REPORT_ERROR_CODES,
} from './publicReport.constants.js'

import PublicReportRenderer from './PublicReportRenderer.js'
import { publicReportSx as sx } from './sx/publicReport.sx.js'

function PublicReportState({ loading = false, title, text, }) {
  return (
    <Box sx={sx.statePage}>
      <Sheet variant='outlined' sx={sx.stateCard}>
        {loading ? (
          <CircularProgress size='lg' />
        ) : (
          iconUi({
            id: 'report',
            size: 'lg',
          })
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
    const entityName =
      state.report.entityName ||
      state.report.payload?.team?.teamName ||
      ''

    document.title = [
      state.report.title || 'דוח',
      entityName,
      'DevPlan',
    ].filter(Boolean).join(' · ')

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
      {state.report.allowPrint !== false ? (
        <Box sx={sx.actions}>
          <Button
            size='sm'
            variant='soft'
            color='neutral'
            startDecorator={iconUi({ id: 'download' })}
            onClick={() => window.print()}
          >
            הדפס / PDF
          </Button>
        </Box>
      ) : null}

      <PublicReportRenderer
        reportType={state.report.reportType}
        payload={state.report.payload}
      />
    </Box>
  )
}
