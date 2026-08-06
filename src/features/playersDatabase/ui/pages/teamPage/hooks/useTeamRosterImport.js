// features/playersDatabase/ui/pages/teamPage/hooks/useTeamRosterImport.js

import * as React from 'react'

import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../../../services/write/index.js'
import {
  resolveTeamPlayerIdentityPreview,
} from '../../../../services/write/players/index.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { parsePlayerRosterRows } from '../logic/teamRosterImport.logic.js'
import { buildWriteReportFromError } from '../logic/writeFlowReport.logic.js'

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
  const [writeReport, setWriteReport] = React.useState(null)

  const buildSeason = React.useCallback(() => ({
    ...(selectedSeasonOption?.season || {}),
    leagueId,
    ageGroupId: team.ageGroupId,
    birthYear: team.birthYear,
    seasonId: selectedSeasonOption?.seasonId,
    seasonKey: selectedSeasonOption?.seasonKey,
  }), [leagueId, selectedSeasonOption, team.ageGroupId, team.birthYear])

  const parse = React.useCallback(async () => {
    const parsedRows = parsePlayerRosterRows(pasteValue)

    if (!parsedRows.length || !selectedSeasonOption) {
      setRows(parsedRows)
      return
    }

    setBusy(true)

    try {
      const previewRows = await resolveTeamPlayerIdentityPreview({
        players: parsedRows,
        season: buildSeason(),
      })

      setRows(previewRows)
    } catch (error) {
      console.error('[playersDatabase/identity-preview]', error)
      setRows(parsedRows.map(row => ({
        ...row,
        identityStatus: 'נדרשת בדיקה',
        identityMessage: 'בדיקת הזהות נכשלה',
        identityValid: false,
      })))
    } finally {
      setBusy(false)
    }
  }, [buildSeason, pasteValue, selectedSeasonOption])

  const changeCell = React.useCallback(({ rowIndex, column, value }) => {
    setRows(currentRows => currentRows.map((row, index) => (
      index === rowIndex
        ? {
          ...row,
          [column.key]: value,
          identityStatus: 'יש לעדכן תצוגה',
          identityMessage: 'לחץ שוב על הצג נתונים',
          identityValid: false,
        }
        : row
    )))
  }, [])

  const getRowStatus = React.useCallback(row => ({
    valid: row?.identityValid !== false,
    message: row?.identityValid === false
      ? row.identityMessage || 'נדרשת בדיקת זהות'
      : '',
  }), [])

  const hasIdentityErrors = rows.some(row => row.identityValid === false)

  const closeWriteReport = React.useCallback(() => {
    setWriteReport(null)
  }, [])

  const close = React.useCallback(() => {
    if (busy) return
    setOpen(false)
  }, [busy])

  const confirm = React.useCallback(async () => {
    if (!selectedSeasonOption || hasIdentityErrors) return

    setBusy(true)

    try {
      await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.PASTE_TEAM_PLAYERS,
        payload: {
          target: selectedSeasonOption.target,
          league: leagueDoc || { id: leagueId },
          season: buildSeason(),
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
      console.error('[playersDatabase/write-flow]', error?.writeReport || error)
      setOpen(false)
      setWriteReport(buildWriteReportFromError({
        error,
        flow: 'pasteTeamPlayers',
      }))

      notify({
        status: SNACK_STATUS.ERROR,
        title: 'טעינת סגל נכשלה',
        message: 'נפתח דוח כתיבה מפורט לבדיקה',
      })
    } finally {
      setBusy(false)
    }
  }, [
    buildSeason,
    hasIdentityErrors,
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
    writeReport,
    hasIdentityErrors,
    setOpen,
    setPasteValue,
    parse,
    changeCell,
    getRowStatus,
    close,
    closeWriteReport,
    confirm,
  }
}
