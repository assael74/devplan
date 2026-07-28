// features/playersDatabase/ui/pages/playerPage/report/usePlayerReport.js

import * as React from 'react'

import { useReportPreview } from '../../../../../reports/external/ui/index.js'
import { buildPlayerReport } from '../../../../report/index.js'

export default function usePlayerReport(input = {}) {
  const buildDraft = React.useCallback(() => (
    buildPlayerReport(input)
  ), [input])

  return useReportPreview({ buildDraft })
}
