// src/features/playersDatabase/ui/pages/teamPage/logic/teamDocumentsJson.logic.js

import {
  downloadDocumentsZip,
  safeDownloadFilePart as safeFilePart,
} from '../../../logic/downloadDocumentsZip.js'

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
  clubsDirectoryDocument = null,
  leaguesCenterDocument = null,
  leagueDocument = null,
  leagueDocuments = [],
  teamDocument = null,
  teamSeasons = [],
  clubSources = null,
  pageName = '',
} = {}) => {
  const teamId = teamDocument?.id || teamDocument?.identity?.teamId ||
    teamDocument?.teamId || teamDocument?.birthTeamDocumentId || ''
  const documents = new Map()
  const add = (data, fileName) => {
    if (data && data.documentExists !== false) documents.set(fileName, { data, fileName })
  }
  const clubSeasons = [
    clubSources?.current,
    ...(Array.isArray(clubSources?.history) ? clubSources.history : []),
  ].filter(Boolean)

  ;[
    ...Object.values(clubSources?.leaguesById || {}),
    ...(Array.isArray(leagueDocuments) ? leagueDocuments : []),
    leagueDocument,
  ].filter(Boolean).forEach(document => {
    const id = document.id || document.leagueId
    if (id) add(document, `league-${safeFilePart(id)}.json`)
  })

  add(clubsDirectoryDocument, 'clubs-directory-all.json')
  add(leaguesCenterDocument, 'leagues-center-all.json')
  add(teamDocument, `team-root-${safeFilePart(teamId)}.json`)

  clubSeasons.forEach(source => {
    add(source.center, `clubs-center-${safeFilePart(source.center?.id || source.seasonId)}.json`)
  })
  ;[
    ...clubSeasons.flatMap(source => Object.values(source.teamSeasonsById || {})),
    ...(Array.isArray(teamSeasons) ? teamSeasons : []),
  ].filter(Boolean).forEach(teamSeason => {
    const identity = teamSeason.identity || {}
    const id = teamSeason.id || identity.teamSeasonDocumentId || [
      identity.teamId || teamId,
      identity.seasonId || teamSeason.seasonId || identity.seasonKey || teamSeason.seasonKey,
    ].filter(Boolean).join('__')
    add(teamSeason, `team-season-${safeFilePart(id)}.json`)
  })

  return downloadDocumentsZip({
    documents: [...documents.values()],
    fileName: `קבוצה-${safeFilePart(pageName || teamId)}-מסמכים.zip`,
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
