// features/playersDatabase/ui/pages/leaguePage/report/useLeagueReport.js

import * as React from 'react'

import { useReportPreview } from '../../../../../reports/external/ui/index.js'
import { buildLeagueReport } from '../../../../report/index.js'

export default function useLeagueReport(input = {}) {
  const buildDraft = React.useCallback(() => (
    buildLeagueReport(input)
  ), [input])

  return useReportPreview({ buildDraft })
}
