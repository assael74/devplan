// features/playersDatabase/ui/pages/leaguePage/hooks/useLeagueSeasonTeamsDelete.js

import * as React from 'react'
import { useSnackbar } from '../../../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../../../services/write/index.js'

export default function useLeagueSeasonTeamsDelete({
  league,
  leagueDoc,
  selectedSeasonOption,
  reload,
}) {
  const { notify } = useSnackbar()
  const [open, setOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [writeReport, setWriteReport] = React.useState(null)

  const confirm = React.useCallback(async () => {
    if (!selectedSeasonOption) return
    setBusy(true)

    try {
      const result = await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.CLEAR_LEAGUE_SEASON_TEAMS,
        payload: {
          target: selectedSeasonOption.target,
          league: {
            ...(leagueDoc || {}),
            ...league,
            id: league.id,
          },
          season: {
            ...(selectedSeasonOption.season || {}),
            leagueId: league.id,
            seasonId: selectedSeasonOption.seasonId,
            seasonKey: selectedSeasonOption.seasonKey,
          },
        },
      })

      notify({
        status: SNACK_STATUS.SUCCESS,
        title: 'קבוצות העונה נמחקו',
        message: `${result.removedTeamsCount || 0} קבוצות הוסרו מהעונה`,
      })
      setOpen(false)
      reload()
    } catch (error) {
      console.error('[playersDatabase/write-flow]', error?.writeReport || error)
      setOpen(false)
      setWriteReport(error?.writeReport || {
        flow: 'clearLeagueSeasonTeams',
        status: 'failed',
        failedStage: error?.stage || 'unknown',
        message: error?.message || 'מחיקת קבוצות העונה נכשלה',
        completedStages: Object.keys(error?.results || {}),
        failures: [{
          code: error?.code || 'WRITE_FLOW_FAILED',
          message: error?.message || 'מחיקת קבוצות העונה נכשלה',
        }],
        duplicates: [],
        results: error?.results || {},
      })
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'מחיקת קבוצות העונה נכשלה',
        message: 'נפתח דוח כתיבה מפורט לבדיקה',
      })
    } finally {
      setBusy(false)
    }
  }, [league, leagueDoc, notify, reload, selectedSeasonOption])

  return {
    open,
    busy,
    writeReport,
    setOpen,
    confirm,
    close: () => !busy && setOpen(false),
    closeWriteReport: () => setWriteReport(null),
  }
}
