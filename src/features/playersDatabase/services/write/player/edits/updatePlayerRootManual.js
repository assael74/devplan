// src/features/playersDatabase/services/write/player/edits/updatePlayerRootManual.js

import { clean, equal, requireValue } from '../../../../domain/edits/editIdentity.js'
import {
  executeManualEdit,
  manualEditRef,
  readManualEditDocument,
  readManualEditRefs,
  requireManualEditDocument,
} from '../../shared/manualEdit.write.js'

const playerRootRef = playerId => manualEditRef(
  'playerRoots',
  requireValue(clean(playerId), 'מזהה שחקן חסר'),
)

export const updatePlayerNotes = async ({ playerId, notes }) => {
  const id = requireValue(clean(playerId), 'מזהה שחקן חסר')
  const value = clean(notes)
  const ref = playerRootRef(id)
  const indexRefs = await readManualEditRefs('playerSearchIndexes', { playerId: id })

  return executeManualEdit({
    refs: [ref, ...indexRefs],
    build: ({ get }) => {
      const player = requireManualEditDocument(get(ref))
      requireValue(clean(player.identity?.playerId) === id, 'זהות השחקן סותרת')
      const changes = clean(player.notes) === value
        ? []
        : [{ ref, patch: { notes: value } }]
      indexRefs.forEach(indexRef => {
        const index = requireManualEditDocument(get(indexRef))
        requireValue(clean(index.playerId) === id, 'זהות תוצר החיפוש סותרת')
        if (clean(index.player?.notes) !== value) {
          changes.push({
            ref: indexRef,
            patch: { player: { ...(index.player || {}), notes: value } },
          })
        }
      })
      return changes
    },
  })
}

export const updatePlayerAgent = ({ playerId, agent = {} }) => {
  const id = requireValue(clean(playerId), 'מזהה שחקן חסר')
  const status = ['yes', 'no', 'unknown'].includes(clean(agent.status))
    ? clean(agent.status)
    : 'unknown'
  const value = { status, phones: clean(agent.phones) }
  const ref = playerRootRef(id)

  return executeManualEdit({
    refs: [ref],
    build: ({ get, updatedAt }) => {
      const player = requireManualEditDocument(get(ref))
      requireValue(clean(player.identity?.playerId) === id, 'זהות השחקן סותרת')
      const next = { ...value, updatedAt }
      return equal(
        { status: clean(player.agent?.status), phones: clean(player.agent?.phones) },
        value,
      ) ? [] : [{ ref, patch: { agent: next } }]
    },
  })
}

export const updatePlayerRole = async ({ playerId, primaryPosition, positionLayer }) => {
  const id = requireValue(clean(playerId), 'מזהה שחקן חסר')
  const primary = clean(primaryPosition)
  const layer = clean(positionLayer)
  const ref = playerRootRef(id)
  const indexRefs = await readManualEditRefs('playerSearchIndexes', { playerId: id })
  const indexSnapshots = await Promise.all(indexRefs.map(readManualEditDocument))
  const teamSeasonRefs = [...new Map(indexSnapshots.map(snapshot => {
    const index = requireManualEditDocument(snapshot)
    const documentId = requireValue(
      clean(index.references?.teamSeasonDocumentId),
      'הפניית עונת הקבוצה חסרה',
    )
    const teamSeasonRef = manualEditRef('teamSeasons', documentId)
    return [teamSeasonRef.path, teamSeasonRef]
  })).values()]

  return executeManualEdit({
    refs: [ref, ...indexRefs, ...teamSeasonRefs],
    build: ({ get, updatedAt }) => {
      const player = requireManualEditDocument(get(ref))
      requireValue(clean(player.identity?.playerId) === id, 'זהות השחקן סותרת')
      const changes = []
      if (clean(player.primaryPosition) !== primary || clean(player.positionLayer) !== layer) {
        changes.push({
          ref,
          patch: { primaryPosition: primary, positionLayer: layer },
        })
      }
      indexRefs.forEach(indexRef => {
        const index = requireManualEditDocument(get(indexRef))
        requireValue(clean(index.playerId) === id, 'זהות תוצר החיפוש סותרת')
        if (
          clean(index.player?.primaryPosition) !== primary ||
          clean(index.player?.positionLayer) !== layer
        ) {
          changes.push({
            ref: indexRef,
            patch: {
              player: {
                ...(index.player || {}),
                primaryPosition: primary,
                positionLayer: layer,
              },
            },
          })
        }
      })
      teamSeasonRefs.forEach(teamSeasonRef => {
        const teamSeason = requireManualEditDocument(get(teamSeasonRef))
        const snapshot = teamSeason.scouting?.playersById?.[id]
        requireValue(Boolean(snapshot), 'תמונת השחקן חסרה בעונת הקבוצה')
        if (
          clean(snapshot.primaryPosition) !== primary ||
          clean(snapshot.positionLayer) !== layer
        ) {
          changes.push({
            ref: teamSeasonRef,
            patch: {
              [`scouting.playersById.${id}`]: {
                ...snapshot,
                primaryPosition: primary,
                positionLayer: layer,
                updatedAt,
              },
            },
          })
        }
      })
      return changes
    },
  })
}
