// src/features/playersDatabase/ui/pages/leagueCenterPage/logic/leagueCenterJson.logic.js

import { downloadDocumentsZip } from '../../../logic/downloadDocumentsZip.js'

export const downloadLeagueCenterDocumentsJson = ({
  leaguesCenterDocument = null,
  clubsDirectoryDocument = null,
} = {}) => {
  const documents = []
  if (leaguesCenterDocument && leaguesCenterDocument.documentExists !== false) {
    documents.push({ data: leaguesCenterDocument, fileName: 'leagues-center-all.json' })
  }
  if (clubsDirectoryDocument && clubsDirectoryDocument.documentExists !== false) {
    documents.push({ data: clubsDirectoryDocument, fileName: 'clubs-directory-all.json' })
  }

  return downloadDocumentsZip({
    documents,
    fileName: 'מרכז-ליגות-מסמכים.zip',
  })
}
