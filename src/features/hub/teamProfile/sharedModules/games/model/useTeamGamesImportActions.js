// src/features/hub/teamProfile/sharedModules/games/model/useTeamGamesImportActions.js

import { useCallback, useEffect, useRef, useState } from 'react'

import { createEntity, unwrapActionResult } from '../../../../application/index.js'
import { useCreateRequest } from '../../../../../../application/actions/entities/useCreateRequest.js'

export function useTeamGamesImportActions({
  liveTeam,
  context,
  gamesImportRequest = 0,
} = {}) {
  const [gamesImportOpen, setGamesImportOpen] = useState(false)
  const [gamesImportSaving, setGamesImportSaving] = useState(false)
  const [gamesImportError, setGamesImportError] = useState('')
  const { getCreateRequest, clearCreateRequest } = useCreateRequest()

  const lastImportRequest = useRef(0)

  const handleOpenGamesImport = useCallback(() => {
    if (gamesImportSaving) return

    clearCreateRequest()
    setGamesImportError('')
    setGamesImportOpen(true)
  }, [clearCreateRequest, gamesImportSaving])

  useEffect(() => {
    if (lastImportRequest.current === gamesImportRequest) return
    lastImportRequest.current = gamesImportRequest
    if (gamesImportRequest > 0) handleOpenGamesImport()
  }, [gamesImportRequest, handleOpenGamesImport])

  function handleCloseGamesImport() {
    if (gamesImportSaving) return

    setGamesImportOpen(false)
    setGamesImportError('')
  }

  async function handleGamesImportPreviewReady({ payload } = {}) {
    if (gamesImportSaving) return

    const teamId = liveTeam?.id || context?.teamId || ''
    const clubId = liveTeam?.clubId || context?.clubId || ''

    setGamesImportError('')

    if (!teamId || !clubId) {
      setGamesImportError('חסר מזהה קבוצה או מועדון. לא ניתן לבצע ייבוא.')
      console.error('games import blocked: missing teamId or clubId', {
        teamId,
        clubId,
      })
      return
    }

    const finalPayload = {
      ...payload,
      teamId,
      clubId,
      defaults: {
        teamId,
        clubId,
      },
    }

    try {
      setGamesImportSaving(true)

      unwrapActionResult(await createEntity({
        entityType: 'games',
        draft: finalPayload,
        request: getCreateRequest(finalPayload),
        context: {
          ...context,
          teamId,
          clubId,
          team: liveTeam,
        },
      }))

      setGamesImportOpen(false)
      setGamesImportError('')
    } catch (error) {
      setGamesImportError('ייבוא המשחקים נכשל. בדוק את הנתונים ונסה שוב.')
      console.error('games import save failed', error)
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
