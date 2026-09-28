// src/features/playersDatabase/ui/pages/leaguePage/logic/leagueDocumentsJson.logic.js

const safeFilePart = (value, fallback = 'unknown') => String(value || fallback)
  .trim()
  .replace(/[\\/:*?"<>|]+/g, '-')
  .replace(/\s+/g, '-')

export const downloadLeaguePageDocumentsJson = ({ leagueDocument = null } = {}) => {
  if (!leagueDocument) return 0

  const blob = new Blob([JSON.stringify(leagueDocument, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')

  link.href = url
  link.download = `league-${safeFilePart(
    leagueDocument.id || leagueDocument.leagueId
  )}.json`
  window.document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)

  return 1
}
