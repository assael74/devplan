// src/features/playersDatabase/services/write/roster/edits/updatePlayerShirtNumber.js

import {
  buildPlayerSearchIndexDocumentId,
  buildPlayerSeasonDocumentId,
} from '../../../../domain/identity/index.js'
import { clean, requireValue } from '../../../../domain/edits/editIdentity.js'
import { executeManualEdit, manualEditRef, requireManualEditDocument } from '../../shared/manualEdit.write.js'

const numberOrNull = value => value === null || value === undefined || value === '' ? null : Number(value)

export const updatePlayerShirtNumber = input => {
  const identity = {
    playerId: requireValue(clean(input.playerId), 'מזהה שחקן חסר'),
    teamId: requireValue(clean(input.teamId), 'מזהה קבוצה חסר'),
    seasonId: requireValue(clean(input.seasonId), 'מזהה עונה חסר'),
    teamSeasonDocumentId: requireValue(clean(input.teamSeasonDocumentId), 'מזהה עונת קבוצה חסר'),
  }
  const numShirt = numberOrNull(input.numShirt)
  if (numShirt !== null && (!Number.isSafeInteger(numShirt) || numShirt < 1)) {
    throw new Error('מספר חולצה חייב להיות מספר שלם וחיובי')
  }
  const teamRef = manualEditRef('teamSeasons', identity.teamSeasonDocumentId)
  const seasonRef = manualEditRef('playerSeasons', buildPlayerSeasonDocumentId(identity))
  const indexRef = manualEditRef('playerSearchIndexes', buildPlayerSearchIndexDocumentId(identity))

  return executeManualEdit({
    refs: [teamRef, seasonRef, indexRef],
    build: ({ get, updatedAt }) => {
      const team = requireManualEditDocument(get(teamRef))
      const teamIdentity = team.identity || {}
      requireValue(
        clean(teamIdentity.teamSeasonDocumentId) === identity.teamSeasonDocumentId &&
        clean(teamIdentity.teamId) === identity.teamId &&
        clean(teamIdentity.seasonId) === identity.seasonId,
        'זהות עונת הקבוצה סותרת',
      )
      requireValue(clean(team.stats?.statsLoadState?.status) === 'loaded', 'אפשר לערוך מספר חולצה רק לאחר טעינת סטטיסטיקה')
      const rosterPlayer = team.roster?.playersById?.[identity.playerId]
      requireValue(Boolean(rosterPlayer), 'השחקן חסר בסגל עונת הקבוצה')

      const seasonSnapshot = get(seasonRef)
      const season = seasonSnapshot?.exists() ? seasonSnapshot.data() : null
      const seasonTeam = season?.teamsById?.[identity.teamId]
      if (season) {
        requireValue(
          clean(season.identity?.playerId) === identity.playerId &&
          clean(season.identity?.seasonId) === identity.seasonId,
          'זהות עונת השחקן סותרת',
        )
      }
      const indexSnapshot = get(indexRef)
      const index = indexSnapshot?.exists() ? indexSnapshot.data() : null
      if (index) {
        requireValue(
          clean(index.playerId) === identity.playerId &&
          clean(index.seasonId) === identity.seasonId &&
          clean(index.references?.teamSeasonDocumentId) === identity.teamSeasonDocumentId,
          'זהות אינדקס השחקן סותרת',
        )
      }

      const changes = []
      if (numberOrNull(rosterPlayer.numShirt) !== numShirt) {
        changes.push({
          ref: teamRef,
          patch: {
            roster: {
              ...team.roster,
              playersById: {
                ...team.roster.playersById,
                [identity.playerId]: { ...rosterPlayer, numShirt, updatedAt },
              },
              updatedAt,
            },
            timestamps: { ...(team.timestamps || {}), updatedAt },
          },
        })
      }
      if (seasonTeam && numberOrNull(seasonTeam.roster?.numShirt) !== numShirt) {
        changes.push({
          ref: seasonRef,
          patch: {
            teamsById: {
              ...season.teamsById,
              [identity.teamId]: {
                ...seasonTeam,
                roster: { ...(seasonTeam.roster || {}), numShirt },
                updatedAt,
              },
            },
          },
        })
      }
      const indexValue = numShirt === null ? '' : String(numShirt)
      if (index && clean(index.player?.numShirt) !== indexValue) {
        changes.push({ ref: indexRef, patch: { player: { ...(index.player || {}), numShirt: indexValue } } })
      }
      return changes
    },
  })
}
