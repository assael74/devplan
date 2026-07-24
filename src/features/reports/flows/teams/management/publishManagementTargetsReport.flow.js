// features/reports/flows/teams/management/publishManagementTargetsReport.flow.js

import {
  buildManagementTargetsPublicReportInput,
} from '../../../model/index.js'

import {
  publishPublicReport,
} from '../../../application/index.js'

export async function publishManagementTargetsReport({
  team,
  draft,
  createdBy = '',
}) {
  const input = buildManagementTargetsPublicReportInput({
    team,
    draft,
    createdBy,
    reportDate: new Date(),
  })

  const result = await publishPublicReport(input)

  return {
    input,
    result,
  }
}
