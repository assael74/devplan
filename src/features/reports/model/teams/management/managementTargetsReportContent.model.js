// features/reports/model/teams/management/managementTargetsReportContent.model.js

import {
  buildManagementTargetsReportContent as buildSharedManagementTargetsReportContent,
} from './print/index.js'

import { sanitizeReportValue } from '../../reportValue.shared.js'

export function buildManagementTargetsReportContent({
  team,
  draft,
  reportDate = '',
} = {}) {
  return sanitizeReportValue(
    buildSharedManagementTargetsReportContent({
      team,
      draft,
      reportDate,
    })
  )
}
