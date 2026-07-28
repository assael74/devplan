// features/reports/external/ui/useReportPreview.js

import * as React from 'react'

import { publishExternalReport } from '../flow/index.js'

export default function useReportPreview({ buildDraft }) {
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState(null)
  const [publication, setPublication] = React.useState(null)
  const [busy, setBusy] = React.useState(false)

  const openPreview = React.useCallback(() => {
    const nextDraft = buildDraft()
    setDraft(nextDraft)
    setOpen(true)
  }, [buildDraft])

  const closePreview = React.useCallback(() => {
    if (busy) return
    setOpen(false)
  }, [busy])

  const publish = React.useCallback(async () => {
    if (!draft || busy) return

    setBusy(true)

    try {
      const response = await publishExternalReport(draft)
      setPublication(response.result)
    } finally {
      setBusy(false)
    }
  }, [busy, draft])

  return {
    open,
    draft,
    publication,
    busy,
    openPreview,
    closePreview,
    publish,
  }
}
