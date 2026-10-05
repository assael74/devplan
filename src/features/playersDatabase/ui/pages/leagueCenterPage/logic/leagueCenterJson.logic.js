// src/features/playersDatabase/ui/pages/leagueCenterPage/logic/leagueCenterJson.logic.js

export const downloadLeagueCenterDocumentsJson = ({
  leaguesCenterDocument = null,
} = {}) => {
  if (!leaguesCenterDocument?.documentExists) return 0

  const blob = new Blob([JSON.stringify({
    leaguesCenterDocument,
  }, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')

  link.href = url
  link.download = 'league-center-document.json'
  window.document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)

  return 1
}
