// features/playersDatabase/ui/pages/teamPage/hooks/useTeamSeasonPlayersDelete.js

import * as React from 'react'
import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../../../services/write/index.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { buildWriteReportFromError } from '../logic/writeFlowReport.logic.js'

export default function useTeamSeasonPlayersDelete({
  leagueId,
  leagueDoc,
  team,
  selectedSeasonOption,
  notify,
  reload,
}) {
  const [open, setOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [writeReport, setWriteReport] = React.useState(null)

  const close = React.useCallback(() => {
    if (!busy) setOpen(false)
  }, [busy])

  const confirm = React.useCallback(async () => {
    if (!selectedSeasonOption) return
    setBusy(true)

    try {
      const result = await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.CLEAR_TEAM_SEASON_PLAYERS,
        payload: {
          target: selectedSeasonOption.target,
          league: leagueDoc || { id: leagueId },
          season: {
            ...(selectedSeasonOption.season || {}),
            leagueId,
            seasonId: selectedSeasonOption.seasonId,
            seasonKey: selectedSeasonOption.seasonKey,
          },
          team,
        },
      })

      const removedPlayersCount = result.removedPlayersCount || 0
      notify({
        status: SNACK_STATUS.SUCCESS,
        title: removedPlayersCount
          ? 'שחקני העונה נמחקו'
          : 'מצב הקבוצה עודכן',
        message: removedPlayersCount
          ? `${removedPlayersCount} שחקנים הוסרו`
          : 'עונת הקבוצה נורמלה ונשמרה מחדש',
      })
      setOpen(false)
      reload()
    } catch (error) {
      console.error('[playersDatabase/write-flow]', error?.writeReport || error)
      setOpen(false)
      setWriteReport(buildWriteReportFromError({
        error,
        flow: 'clearTeamSeasonPlayers',
      }))
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'מחיקת שחקני העונה נכשלה',
        message: 'נפתח דוח כתיבה מפורט לבדיקה',
      })
    } finally {
      setBusy(false)
    }
  }, [leagueDoc, leagueId, notify, reload, selectedSeasonOption, team])

  return {
    open,
    busy,
    writeReport,
    setOpen,
    close,
    confirm,
    closeWriteReport: () => setWriteReport(null),
  }
}
