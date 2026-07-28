// features/playersDatabase/ui/pages/teamPage/report/useTeamReport.js

import * as React from 'react'

import { useReportPreview } from '../../../../../reports/external/ui/index.js'
import { buildTeamReport } from '../../../../report/index.js'

export default function useTeamReport(input = {}) {
  const buildDraft = React.useCallback(() => (
    buildTeamReport(input)
  ), [input])

  return useReportPreview({ buildDraft })
}
