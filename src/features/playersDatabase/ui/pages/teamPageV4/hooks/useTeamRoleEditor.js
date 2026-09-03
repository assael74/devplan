// features/playersDatabase/ui/pages/teamPage/hooks/useTeamRoleEditor.js

import * as React from 'react'

import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../../../services/write/index.js'
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
  reload,
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
      await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SEASON_ROLE,
        payload: {
          target: selectedSeasonOption.target,
          league: leagueDoc || { id: leagueId },
          season: {
            ...(selectedSeasonOption.season || {}),
            leagueId,
            ageGroupId: team.ageGroupId,
            seasonId: selectedSeasonOption.seasonId,
            seasonKey: selectedSeasonOption.seasonKey,
          },
          team,
          player: row,
          primaryPosition: draft.primaryPosition,
          positionLayer: draft.positionLayer,
          numShirt: row.numShirt || row.number || '',
        },
      })

      notify({
        status: SNACK_STATUS.SUCCESS,
        title: 'השינוי נשמר',
        message: row.fullName,
      })

      setRow(null)
      setDraft(EMPTY_ROLE_DRAFT)
      reload()
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
    leagueDoc,
    leagueId,
    notify,
    reload,
    row,
    selectedSeasonOption,
    team,
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
