// src/features/playersDatabase/ui/pages/playerPage/logic/playerJson.logic.js

const safeFilePart = value => (
  String(value || 'player')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'player'
)

function downloadJson(data = {}, fileName = 'data') {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], {
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

export function downloadPlayerJson(playerDocument = {}) {
  const playerId = safeFilePart(
    playerDocument.playerId || playerDocument.id
  )

  downloadJson(playerDocument, `player-${playerId}`)
}

export function downloadTeamJson(teamDocument = {}) {
  const teamId = safeFilePart(
    teamDocument.birthTeamId ||
    teamDocument.teamId ||
    teamDocument.id
  )

  downloadJson(teamDocument, `team-${teamId}`)
}

export function downloadTeamSeasonJson(teamSeasonDocument = {}) {
  const teamId = safeFilePart(
    teamSeasonDocument.birthTeamDocumentId ||
    teamSeasonDocument.birthTeamId ||
    teamSeasonDocument.teamId ||
    teamSeasonDocument.id
  )
  const seasonKey = safeFilePart(
    teamSeasonDocument.seasonKey ||
    teamSeasonDocument.seasonId
  )

  downloadJson(teamSeasonDocument, `team-season-${teamId}-${seasonKey}`)
}

export function downloadPlayerSearchIndexJson(searchIndexDocument = {}) {
  const documentId = safeFilePart(searchIndexDocument.id || searchIndexDocument.entityId)

  downloadJson(searchIndexDocument, `player-search-index-${documentId}`)
}

export function downloadTeamSearchIndexJson(searchIndexDocument = {}) {
  const documentId = safeFilePart(searchIndexDocument.id || searchIndexDocument.entityId)

  downloadJson(searchIndexDocument, `team-search-index-${documentId}`)
}
