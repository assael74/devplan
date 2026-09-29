// src/features/playersDatabase/services/writeV2/edits/player/updateSeasonUrl.js

import { data, executeEdit, reference } from '../shared/executeEdit.js'
import {
  readTeamIndexes,
  readTeamSeasonIndex,
  resolveTeamSeasonRef,
} from '../shared/validation.js'
import {
  array,
  clean,
  playerMatches,
  requireValue,
  seasonKey,
  teamDocumentId,
  teamId,
  unique,
  urlValue,
} from '../../../../domain/edits/editIdentity.js'

export async function updatePlayerSeasonUrl({
  playerDocumentId,
  birthTeamId,
  birthTeamDocumentId,
  seasonKey: suppliedKey,
  playerId,
  playerUrl,
}) {
  const key = seasonKey({ seasonKey: suppliedKey })
  const id = requireValue(clean(birthTeamId), 'מזהה קבוצת שנתון חסר')
  const documentId = requireValue(
    clean(birthTeamDocumentId),
    'מזהה מסמך קבוצת שנתון חסר',
  )
  const player = {
    playerId: requireValue(clean(playerId), 'מזהה שחקן חסר'),
    playerDocumentId,
  }
  requireValue(clean(playerDocumentId), 'מזהה מסמך השחקן חסר')
  const url = urlValue(playerUrl)
  const playerRef = reference('players', playerDocumentId)
  const playerIndexes = await readTeamIndexes(id, key, player.playerId)
  const teamIndexes = await readTeamSeasonIndex(id, key)
  const indexes = [...teamIndexes, ...playerIndexes]
  const indexDoc = unique(
    playerIndexes,
    item => data(item).entityType === 'playerSeason' && playerMatches(data(item), player),
    'אינדקס השחקן',
  )
  const { ref: seasonRef, teamIndex } = resolveTeamSeasonRef(indexes, documentId, key)
  const seasonDoc = { ref: seasonRef }

  return executeEdit({
    refs: [seasonDoc.ref, playerRef, indexDoc.ref, teamIndex.ref],
    build: (get, updatedAt) => {
      const teamSeason = data(get(seasonDoc.ref))
      const playerDocument = data(get(playerRef))
      const index = data(get(indexDoc.ref))
      const teamIndexValue = data(get(teamIndex.ref))
      requireValue(
        teamId(teamSeason) === id &&
          teamDocumentId(teamSeason) === documentId &&
          seasonKey(teamSeason) === key,
        'זהות עונת הקבוצה סותרת',
      )
      requireValue(
        teamId(teamIndexValue) === id &&
          teamDocumentId(teamIndexValue) === documentId &&
          seasonKey(teamIndexValue) === key &&
          clean(teamIndexValue.teamSeasonDocumentId) === seasonDoc.ref.id,
        'הפניית עונת הקבוצה חסרה או סותרת',
      )
      requireValue(
        teamId(index) === id &&
          teamDocumentId(index) === documentId &&
          seasonKey(index) === key &&
          playerMatches(index, player),
        'זהות אינדקס סותרת',
      )
      requireValue(
        clean(index.leagueId) === clean(teamSeason.leagueId),
        'שיוך אינדקס השחקן לליגה סותר',
      )
      requireValue(
        clean(index.playerDocumentId) === playerDocumentId,
        'הפניית אינדקס השחקן סותרת',
      )
      const players = array(teamSeason.teamPlayers, 'סגל')
      const selectedPlayer = unique(
        players,
        row => playerMatches(row, player),
        'שחקן בסגל',
      )
      requireValue(playerMatches(index, selectedPlayer), 'זהות אינדקס השחקן סותרת')
      if (
        clean(playerDocument.externalPlayerId) &&
        clean(selectedPlayer.externalPlayerId)
      ) {
        requireValue(
          clean(playerDocument.externalPlayerId) ===
            clean(selectedPlayer.externalPlayerId),
          'זהות מסמך השחקן סותרת',
        )
      }
      const candidates = ['current', 'history'].flatMap(field =>
        array(playerDocument[field] || [], 'עונות השחקן').map(row => ({ field, row })),
      )
      const selected = unique(
        candidates,
        item =>
          seasonKey(item.row) === key &&
          teamId(item.row) === id &&
          teamDocumentId(item.row) === documentId,
        'עונת השחקן',
      )
      if (clean(selected.row.leagueId)) {
        requireValue(
          clean(selected.row.leagueId) === clean(teamSeason.leagueId),
          'שיוך עונת השחקן לליגה סותר',
        )
      }
      const patch = []
      if (selectedPlayer.playerUrl !== url) {
        patch.push({
          ref: seasonDoc.ref,
          patch: {
            teamPlayers: players.map(row =>
              row === selectedPlayer ? { ...row, playerUrl: url, updatedAt } : row,
            ),
          },
        })
      }
      if (selected.row.playerUrl !== url) {
        patch.push({
          ref: playerRef,
          patch: {
            [selected.field]: playerDocument[selected.field].map(row =>
              row === selected.row ? { ...row, playerUrl: url, updatedAt } : row,
            ),
          },
        })
      }
      patch.push({ ref: indexDoc.ref, patch: { playerUrl: url } })
      return patch
    },
  })
}
