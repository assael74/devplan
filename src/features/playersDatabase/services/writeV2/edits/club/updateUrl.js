// src/features/playersDatabase/services/writeV2/edits/club/updateUrl.js

import { data, executeEdit, reference } from '../shared/executeEdit.js'
import {
  array,
  clean,
  requireValue,
  unique,
  urlValue,
} from '../../../../domain/edits/editIdentity.js'

export async function updateClubUrl({ clubId, clubUrl }) {
  const id = requireValue(clean(clubId), 'מזהה מועדון חסר')
  const url = urlValue(clubUrl)
  const clubRef = reference('clubs', id)
  const masterRef = reference('clubsMaster', 'all')
  return executeEdit({
    refs: [clubRef, masterRef],
    build: (get, updatedAt) => {
      const club = data(get(clubRef))
      requireValue(clean(club.clubId) === id, 'זהות המועדון סותרת')
      const master = data(get(masterRef))
      const clubs = array(master.clubs, 'מאסטר מועדונים')
      const target = unique(clubs, row => clean(row.clubId) === id, 'מועדון במאסטר')
      return [
        { ref: clubRef, patch: { clubUrl: url } },
        {
          ref: masterRef,
          patch: {
            clubs: clubs.map(row =>
              row === target && row.clubUrl !== url
                ? { ...row, clubUrl: url, updatedAt }
                : row,
            ),
          },
        },
      ]
    },
  })
}
