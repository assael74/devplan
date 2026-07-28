// features/reports/external/flow/publishReport.js

import { publishPublicReport } from '../../service/index.js'

export async function publishExternalReport(input = {}) {
  const result = await publishPublicReport(input)

  return {
    input,
    result,
  }
}
