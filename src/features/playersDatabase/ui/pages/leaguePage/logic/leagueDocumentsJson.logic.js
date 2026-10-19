// src/features/playersDatabase/ui/pages/leaguePage/logic/leagueDocumentsJson.logic.js

import {
  downloadDocumentsZip,
  safeDownloadFilePart as safeFilePart,
} from '../../../logic/downloadDocumentsZip.js'

export const downloadLeaguePageDocumentsJson = ({
  leagueDocument = null,
  clubsDirectoryDocument = null,
  leaguesCenterDocument = null,
  pageName = '',
} = {}) => {
  const documents = []
  if (leagueDocument) {
    documents.push({
      data: leagueDocument,
      fileName: `league-${safeFilePart(leagueDocument.id || leagueDocument.leagueId)}.json`,
    })
  }
  if (clubsDirectoryDocument && clubsDirectoryDocument.documentExists !== false) {
    documents.push({ data: clubsDirectoryDocument, fileName: 'clubs-directory-all.json' })
  }
  if (leaguesCenterDocument && leaguesCenterDocument.documentExists !== false) {
    documents.push({ data: leaguesCenterDocument, fileName: 'leagues-center-all.json' })
  }

  const name = pageName || leagueDocument?.names?.display || leagueDocument?.names?.official ||
    leagueDocument?.id || leagueDocument?.leagueId
  return downloadDocumentsZip({ documents, fileName: `ליגה-${safeFilePart(name)}-מסמכים.zip` })
}
