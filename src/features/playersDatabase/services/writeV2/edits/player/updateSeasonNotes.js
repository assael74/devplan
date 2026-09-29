// src/features/playersDatabase/services/writeV2/edits/player/updateSeasonNotes.js

import { data, executeEdit, reference } from '../shared/executeEdit.js'
import { readTeamIndexes } from '../shared/validation.js'
import {
  array,
  clean,
  playerMatches,
  requireValue,
  seasonKey,
  teamDocumentId,
  teamId,
  unique,
} from '../../../../domain/edits/editIdentity.js'

export async function updatePlayerSeasonNotes({
  playerDocumentId,
  playerId,
  birthTeamId,
  birthTeamDocumentId,
  seasonKey: suppliedKey,
  notes,
}) {
  const documentId = requireValue(
    clean(playerDocumentId),
    'מזהה מסמך השחקן חסר',
  )
  const id = requireValue(clean(birthTeamId), 'מזהה קבוצת שנתון חסר')
  const teamDocId = requireValue(
    clean(birthTeamDocumentId),
    'מזהה מסמך קבוצת שנתון חסר',
  )
  const identity = {
    playerId: requireValue(clean(playerId), 'מזהה שחקן חסר'),
    playerDocumentId: documentId,
  }
  const key = seasonKey({ seasonKey: suppliedKey })
  const value = clean(notes)
  const playerRef = reference('players', documentId)
  const indexes = await readTeamIndexes(id, key, identity.playerId)
  const indexDoc = unique(
    indexes,
    item => data(item).entityType === 'playerSeason' && playerMatches(data(item), identity),
    'אינדקס השחקן',
  )

  return executeEdit({
    refs: [playerRef, indexDoc.ref],
    build: (get, updatedAt) => {
      const playerDocument = data(get(playerRef))
      const index = data(get(indexDoc.ref))
      requireValue(
        teamId(index) === id &&
          teamDocumentId(index) === teamDocId &&
          seasonKey(index) === key &&
          playerMatches(index, identity) &&
          clean(index.playerDocumentId) === documentId,
        'זהות אינדקס השחקן סותרת',
      )
      const candidates = ['current', 'history'].flatMap(field =>
        array(playerDocument[field] || [], 'עונות השחקן').map(row => ({ field, row })),
      )
      const selected = unique(
        candidates,
        item =>
          seasonKey(item.row) === key &&
          teamId(item.row) === id &&
          teamDocumentId(item.row) === teamDocId,
        'עונת השחקן',
      )

      const changes = []
      if (clean(selected.row.notes) !== value) {
        changes.push({
          ref: playerRef,
          patch: {
            [selected.field]: playerDocument[selected.field].map(row =>
              row === selected.row ? { ...row, notes: value, updatedAt } : row,
            ),
          },
        })
      }
      changes.push({ ref: indexDoc.ref, patch: { notes: value } })
      return changes
    },
  })
}
