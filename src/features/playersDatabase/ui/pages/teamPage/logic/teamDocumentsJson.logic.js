// src/features/playersDatabase/ui/pages/teamPage/logic/teamDocumentsJson.logic.js

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

export const downloadTeamPageDocumentsJson = ({
  leagueDocument = null,
  leagueDocuments = [],
  teamDocument = null,
  teamSeasons = [],
} = {}) => {
  const teamId = safeFilePart(
    teamDocument?.id || teamDocument?.birthTeamDocumentId
  )

  const leaguesById = new Map()
  ;[
    ...(Array.isArray(leagueDocuments) ? leagueDocuments : []),
    leagueDocument,
  ].filter(Boolean).forEach(document => {
    const key = String(document?.id || document?.leagueId || '').trim()
    if (key) leaguesById.set(key, document)
  })

  leaguesById.forEach(document => {
    downloadJson({
      data: document,
      fileName: `league-${safeFilePart(document.id || document.leagueId)}.json`,
    })
  })

  if (teamDocument) {
    downloadJson({
      data: teamDocument,
      fileName: `team-root-${teamId}.json`,
    })
  }

  ;(Array.isArray(teamSeasons) ? teamSeasons : []).forEach(teamSeason => {
    downloadJson({
      data: teamSeason,
      fileName: `team-season-${teamId}-${safeFilePart(teamSeason?.seasonKey || teamSeason?.seasonId)}.json`,
    })
  })
}

export const downloadTeamPageIndexesJson = ({
  teamDocument = null,
  teamSearchIndexes = [],
} = {}) => {
  const teamId = safeFilePart(
    teamDocument?.id ||
    teamDocument?.birthTeamDocumentId ||
    teamDocument?.birthTeamId
  )
  const indexes = Array.isArray(teamSearchIndexes) ? teamSearchIndexes : []

  indexes.forEach((searchIndex, index) => {
    downloadJson({
      data: searchIndex,
      fileName: `team-search-index-${teamId}-${safeFilePart(
        searchIndex?.seasonKey || searchIndex?.id,
        String(index + 1)
      )}.json`,
    })
  })

  return indexes.length
}
