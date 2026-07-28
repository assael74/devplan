// features/playersDatabase/ui/pages/searchPage/report/useSearchReport.js

import * as React from 'react'

import { useReportPreview } from '../../../../../reports/external/ui/index.js'
import { buildSearchReport } from '../../../../report/index.js'

export default function useSearchReport(input = {}) {
  const reportIdRef = React.useRef('')

  const buildDraft = React.useCallback(() => {
    const draft = buildSearchReport({
      ...input,
      searchReportId: reportIdRef.current,
    })

    reportIdRef.current = draft.entityId
    return draft
  }, [input])

  return useReportPreview({ buildDraft })
}
