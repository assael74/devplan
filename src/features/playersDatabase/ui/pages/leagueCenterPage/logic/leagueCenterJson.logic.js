// src/features/playersDatabase/ui/pages/leagueCenterPage/logic/leagueCenterJson.logic.js

export const downloadLeagueCenterDocumentsJson = ({
  leaguesMasterDocument = null,
  leagueDocuments = [],
} = {}) => {
  const documents = Array.isArray(leagueDocuments) ? leagueDocuments : []
  if (!leaguesMasterDocument && !documents.length) return 0

  const blob = new Blob([JSON.stringify({
    leaguesMasterDocument,
    leagueDocuments: documents,
  }, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')

  link.href = url
  link.download = 'league-center-documents.json'
  window.document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)

  return documents.length + (leaguesMasterDocument ? 1 : 0)
}
