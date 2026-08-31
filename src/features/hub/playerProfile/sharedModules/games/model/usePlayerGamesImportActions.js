// src/features/hub/playerProfile/sharedModules/games/model/usePlayerGamesImportActions.js

import { useEffect, useState } from 'react'

import { createEntity, unwrapActionResult } from '../../../../application/index.js'

const clean = value => String(value == null ? '' : value).trim()

const isPrivatePlayerEntity = player => {
  return player?.isPrivatePlayer === true || player?.playerSource === 'private'
}

export function usePlayerGamesImportActions({
  livePlayer,
  liveTeam,
  context,
  gamesImportRequest = 0,
} = {}) {
  const [gamesImportOpen, setGamesImportOpen] = useState(false)
  const [gamesImportSaving, setGamesImportSaving] = useState(false)
  const [gamesImportError, setGamesImportError] = useState('')

  useEffect(() => {
    if (gamesImportRequest > 0) {
      handleOpenGamesImport()
    }
  }, [gamesImportRequest])

  function handleOpenGamesImport() {
    if (gamesImportSaving) return

    setGamesImportError('')
    setGamesImportOpen(true)
  }

  function handleCloseGamesImport() {
    if (gamesImportSaving) return

    setGamesImportOpen(false)
    setGamesImportError('')
  }

  async function handleGamesImportPreviewReady({ payload } = {}) {
    const playerId = clean(livePlayer?.id || context?.playerId)
    const isPrivatePlayer =
      isPrivatePlayerEntity(livePlayer) ||
      context?.isPrivatePlayer === true ||
      context?.playerSource === 'private'
    const teamId = clean(liveTeam?.id || livePlayer?.teamId || context?.teamId)
    const clubId = clean(liveTeam?.clubId || livePlayer?.clubId || context?.clubId)
    const teamName = clean(liveTeam?.teamName || livePlayer?.teamName)
    const clubName = clean(context?.club?.clubName || livePlayer?.clubName)

    setGamesImportError('')

    if (!playerId || (!isPrivatePlayer && (!teamId || !clubId))) {
      setGamesImportError(
        isPrivatePlayer
          ? 'חסר מזהה שחקן. לא ניתן לבצע ייבוא.'
          : 'חסר מזהה שחקן, קבוצה או מועדון. לא ניתן לבצע ייבוא.'
      )
      console.error('player games import blocked: missing ids', {
        playerId,
        teamId,
        clubId,
        isPrivatePlayer,
      })
      return
    }

    const finalPayload = {
      ...payload,
      playerId,
      teamId,
      clubId,
      teamName,
      clubName,
      ...(isPrivatePlayer
        ? {
          isPrivatePlayer: true,
          gameSource: 'external',
          isExternalGame: true,
        }
        : {}),
      defaults: {
        ...(payload?.defaults || {}),
        playerId,
        teamId,
        clubId,
        teamName,
        clubName,
        ...(isPrivatePlayer
          ? {
            isSelected: true,
            isStarting: false,
            goals: 0,
            assists: 0,
            timePlayed: 0,
          }
          : {}),
      },
    }

    try {
      setGamesImportSaving(true)

      unwrapActionResult(await createEntity({
        entityType: isPrivatePlayer ? 'externalGames' : 'games',
        draft: finalPayload,
        context: {
          ...context,
          playerId,
          teamId,
          clubId,
          player: livePlayer,
          team: liveTeam,
          isPrivatePlayer,
          ...(isPrivatePlayer
            ? {
              playerSource: 'private',
              gameSource: 'external',
              isExternalGame: true,
            }
            : {}),
        },
      }))

      setGamesImportOpen(false)
      setGamesImportError('')
    } catch (error) {
      setGamesImportError('ייבוא המשחקים נכשל. בדוק את הנתונים ונסה שוב.')
      console.error('player games import save failed', error)
    } finally {
      setGamesImportSaving(false)
    }
  }

  return {
    gamesImportOpen,
    gamesImportSaving,
    gamesImportError,

    handleOpenGamesImport,
    handleCloseGamesImport,
    handleGamesImportPreviewReady,
  }
}
