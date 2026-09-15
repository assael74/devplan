// features/playersDatabase/ui/pages/teamPage/hooks/useTeamSeasonStatsDelete.js

import * as React from 'react'
import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../../../services/write/index.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { buildWriteReportFromError } from '../logic/writeFlowReport.logic.js'

export default function useTeamSeasonStatsDelete({
  leagueId,
  leagueDoc,
  leagueDocuments = [],
  team,
  seasonOptions = [],
  notify,
  reload,
}) {
  const [open, setOpen] = React.useState(false)
  const [selectedSeasonOptionKey, setSelectedSeasonOptionKey] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [writeReport, setWriteReport] = React.useState(null)
  const selectedSeasonOption = React.useMemo(() => (
    seasonOptions.find(option => option.optionKey === selectedSeasonOptionKey) || null
  ), [seasonOptions, selectedSeasonOptionKey])
  const actionLeagueId = selectedSeasonOption?.leagueId || leagueId
  const actionLeagueDoc = React.useMemo(() => (
    leagueDocuments.find(document => (
      String(document?.id || document?.leagueId || '').trim() === String(actionLeagueId || '').trim()
    )) || leagueDoc
  ), [actionLeagueId, leagueDoc, leagueDocuments])

  const openModal = React.useCallback(() => {
    setSelectedSeasonOptionKey('')
    setOpen(true)
  }, [])
  const close = React.useCallback(() => {
    if (!busy) setOpen(false)
  }, [busy])

  const confirm = React.useCallback(async () => {
    if (!selectedSeasonOption) return
    setBusy(true)
    try {
      const result = await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.CLEAR_TEAM_SEASON_STATS,
        payload: {
          target: selectedSeasonOption.target,
          league: {
            ...(actionLeagueDoc || {}),
            id: actionLeagueId,
            leagueId: actionLeagueId,
          },
          season: {
            ...(selectedSeasonOption.season || {}),
            leagueId: actionLeagueId,
            seasonId: selectedSeasonOption.seasonId,
            seasonKey: selectedSeasonOption.seasonKey,
          },
          team,
        },
      })
      notify({
        status: SNACK_STATUS.SUCCESS,
        title: 'סטטיסטיקת העונה נמחקה',
        message: `${result.clearedPlayersCount || 0} שחקני סגל נשארו ללא סטטיסטיקה`,
      })
      setOpen(false)
      reload()
    } catch (error) {
      console.error('[playersDatabase/write-flow]', error?.writeReport || error)
      setOpen(false)
      if (error?.results?.teamCanonicalCommitted) reload()
      setWriteReport(buildWriteReportFromError({
        error,
        flow: 'clearTeamSeasonStats',
      }))
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'מחיקת סטטיסטיקת העונה נכשלה',
        message: 'נפתח דוח כתיבה מפורט לבדיקה',
      })
    } finally {
      setBusy(false)
    }
  }, [actionLeagueDoc, actionLeagueId, notify, reload, selectedSeasonOption, team])

  return {
    open,
    seasonOptions,
    selectedSeasonOptionKey,
    selectedSeasonOption,
    busy,
    writeReport,
    openModal,
    setSelectedSeasonOptionKey,
    close,
    confirm,
    closeWriteReport: () => setWriteReport(null),
  }
}
