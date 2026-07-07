// teamProfile/desktop/modules/players/components/toolbar/TeamPlayersPublishReportFlow.js

import {
  buildTeamPlayersPublicReportInput,
  publishPublicReport,
} from '../../../../../../../reports/index.js'

async function copyText(value) {
  if (!value) {
    throw new Error('[copyText] value is required')
  }

  if (
    navigator.clipboard?.writeText &&
    window.isSecureContext
  ) {
    await navigator.clipboard.writeText(value)
    return
  }

  const input = document.createElement('textarea')

  input.value = value
  input.setAttribute('readonly', '')
  input.style.position = 'fixed'
  input.style.top = '-1000px'
  input.style.opacity = '0'

  document.body.appendChild(input)

  input.focus()
  input.select()

  const copied = document.execCommand('copy')

  document.body.removeChild(input)

  if (!copied) {
    throw new Error('[copyText] Browser rejected copy command')
  }
}

export async function publishTeamPlayersReport({
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

  let timeoutId
  const publishPromise = publishPublicReport(input)
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error('[TeamPlayersToolbar] Publish timed out'))
    }, 20_000)
  })

  const result = await Promise.race([
    publishPromise.finally(() => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }),
    timeoutPromise,
  ])

  window.location.assign(result.versionUrl)

  try {
    await copyText(result.versionUrl)

    return {
      ...result,
      copied: true,
    }
  } catch (copyError) {
    console.error(
      '[TeamPlayersPublishReportFlow] Failed to copy report URL',
      copyError
    )

    window.prompt(
      'הקישור נוצר. העתק אותו ידנית:',
      result.versionUrl
    )

    return {
      ...result,
      copied: false,
    }
  }
}
