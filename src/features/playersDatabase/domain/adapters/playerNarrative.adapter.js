// src/features/playersDatabase/domain/adapters/playerNarrative.adapter.js

import { adaptPlayerDocumentSeason } from './playerDocument.adapter.js'
import { normalizePlayerIdentity } from '../../model/playerIdentity.model.js'

const adaptRows = ({ playerDocument, rows, target }) => (
  Array.isArray(rows) ? rows : []
).map(seasonDocument => adaptPlayerDocumentSeason({
  playerDocument,
  seasonDocument,
  target,
}))

export const adaptPlayerNarrativeSource = ({
  playerDocument = {},
  teamSeasons = [],
} = {}) => {
  const identity = normalizePlayerIdentity(playerDocument)
  const seasons = [
    ...adaptRows({
      playerDocument,
      rows: playerDocument.history,
      target: 'history',
    }),
    ...adaptRows({
      playerDocument,
      rows: playerDocument.current,
      target: 'current',
    }),
  ]

  return {
    player: {
      identity: {
        playerId: identity.playerId,
        playerDocumentId: identity.playerDocumentId,
        displayName: identity.fullName,
      },
      birthYear: Number(playerDocument.birthYear) || null,
    },
    seasons,
    teams: Array.isArray(teamSeasons) ? teamSeasons : [],
    events: Array.isArray(playerDocument.events) ? playerDocument.events : [],
    narrative: playerDocument.scoutNarrative || null,
  }
}
