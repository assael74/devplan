// features/reports/public/PublicReportPage.js

import React from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Sheet,
  Tooltip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../ui/core/icons/iconUi.js'
import ReportPrintButton from '../../../ui/patterns/reportPrint/ReportPrintButton.js'

import {
  getPublicReport,
  buildPublicReportUrl,
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

async function copyText(text) {
  if (!text) return false

  if (!navigator?.clipboard?.writeText) {
    return false
  }

  await navigator.clipboard.writeText(text)

  return true
}

function ShareButton({ copied = false, onShare }) {
  return (
    <>
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Tooltip
          title={copied ? 'הקישור הועתק' : 'העתקת קישור הדוח'}
          variant='soft'
        >
          <Button
            size='sm'
            variant='soft'
            color='neutral'
            startDecorator={iconUi({ id: 'share' })}
            sx={{ border: '1px solid', borderColor: 'divider' }}
            onClick={onShare}
          >
            שיתוף
          </Button>
        </Tooltip>
      </Box>

      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <Tooltip
          title={copied ? 'הקישור הועתק' : 'העתקת קישור הדוח'}
          variant='soft'
        >
          <IconButton
            size='sm'
            variant='soft'
            color='neutral'
            sx={{ border: '1px solid', borderColor: 'divider' }}
            onClick={onShare}
          >
            {iconUi({ id: 'share' })}
          </IconButton>
        </Tooltip>
      </Box>
    </>
  )
}

function buildReportRenderOptions(report = {}, { presentation, actions, onReportChange = null } = {}) {
  const reportOptions = Array.isArray(report.versions) ? report.versions : []
  const selectedReportValue = report.currentVersionId || report.versionId || reportOptions[0]?.value || ''

  return {
    presentation,
    actions,
    reportOptions,
    selectedReportValue,
    onReportChange,
  }
}

function PdfButton({ documentTitle, renderContent }) {
  return (
    <>
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <ReportPrintButton
          label='PDF'
          size='sm'
          tooltip='PDF'
          documentTitle={documentTitle}
          renderContent={renderContent}
        />
      </Box>

      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <ReportPrintButton
          iconOnly
          startIcon='download'
          size='sm'
          tooltip='PDF'
          documentTitle={documentTitle}
          renderContent={renderContent}
        />
      </Box>
    </>
  )
}

function ReportActions({ report, shareCopied = false, onShare }) {
  const documentTitle = getReportPageTitle(report)

  return (
    <>
      <ShareButton copied={shareCopied} onShare={onShare} />

      <PdfButton
        documentTitle={documentTitle}
        renderContent={() => (
          <PublicReportRenderer
            reportType={report.reportType}
            payload={report.reportContent}
            presentation='pdf'
            actions={null}
            reportOptions={Array.isArray(report.versions) ? report.versions : []}
            selectedReportValue={report.currentVersionId || report.versionId || report.versions?.[0]?.value || ''}
          />
        )}
      />
    </>
  )
}

export default function PublicReportPage() {
  const { reportId, versionId } = useParams()

  const [state, setState] = React.useState({
    loading: true,
    report: null,
    error: null,
  })
  const [shareCopied, setShareCopied] = React.useState(false)

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

  const handleReportChange = React.useCallback((versionId) => {
    if (!reportId || !versionId) return

    window.location.assign(
      buildPublicReportUrl({
        reportId,
        versionId,
      })
    )
  }, [reportId])

  React.useEffect(() => {
    if (!shareCopied) return undefined

    const timerId = window.setTimeout(() => {
      setShareCopied(false)
    }, 1800)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [shareCopied])

  const handleShare = React.useCallback(async () => {
    const currentUrl = window.location.href
    const copied = await copyText(currentUrl)

    if (copied) {
      setShareCopied(true)
      return
    }

    window.alert('לא ניתן לשתף את קישור הדוח. ניתן להעתיק את הכתובת ידנית.')
  }, [])

  if (state.loading) {
    return (
      <PublicReportState
        loading
        title='טוען דוח'
        text='הדוח הציבורי נטען כרגע'
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
      <Box sx={sx.viewer}>
        <PublicReportRenderer
          reportType={state.report.reportType}
          payload={state.report.reportContent}
          presentation='url'
          {...buildReportRenderOptions(state.report, {
            presentation: 'url',
            actions: null,
            onReportChange: handleReportChange,
          })}
          actions={(
            <ReportActions
              report={state.report}
              shareCopied={shareCopied}
              onShare={handleShare}
            />
          )}
        />
      </Box>
    </Box>
  )
}
