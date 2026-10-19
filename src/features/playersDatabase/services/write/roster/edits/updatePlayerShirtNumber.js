// src/features/playersDatabase/services/write/roster/edits/updatePlayerShirtNumber.js

import {
  buildPlayerSearchIndexDocumentId,
  buildPlayerSeasonDocumentId,
} from '../../../../domain/identity/index.js'
import { clean, requireValue, urlValue } from '../../../../domain/edits/editIdentity.js'
import { executeManualEdit, manualEditRef, requireManualEditDocument } from '../../shared/manualEdit.write.js'

const numberOrNull = value => value === null || value === undefined || value === '' ? null : Number(value)

export const updatePlayerSeasonDetails = input => {
  const hasShirt = Object.prototype.hasOwnProperty.call(input, 'numShirt')
  const hasUrl = Object.prototype.hasOwnProperty.call(input, 'playerUrl')
  requireValue(hasShirt || hasUrl, 'לא נבחר שדה לעדכון')
  const identity = {
    playerId: requireValue(clean(input.playerId), 'מזהה שחקן חסר'),
    teamId: requireValue(clean(input.teamId), 'מזהה קבוצה חסר'),
    seasonId: requireValue(clean(input.seasonId), 'מזהה עונה חסר'),
    teamSeasonDocumentId: requireValue(clean(input.teamSeasonDocumentId), 'מזהה עונת קבוצה חסר'),
  }
  const numShirt = hasShirt ? numberOrNull(input.numShirt) : null
  if (hasShirt && numShirt !== null && (!Number.isSafeInteger(numShirt) || numShirt < 1)) {
    throw new Error('מספר חולצה חייב להיות מספר שלם וחיובי')
  }
  const playerUrl = hasUrl ? urlValue(input.playerUrl) : ''
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
      if (hasShirt) {
        requireValue(clean(team.stats?.statsLoadState?.status) === 'loaded', 'אפשר לערוך מספר חולצה רק לאחר טעינת סטטיסטיקה')
      }
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
      if (hasUrl) requireValue(season && seasonTeam && index, 'מסמכי השחקן לעונה חסרים; לא בוצעה שמירה')
      if (index) {
        requireValue(
          clean(index.playerId) === identity.playerId &&
          clean(index.seasonId) === identity.seasonId &&
          clean(index.references?.teamSeasonDocumentId) === identity.teamSeasonDocumentId,
          'זהות אינדקס השחקן סותרת',
        )
      }

      const changes = []
      const shirtChanged = hasShirt && numberOrNull(rosterPlayer.numShirt) !== numShirt
      const teamManual = team.manual || {}
      const teamPlayerManual = teamManual.playersById?.[identity.playerId] || {}
      const urlChanged = hasUrl && clean(teamPlayerManual.playerUrl) !== playerUrl
      if (shirtChanged || urlChanged) {
        changes.push({
          ref: teamRef,
          patch: {
            ...(shirtChanged ? { roster: {
              ...team.roster,
              playersById: {
                ...team.roster.playersById,
                [identity.playerId]: { ...rosterPlayer, numShirt, updatedAt },
              },
              updatedAt,
            } } : {}),
            ...(urlChanged ? { manual: {
              ...teamManual,
              playersById: {
                ...(teamManual.playersById || {}),
                [identity.playerId]: { ...teamPlayerManual, playerUrl, updatedAt },
              },
              updatedAt,
            } } : {}),
            timestamps: { ...(team.timestamps || {}), updatedAt },
          },
        })
      }
      const seasonShirtChanged = hasShirt && seasonTeam && numberOrNull(seasonTeam.roster?.numShirt) !== numShirt
      const seasonUrlChanged = hasUrl && seasonTeam && clean(seasonTeam.manual?.playerUrl) !== playerUrl
      if (seasonShirtChanged || seasonUrlChanged) {
        changes.push({
          ref: seasonRef,
          patch: {
            teamsById: {
              ...season.teamsById,
              [identity.teamId]: {
                ...seasonTeam,
                ...(seasonShirtChanged ? { roster: { ...(seasonTeam.roster || {}), numShirt } } : {}),
                ...(seasonUrlChanged ? { manual: { ...(seasonTeam.manual || {}), playerUrl } } : {}),
                updatedAt,
              },
            },
          },
        })
      }
      const indexValue = numShirt === null ? '' : String(numShirt)
      const indexShirtChanged = hasShirt && index && clean(index.player?.numShirt) !== indexValue
      const indexUrlChanged = hasUrl && index && clean(index.player?.playerUrl) !== playerUrl
      if (indexShirtChanged || indexUrlChanged) {
        changes.push({
          ref: indexRef,
          patch: { player: {
            ...(index.player || {}),
            ...(indexShirtChanged ? { numShirt: indexValue } : {}),
            ...(indexUrlChanged ? { playerUrl } : {}),
          } },
        })
      }
      return changes
    },
  })
}

export const updatePlayerShirtNumber = input => updatePlayerSeasonDetails({
  playerId: input.playerId,
  teamId: input.teamId,
  seasonId: input.seasonId,
  teamSeasonDocumentId: input.teamSeasonDocumentId,
  numShirt: input.numShirt,
})
