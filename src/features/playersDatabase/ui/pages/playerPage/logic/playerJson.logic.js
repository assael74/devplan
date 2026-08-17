// src/features/playersDatabase/ui/pages/playerPage/logic/playerJson.logic.js

const safeFilePart = value => (
  String(value || 'player')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'player'
)

export function downloadPlayerJson(playerDocument = {}) {
  const playerId = safeFilePart(
    playerDocument.playerId || playerDocument.id
  )
  const json = JSON.stringify(playerDocument, null, 2)
  const blob = new Blob([json], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `player-${playerId}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
