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
  buildPublicReportShareUrl,
  buildPublicReportShareText,
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

function clean(value) {
  return String(value ?? '').trim()
}

function resolveAbsoluteUrl(url) {
  const safe = clean(url)
  if (!safe) return ''

  if (/^https?:\/\//i.test(safe)) {
    return safe
  }

  if (typeof window === 'undefined') {
    return safe
  }

  return `${window.location.origin}${safe.startsWith('/') ? '' : '/'}${safe}`
}

function updateMetaTag({ attrName, attrValue, content }) {
  if (typeof document === 'undefined') return () => {}

  const selector = `meta[${attrName}="${attrValue}"]`
  let element = document.head.querySelector(selector)
  const previousContent = element?.getAttribute('content')

  if (!content) {
    if (element && element.dataset.codexReportDynamic === 'true') {
      element.remove()
    }

    return () => {}
  }

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attrName, attrValue)
    element.dataset.codexReportDynamic = 'true'
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)

  return () => {
    if (!element) return

    if (previousContent === null) {
      if (element.dataset.codexReportDynamic === 'true') {
        element.remove()
      }
      return
    }

    element.setAttribute('content', previousContent)
  }
}

function updateLinkTag({ rel, href }) {
  if (typeof document === 'undefined') return () => {}

  const selector = `link[rel="${rel}"]`
  let element = document.head.querySelector(selector)
  const previousHref = element?.getAttribute('href')

  if (!href) {
    if (element && element.dataset.codexReportDynamic === 'true') {
      element.remove()
    }

    return () => {}
  }

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    element.dataset.codexReportDynamic = 'true'
    document.head.appendChild(element)
  }

  element.setAttribute('href', href)

  return () => {
    if (!element) return

    if (previousHref === null) {
      if (element.dataset.codexReportDynamic === 'true') {
        element.remove()
      }
      return
    }

    element.setAttribute('href', previousHref)
  }
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
    const reportContent = state.report.reportContent || {}
    const entity = reportContent.entity || {}
    const title = getReportPageTitle(state.report)
    const subtitle = clean(reportContent.meta?.subtitle || reportContent.subtitle || '')
    const imageUrl = resolveAbsoluteUrl(entity.avatarUrl || entity.imageUrl || entity.logo || '')
    const reportUrl = window.location.href

    const restoreMeta = [
      updateMetaTag({ attrName: 'property', attrValue: 'og:title', content: title }),
      updateMetaTag({ attrName: 'property', attrValue: 'og:description', content: subtitle }),
      updateMetaTag({ attrName: 'property', attrValue: 'og:url', content: reportUrl }),
      updateMetaTag({ attrName: 'property', attrValue: 'og:image', content: imageUrl }),
      updateMetaTag({ attrName: 'name', attrValue: 'twitter:card', content: imageUrl ? 'summary_large_image' : 'summary' }),
      updateMetaTag({ attrName: 'name', attrValue: 'twitter:title', content: title }),
      updateMetaTag({ attrName: 'name', attrValue: 'twitter:description', content: subtitle }),
      updateMetaTag({ attrName: 'name', attrValue: 'twitter:image', content: imageUrl }),
      updateLinkTag({ rel: 'canonical', href: reportUrl }),
    ]

    document.title = title

    return () => {
      document.title = previousTitle
      restoreMeta.reverse().forEach(restore => restore?.())
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
    const reportIdValue = state.report?.reportId || state.report?.id || reportId
    const versionIdValue =
      state.report?.versionId ||
      versionId ||
      ''

    const currentUrl = buildPublicReportShareUrl({
      reportId: reportIdValue,
      versionId: versionIdValue,
    })

    const shareText = buildPublicReportShareText({
      report: state.report,
      url: currentUrl,
    })
    const copied = await copyText(shareText || currentUrl)

    if (copied) {
      setShareCopied(true)
      return
    }

    window.alert('לא ניתן לשתף את קישור הדוח. ניתן להעתיק את הכתובת ידנית.')
  }, [reportId, state.report, versionId])

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
