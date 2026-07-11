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

  console.group('[publishPlayerTargetsReport]')
  console.log('input:', input)

  const result = await publishPublicReport(input)

  console.log('result:', result)
  console.groupEnd()

  return {
    input,
    result,
  }
}
