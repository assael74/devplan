// src/features/playersDatabase/services/write/club/edits/updateClubUrl.js

import { clean, requireValue, urlValue } from '../../../../domain/edits/editIdentity.js'
import {
  executeManualEdit,
  manualEditRef,
  requireManualEditDocument,
} from '../../shared/manualEdit.write.js'

export const updateClubUrl = ({ clubId, clubUrl }) => {
  const id = requireValue(clean(clubId), 'מזהה מועדון חסר')
  const url = urlValue(clubUrl)
  const clubRef = manualEditRef('clubProfiles', id)
  const directoryRef = manualEditRef('clubsDirectory', 'all')

  return executeManualEdit({
    refs: [clubRef, directoryRef],
    build: ({ get, updatedAt }) => {
      const club = requireManualEditDocument(get(clubRef))
      const directory = requireManualEditDocument(get(directoryRef))
      requireValue(clean(club.clubId) === id, 'זהות המועדון סותרת')
      const directoryClub = directory.clubsById?.[id]
      requireValue(Boolean(directoryClub), 'המועדון חסר בספריית המועדונים')
      const changes = []
      if (clean(club.clubUrl) !== url) changes.push({ ref: clubRef, patch: { clubUrl: url } })
      if (clean(directoryClub.clubUrl) !== url) {
        changes.push({
          ref: directoryRef,
          patch: {
            [`clubsById.${id}`]: { ...directoryClub, clubUrl: url, updatedAt },
          },
        })
      }
      return changes
    },
  })
}
