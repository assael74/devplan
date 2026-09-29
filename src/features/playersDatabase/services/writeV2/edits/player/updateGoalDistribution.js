// src/features/playersDatabase/services/writeV2/edits/player/updateGoalDistribution.js

import { data, executeEdit, reference } from '../shared/executeEdit.js'
import {
  array,
  clean,
  requireValue,
  seasonKey,
  teamDocumentId,
  teamId,
  unique,
} from '../../../../domain/edits/editIdentity.js'

const nonNegativeInteger = value => {
  if (value === '' || value === null || value === undefined) return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? Math.floor(number) : null
}

export function updatePlayerSeasonGoalDistribution({
  playerDocumentId,
  birthTeamId,
  birthTeamDocumentId,
  seasonKey: suppliedKey,
  scoringGames,
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
  const key = seasonKey({ seasonKey: suppliedKey })
  const nextScoringGames = nonNegativeInteger(scoringGames)
  const playerRef = reference('players', documentId)

  return executeEdit({
    refs: [playerRef],
    build: (get, updatedAt) => {
      const playerDocument = data(get(playerRef))
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
      const games = nonNegativeInteger(selected.row.playerStats?.games) || 0
      const goals = nonNegativeInteger(selected.row.playerStats?.goals) || 0
      requireValue(
        nextScoringGames === null || nextScoringGames <= games,
        'מספר משחקי ההבקעה אינו יכול לעלות על מספר ההופעות',
      )
      requireValue(
        nextScoringGames === null || nextScoringGames <= goals,
        'מספר משחקי ההבקעה אינו יכול לעלות על מספר השערים',
      )
      const goalDistribution = {
        scoringGames: nextScoringGames,
        distributionPct:
          nextScoringGames === null || !games
            ? null
            : Math.round((nextScoringGames / games) * 100),
        updatedAt,
      }

      if (
        selected.row.goalDistribution?.scoringGames === goalDistribution.scoringGames &&
        selected.row.goalDistribution?.distributionPct === goalDistribution.distributionPct
      ) return []

      return [{
        ref: playerRef,
        patch: {
          [selected.field]: playerDocument[selected.field].map(row =>
            row === selected.row
              ? { ...row, goalDistribution, updatedAt }
              : row,
          ),
        },
      }]
    },
  })
}
