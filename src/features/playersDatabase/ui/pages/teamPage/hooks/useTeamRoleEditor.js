// src/features/playersDatabase/ui/pages/teamPage/hooks/useTeamRoleEditor.js

import * as React from 'react'

import { updatePlayerRole } from '../../../../services/write/player/edits/updatePlayerRootManual.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'

const EMPTY_ROLE_DRAFT = {
  positionLayer: '',
  primaryPosition: '',
}

export default function useTeamRoleEditor({
  leagueId,
  leagueDoc,
  team,
  selectedSeasonOption,
  notify,
}) {
  const [row, setRow] = React.useState(null)
  const [draft, setDraft] = React.useState(EMPTY_ROLE_DRAFT)
  const [busy, setBusy] = React.useState(false)

  const open = React.useCallback(player => {
    setRow(player)
    setDraft({
      positionLayer: player.positionLayer || '',
      primaryPosition: player.primaryPosition || '',
    })
  }, [])

  const close = React.useCallback(() => {
    if (busy) return

    setRow(null)
    setDraft(EMPTY_ROLE_DRAFT)
  }, [busy])

  const confirm = React.useCallback(async () => {
    if (!selectedSeasonOption || !row) return

    setBusy(true)

    try {
      await updatePlayerRole({
        playerId: row.playerId,
        primaryPosition: draft.primaryPosition,
        positionLayer: draft.positionLayer,
      })

      notify({
        status: SNACK_STATUS.SUCCESS,
        title: 'השינוי נשמר',
        message: row.fullName,
      })

      setRow(null)
      setDraft(EMPTY_ROLE_DRAFT)
    } catch (error) {
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'שמירת השינוי נכשלה',
        message: error?.message || 'שגיאה בעדכון עמדה או חוליה',
      })
    } finally {
      setBusy(false)
    }
  }, [
    draft.positionLayer,
    draft.primaryPosition,
    notify,
    row,
    selectedSeasonOption,
  ])

  const changed = Boolean(
    row &&
      (
        draft.positionLayer !== (row.positionLayer || '') ||
        draft.primaryPosition !== (row.primaryPosition || '')
      )
  )

  return {
    row,
    draft,
    busy,
    changed,
    setDraft,
    open,
    close,
    confirm,
  }
}
