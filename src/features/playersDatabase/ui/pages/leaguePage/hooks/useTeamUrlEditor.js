// features/playersDatabase/ui/pages/leaguePage/hooks/useTeamUrlEditor.js

import * as React from 'react'

import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../../../services/write/index.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'

export default function useTeamUrlEditor({
  leagueId,
  leagueDoc,
  selectedSeasonOption,
  notify,
  reload,
}) {
  const [row, setRow] = React.useState(null)
  const [saving, setSaving] = React.useState(false)

  const open = React.useCallback(teamRow => {
    setRow(teamRow)
  }, [])

  const close = React.useCallback(() => {
    if (saving) return
    setRow(null)
  }, [saving])

  const save = React.useCallback(async teamUrl => {
    if (!row || !selectedSeasonOption) return

    setSaving(true)

    try {
      await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_TEAM_URL,
        payload: {
          target: selectedSeasonOption.target,
          league: leagueDoc || { id: leagueId },
          season: {
            ...(selectedSeasonOption.season || {}),
            leagueId,
            seasonId: selectedSeasonOption.seasonId,
            seasonKey: selectedSeasonOption.seasonKey,
          },
          team: {
            ...row,
            teamUrl,
          },
        },
      })

      notify({
        status: SNACK_STATUS.SUCCESS,
        title: 'קישור הקבוצה נשמר',
        message: row.name || row.teamName || '',
      })

      await reload()
      setRow(null)
    } catch (error) {
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'שמירת הקישור נכשלה',
        message: error?.message || 'שגיאה בעדכון קישור הקבוצה',
      })
    } finally {
      setSaving(false)
    }
  }, [leagueDoc, leagueId, notify, reload, row, selectedSeasonOption])

  return {
    row,
    open,
    close,
    save,
    saving,
  }
}
