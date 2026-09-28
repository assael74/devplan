// src/features/playersDatabase/ui/pages/playerPage/logic/playerDocumentsJson.logic.js

const safeFilePart = (value, fallback = 'unknown') => String(value || fallback)
  .trim()
  .replace(/[\\/:*?"<>|]+/g, '-')
  .replace(/\s+/g, '-')

const downloadJson = ({ data, fileName }) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')

  link.href = url
  link.download = fileName
  window.document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const downloadPlayerPageDocumentsJson = ({ playerDocument = null } = {}) => {
  if (!playerDocument) return 0

  downloadJson({
    data: playerDocument,
    fileName: `player-${safeFilePart(
      playerDocument.id || playerDocument.playerDocumentId || playerDocument.playerId
    )}.json`,
  })

  return 1
}

export const downloadPlayerPageIndexesJson = ({
  playerDocument = null,
  playerSearchIndexes = [],
} = {}) => {
  const playerId = safeFilePart(
    playerDocument?.id ||
    playerDocument?.playerDocumentId ||
    playerDocument?.playerId
  )
  const indexes = Array.isArray(playerSearchIndexes) ? playerSearchIndexes : []

  indexes.forEach((searchIndex, index) => {
    downloadJson({
      data: searchIndex,
      fileName: `player-search-index-${playerId}-${safeFilePart(
        searchIndex?.seasonKey || searchIndex?.id,
        String(index + 1)
      )}.json`,
    })
  })

  return indexes.length
}
