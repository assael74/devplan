import * as React from 'react'

import { publishDbSearchReport } from './publishDbSearchReport.js'

const getErrorMessage = error => {
  if (error instanceof Error && error.message) return error.message
  return 'פרסום הדוח נכשל. יש לבדוק את הקונסול ולנסות שוב.'
}

const closePublishWindow = nextWindow => {
  try {
    if (nextWindow && !nextWindow.closed) {
      nextWindow.close()
    }
  } catch (error) {
    console.warn('[dbSearch] Failed to close placeholder tab', error)
  }
}

const logPublishDebugResult = ({ input, result }) => {
  console.group('[dbSearch] Publish debug result')
  console.log('input:', input)
  console.log('result:', result)
  console.groupEnd()
}

export default function useDbSearchReportPreview({ buildDraft }) {
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState(null)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')

  const openPreview = React.useCallback(() => {
    const nextDraft = buildDraft()
    setDraft(nextDraft)
    setError('')
    setOpen(true)
  }, [buildDraft])

  const closePreview = React.useCallback(() => {
    if (busy) return
    setOpen(false)
    setError('')
  }, [busy])

  const publish = React.useCallback(async () => {
    if (!draft || busy) return

    const nextWindow = window.open('', '_blank')

    if (!nextWindow) {
      setError('הדפדפן חסם את פתיחת כרטיסיית הדוח. יש לאפשר חלונות קופצים ולנסות שוב.')
      return
    }

    setBusy(true)
    setError('')

    try {
      const response = await publishDbSearchReport(draft)
      const publishResult = response && response.result ? response.result : {}

      if (publishResult.writeSkipped) {
        logPublishDebugResult({
          input: response.input,
          result: publishResult,
        })

        closePublishWindow(nextWindow)
        setError('מצב דיבאג: הדוח נבנה ללא כתיבה ל-Firestore.')
        return
      }

      const targetUrl = publishResult.currentUrl || response.currentUrl || ''

      if (!targetUrl) {
        throw new Error('[dbSearch] Missing currentUrl from publish result')
      }

      nextWindow.location.href = targetUrl
      setOpen(false)
      setDraft(null)
      setError('')
    } catch (publishError) {
      console.error('[dbSearch] publish failed', publishError)
      closePublishWindow(nextWindow)
      setError(getErrorMessage(publishError))
    } finally {
      setBusy(false)
    }
  }, [busy, draft])

  return {
    open,
    draft,
    busy,
    error,
    openPreview,
    closePreview,
    publish,
  }
}
