const safeFilePart = value => (
  String(value || 'league')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'league'
)

export const downloadLeagueDocumentJson = ({
  leagueDocument = {},
  leaguesMaster = {},
} = {}) => {
  const leagueId = safeFilePart(leagueDocument.leagueId || leagueDocument.id)
  const blob = new Blob([JSON.stringify({
    exportedAt: new Date().toISOString(),
    leagueDocument,
    leaguesMaster,
  }, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `league-data-${leagueId}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
