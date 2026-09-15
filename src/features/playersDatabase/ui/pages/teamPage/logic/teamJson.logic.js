const safeFilePart = value => (
  String(value || 'team')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'team'
)

const downloadJson = (data = {}, fileName = 'data') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `${safeFilePart(fileName)}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const buildTeamDataBundleJson = ({
  teamDocument = {},
  teamSeasons = [],
  teamSearchIndexes = [],
  documentLoadState = null,
  teamPageData = null,
} = {}) => {
  return {
    exportedAt: new Date().toISOString(),
    documentLoadState,
    teamPageData,
    team: teamDocument,
    teamSeasons,
    teamSearchIndexes,
  }
}

export const downloadTeamDataBundleJson = (input = {}) => {
  const teamDocument = input.teamDocument || {}
  const teamId = safeFilePart(
    teamDocument.birthTeamId ||
    teamDocument.teamId ||
    teamDocument.id
  )

  downloadJson(buildTeamDataBundleJson(input), `team-data-${teamId}`)
}
