// src/features/playersDatabase/ui/pages/leaguePage/hooks/useLeagueUrlEditor.js

import * as React from 'react'

import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../../../services/write/index.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'

export default function useLeagueUrlEditor({
  league,
  leagueDoc,
  selectedSeasonOption,
  notify,
  reload,
}) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const close = React.useCallback(() => {
    if (saving) return
    setOpen(false)
  }, [saving])

  const save = React.useCallback(async seasonUrl => {
    if (!selectedSeasonOption) return

    setSaving(true)

    try {
      await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_LEAGUE_SEASON_URL,
        payload: {
          target: selectedSeasonOption.target,
          league: leagueDoc || league,
          season: {
            ...(selectedSeasonOption.season || {}),
            leagueId: league.id,
            seasonId: selectedSeasonOption.seasonId,
            seasonKey: selectedSeasonOption.seasonKey,
          },
          seasonUrl,
        },
      })

      notify({
        status: SNACK_STATUS.SUCCESS,
        title: 'קישור הליגה נשמר',
        message: league.name || '',
      })

      await reload()
      setOpen(false)
    } catch (error) {
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'שמירת קישור הליגה נכשלה',
        message: error?.message || 'שגיאה בעדכון קישור הליגה',
      })
    } finally {
      setSaving(false)
    }
  }, [league, leagueDoc, notify, reload, selectedSeasonOption])

  return {
    open,
    saving,
    show: () => setOpen(true),
    close,
    save,
  }
}
