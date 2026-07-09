// features/reports/service/publishReport.flow.js

import {
  buildTeamPlayersPublicReportInput,
} from '../model/index.js'

import {
  publishPublicReport,
} from './publicReport.firestore.js'

async function copyText(text) {
  if (!text) return false

  if (!navigator?.clipboard?.writeText) {
    return false
  }

  await navigator.clipboard.writeText(text)

  return true
}

export async function publishReport({
  team,
  rows,
  filters,
  summary,
  seasonLabel,
  mode,
}) {
  const input = buildTeamPlayersPublicReportInput({
    team,
    rows,
    filters,
    summary,
    seasonLabel,
    mode,
    reportDate: new Date(),
  })

  const result = await publishPublicReport(input)
  const copied = await copyText(result.currentUrl)

  return {
    copied,
    input,
    result,
  }
}
