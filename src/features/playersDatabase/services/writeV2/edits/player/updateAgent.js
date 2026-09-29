// src/features/playersDatabase/services/writeV2/edits/player/updateAgent.js

import { data, executeEdit, reference } from '../shared/executeEdit.js'
import { clean, requireValue } from '../../../../domain/edits/editIdentity.js'

export function updatePlayerAgent({ playerDocumentId, agent = {} }) {
  const documentId = requireValue(
    clean(playerDocumentId),
    'מזהה מסמך השחקן חסר',
  )
  const status = ['yes', 'no', 'unknown'].includes(clean(agent.status))
    ? clean(agent.status)
    : 'unknown'
  const playerRef = reference('players', documentId)

  return executeEdit({
    refs: [playerRef],
    build: (get, updatedAt) => {
      const player = data(get(playerRef))
      if (
        clean(player.agent?.status) === status &&
        clean(player.agent?.phones) === clean(agent.phones)
      ) return []
      return [{
        ref: playerRef,
        patch: {
          agent: {
            status,
            phones: clean(agent.phones),
            updatedAt,
          },
        },
      }]
    },
  })
}
