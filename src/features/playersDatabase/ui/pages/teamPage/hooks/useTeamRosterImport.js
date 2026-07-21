// features/playersDatabase/ui/pages/teamPage/hooks/useTeamRosterImport.js

import * as React from 'react'

import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../../../services/write/index.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { parsePlayerRosterRows } from '../logic/teamRosterImport.logic.js'

export default function useTeamRosterImport({
  leagueId,
  leagueDoc,
  team,
  selectedSeasonOption,
  notify,
  reload,
}) {
  const [open, setOpen] = React.useState(false)
  const [pasteValue, setPasteValue] = React.useState('')
  const [rows, setRows] = React.useState([])
  const [busy, setBusy] = React.useState(false)

  const parse = React.useCallback(() => {
    setRows(parsePlayerRosterRows(pasteValue))
  }, [pasteValue])

  const changeCell = React.useCallback(({ rowIndex, column, value }) => {
    setRows(currentRows => currentRows.map((row, index) => (
      index === rowIndex
        ? { ...row, [column.key]: value }
        : row
    )))
  }, [])

  const close = React.useCallback(() => {
    if (busy) return
    setOpen(false)
  }, [busy])

  const confirm = React.useCallback(async () => {
    if (!selectedSeasonOption) return

    setBusy(true)

    try {
      await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.PASTE_TEAM_PLAYERS,
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
          players: rows,
        },
      })

      notify({
        status: SNACK_STATUS.SUCCESS,
        title: 'טעינת סגל הושלמה',
        message: `${rows.length} שורות עודכנו`,
      })

      setOpen(false)
      setPasteValue('')
      setRows([])
      reload()
    } catch (error) {
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'טעינת סגל נכשלה',
        message: error?.message || 'שגיאה בעדכון סגל השנתון',
      })
    } finally {
      setBusy(false)
    }
  }, [
    leagueDoc,
    leagueId,
    notify,
    reload,
    rows,
    selectedSeasonOption,
    team,
  ])

  return {
    open,
    pasteValue,
    rows,
    busy,
    setOpen,
    setPasteValue,
    parse,
    changeCell,
    close,
    confirm,
  }
}
