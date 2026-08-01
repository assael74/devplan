import { getDoc } from 'firebase/firestore'

import { PUBLIC_REPORT_STATUS } from '../../reports.constants.js'
import { publicReportRef } from '../publicReport.refs.js'

const wait = delayMs => new Promise(resolve => {
  window.setTimeout(resolve, delayMs)
})

export async function waitForPublicReportAvailability({
  reportId,
  attempts = 5,
  delayMs = 200,
} = {}) {
  if (!reportId) {
    throw new Error('[waitForPublicReportAvailability] reportId is required')
  }

  const totalAttempts = Math.max(1, Number(attempts) || 1)

  for (let attempt = 1; attempt <= totalAttempts; attempt += 1) {
    const snapshot = await getDoc(publicReportRef(reportId))

    if (snapshot.exists()) {
      const data = snapshot.data() || {}
      const rows = data.reportContent?.rows

      if (
        data.status === PUBLIC_REPORT_STATUS.PUBLISHED &&
        Array.isArray(rows)
      ) {
        return true
      }
    }

    if (attempt < totalAttempts) {
      await wait(delayMs)
    }
  }

  return false
}
