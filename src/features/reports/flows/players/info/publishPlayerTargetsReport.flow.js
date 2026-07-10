// features/reports/flows/players/info/publishPlayerTargetsReport.flow.js

import {
  publishPublicReport,
} from '../../../service/index.js'

import {
  buildPlayerTargetsPublicReportInput,
} from '../../../model/index.js'

export async function publishPlayerTargetsReport({
  player,
  team,
  reportDate = new Date(),
  createdBy = '',
  status,
} = {}) {
  const input = buildPlayerTargetsPublicReportInput({
    player,
    team,
    reportDate,
    createdBy,
    status,
  })

  const result = await publishPublicReport(input)

  return {
    input,
    result,
  }
}
