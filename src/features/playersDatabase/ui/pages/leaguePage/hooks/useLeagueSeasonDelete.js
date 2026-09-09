import * as React from 'react'

import { useSnackbar } from '../../../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../../../services/write/index.js'

export default function useLeagueSeasonDelete({
  league,
  leagueDoc,
  selectedSeasonOption,
  onSuccess,
} = {}) {
  const { notify } = useSnackbar()
  const [open, setOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [writeReport, setWriteReport] = React.useState(null)

  const confirm = React.useCallback(async () => {
    if (!selectedSeasonOption || busy) return
    setBusy(true)

    try {
      const result = await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.DELETE_LEAGUE_SEASON,
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

      const removedLeagueDocument = Boolean(
        result?.leagueSeasonResult?.removedLeagueDocument
      )
      notify({
        status: SNACK_STATUS.SUCCESS,
        title: removedLeagueDocument ? 'הליגה נמחקה' : 'עונת הליגה נמחקה',
        message: removedLeagueDocument
          ? 'זו הייתה ליגה שאינה בקטלוג, ולכן גם מסמך הליגה הוסר.'
          : `עונת ${selectedSeasonOption.seasonKey} הוסרה`,
      })
      setOpen(false)

      if (typeof onSuccess === 'function') {
        await onSuccess(result)
      }
    } catch (error) {
      setOpen(false)
      setWriteReport(error?.writeReport || {
        flow: 'deleteLeagueSeason',
        status: 'failed',
        failedStage: error?.stage || 'unknown',
        message: error?.message || 'מחיקת עונת הליגה נכשלה',
        completedStages: Object.keys(error?.results || {}),
        failures: [{
          code: error?.code || 'WRITE_FLOW_FAILED',
          message: error?.message || 'מחיקת עונת הליגה נכשלה',
        }],
        duplicates: [],
        results: error?.results || {},
      })
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'מחיקת עונת הליגה נכשלה',
        message: 'העונה תימחק רק לאחר ניקוי הקבוצות, השחקנים והאינדקסים שלה.',
      })
    } finally {
      setBusy(false)
    }
  }, [busy, league, leagueDoc, notify, onSuccess, selectedSeasonOption])

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
