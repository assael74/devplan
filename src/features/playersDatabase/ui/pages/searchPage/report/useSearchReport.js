// features/playersDatabase/ui/pages/searchPage/report/useSearchReport.js

import * as React from 'react'

import {
  buildPublicReportDocumentPreview,
  logPublicReportDocumentMeasurement,
  publishDbSearchReport,
  waitForPublicReportAvailability,
} from '../../../../../reports/publicApi.js'
import { buildSearchReport } from '../../../../report/index.js'

const clean = value => String(value || '').trim()

const getErrorMessage = error => {
  if (error instanceof Error && error.message) return error.message
  return 'יצירת הדוח נכשלה. יש לבדוק את הקונסול ולנסות שוב.'
}

const closePublishWindow = nextWindow => {
  try {
    if (nextWindow && !nextWindow.closed) nextWindow.close()
  } catch (error) {
    console.warn('[dbSearch] Failed to close placeholder tab', error)
  }
}

export default function useSearchReport(input = {}) {
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')

  const buildDraft = React.useCallback(details => {
    const draft = buildSearchReport({
      ...input,
      reportName: clean(details?.reportName),
      reportPurpose: clean(details?.reportPurpose),
      reportDescription: clean(details?.reportDescription),
    })

    const firestoreDocument = buildPublicReportDocumentPreview(draft)
    logPublicReportDocumentMeasurement({
      document: firestoreDocument,
      label: 'dbSearch publish',
    })

    return draft
  }, [input])

  const publishAndOpen = React.useCallback(async details => {
    if (busy) return false

    const reportName = clean(details?.reportName)
    const reportPurpose = clean(details?.reportPurpose)
    if (!reportName || !reportPurpose) return false

    const nextWindow = window.open('', '_blank')

    if (!nextWindow) {
      setError('הדפדפן חסם את פתיחת כרטיסיית הדוח. יש לאפשר חלונות קופצים ולנסות שוב.')
      return false
    }

    setBusy(true)
    setError('')

    try {
      const draft = buildDraft(details)
      const response = await publishDbSearchReport(draft)
      const publishResult = response && response.result ? response.result : {}

      if (publishResult.writeSkipped) {
        closePublishWindow(nextWindow)
        setError('מצב דיבאג: הדוח נבנה ללא כתיבה ל-Firestore.')
        return false
      }

      const targetUrl = publishResult.currentUrl || response.currentUrl || ''
      const reportId = publishResult.reportId || ''

      if (!targetUrl || !reportId) {
        throw new Error('[dbSearch] Missing reportId/currentUrl from publish result')
      }

      const reportAvailable = await waitForPublicReportAvailability({
        reportId,
        attempts: 5,
        delayMs: 200,
      })

      if (!reportAvailable) {
        throw new Error('[dbSearch] Published report was not available after verification')
      }

      nextWindow.location.href = targetUrl
      setError('')
      return true
    } catch (publishError) {
      console.error('[dbSearch] publish failed', publishError)
      closePublishWindow(nextWindow)
      setError(getErrorMessage(publishError))
      return false
    } finally {
      setBusy(false)
    }
  }, [buildDraft, busy])

  return {
    busy,
    error,
    publishAndOpen,
  }
}
