// features/playersDatabase/ui/pages/searchPage/report/useSearchReport.js

import * as React from 'react'

import { useReportPreview } from '../../../../../reports/external/ui/index.js'
import { buildSearchReport } from '../../../../report/index.js'

const clean = value => String(value || '').trim()

export default function useSearchReport(input = {}) {
  const reportIdRef = React.useRef('')
  const reportNameRef = React.useRef('')

  const buildDraft = React.useCallback(() => {
    const draft = buildSearchReport({
      ...input,
      searchReportId: reportIdRef.current,
      reportName: reportNameRef.current,
    })

    reportIdRef.current = draft.entityId
    return draft
  }, [input])

  const preview = useReportPreview({ buildDraft })

  const openPreview = React.useCallback(reportName => {
    const normalizedName = clean(reportName)
    if (!normalizedName) return

    reportNameRef.current = normalizedName
    preview.openPreview()
  }, [preview.openPreview])

  return {
    ...preview,
    openPreview,
  }
}
