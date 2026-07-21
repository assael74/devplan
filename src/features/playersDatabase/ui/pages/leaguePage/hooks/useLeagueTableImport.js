// features/playersDatabase/ui/pages/leaguePage/hooks/useLeagueTableImport.js

import * as React from 'react'

import { useSnackbar } from '../../../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { mapFirestoreErrorToDetails } from '../../../../../../ui/core/feedback/snackbar/snackbar.format.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../../catalog/clubs.catalog.js'
import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../../../services/write/index.js'
import {
  buildLeagueImportPreview,
  buildServiceLeague,
  buildServiceRows,
  buildServiceSeason,
  formatGoalDifference,
} from '../logic/leagueImport.logic.js'

export function useLeagueTableImport({
  league = {},
  leagueDoc = {},
  selectedSeasonOption = {},
  reload,
} = {}) {
  const { notify } = useSnackbar()
  const [open, setOpen] = React.useState(false)
  const [pasteValue, setPasteValue] = React.useState('')
  const [rows, setRows] = React.useState([])
  const [busy, setBusy] = React.useState(false)
  const [previewMessage, setPreviewMessage] = React.useState('')

  const handlePreview = React.useCallback(() => {
    const preview = buildLeagueImportPreview({
      text: pasteValue,
      league,
      leagueDoc,
      selectedSeasonOption,
    })

    setRows(preview.rows || [])
    setPreviewMessage(preview.message || '')
  }, [pasteValue, league, leagueDoc, selectedSeasonOption])

  const handleCellChange = React.useCallback(({ rowIndex, column, value }) => {
    setRows(currentRows => currentRows.map((row, index) => {
      if (index !== rowIndex) return row

      const nextRow = {
        ...row,
        [column.key]: value,
      }

      if (column.key === 'clubId') {
        const club = PLAYERS_DATABASE_CLUBS_CATALOG.find(item => item.id === value)
        nextRow.clubName = club?.name || ''
      }

      if (column.key === 'teamSlot') nextRow.teamSlot = value || '1'
      if (column.key === 'goalDifference') {
        nextRow.goalDifference = formatGoalDifference(value)
      }

      return nextRow
    }))
  }, [])

  const handleConfirm = React.useCallback(async () => {
    const serviceLeague = buildServiceLeague({ league, leagueDoc })
    const serviceSeason = buildServiceSeason({
      league,
      leagueDoc,
      selectedSeasonOption,
    })
    const serviceRows = buildServiceRows({
      rows,
      league: serviceLeague,
      season: serviceSeason,
    })

    setBusy(true)

    try {
      const result = await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.PASTE_LEAGUE_TABLE,
        payload: {
          league: serviceLeague,
          season: serviceSeason,
          target: selectedSeasonOption?.target || 'current',
          rows: serviceRows,
        },
      })

      notify({
        status: SNACK_STATUS.SUCCESS,
        title: 'טבלת הליגה נשמרה',
        message: String(result.rowsCount || serviceRows.length) + ' שורות עודכנו',
      })

      setOpen(false)
      setPasteValue('')
      setRows([])
      setPreviewMessage('')
      reload()
    } catch (error) {
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'טעינת טבלת הליגה נכשלה',
        message: serviceLeague.name || 'ליגה',
        details: mapFirestoreErrorToDetails(error),
      })
    } finally {
      setBusy(false)
    }
  }, [league, leagueDoc, selectedSeasonOption, rows, notify, reload])

  return {
    open,
    pasteValue,
    rows,
    busy,
    previewMessage,
    setOpen,
    setPasteValue,
    handlePreview,
    handleCellChange,
    handleConfirm,
    handleClose: () => setOpen(false),
    handleOpen: () => setOpen(true),
  }
}
