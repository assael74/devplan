// features/playersDatabase/ui/pages/teamPage/hooks/usePlayerUrlEditor.js

import * as React from 'react'

import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../../../services/write/index.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'

export default function usePlayerUrlEditor({
  leagueId,
  leagueDoc,
  team,
  selectedSeasonOption,
  notify,
  reload,
}) {
  const [row, setRow] = React.useState(null)
  const [saving, setSaving] = React.useState(false)

  const open = React.useCallback(playerRow => {
    setRow(playerRow)
  }, [])

  const close = React.useCallback(() => {
    if (saving) return
    setRow(null)
  }, [saving])

  const save = React.useCallback(async playerUrl => {
    if (!row || !selectedSeasonOption) return

    setSaving(true)

    try {
      await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SEASON_URL,
        payload: {
          target: selectedSeasonOption.target,
          league: leagueDoc || { id: leagueId },
          season: {
            ...(selectedSeasonOption.season || {}),
            leagueId,
            ageGroupId: team.ageGroupId,
            seasonId: selectedSeasonOption.season?.seasonId ||
              selectedSeasonOption.seasonId,
            seasonKey: selectedSeasonOption.season?.seasonKey ||
              selectedSeasonOption.seasonKey,
          },
          team,
          player: {
            ...row,
            playerUrl,
          },
        },
      })

      notify({
        status: SNACK_STATUS.SUCCESS,
        title: 'קישור השחקן נשמר',
        message: row.fullName || row.playerName || '',
      })

      setRow(null)
      reload()
    } catch (error) {
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'שמירת הקישור נכשלה',
        message: error?.message || 'שגיאה בעדכון קישור השחקן',
      })
    } finally {
      setSaving(false)
    }
  }, [leagueDoc, leagueId, notify, reload, row, selectedSeasonOption, team])

  return {
    row,
    open,
    close,
    save,
    saving,
  }
}
