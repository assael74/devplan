// features/playersDatabase/ui/pages/leagueCenterPage/hooks/useLeagueSeasonCreate.js

import * as React from 'react'

import { useSnackbar } from '../../../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { mapFirestoreErrorToDetails } from '../../../../../../ui/core/feedback/snackbar/snackbar.format.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../../../services/write/index.js'
import { buildServiceLeague } from '../logic/leagueCenter.logic.js'

export default function useLeagueSeasonCreate({ onSuccess } = {}) {
  const { notify } = useSnackbar()
  const [league, setLeague] = React.useState(null)
  const [busy, setBusy] = React.useState(false)
  const [writeReport, setWriteReport] = React.useState(null)

  const open = React.useCallback(row => {
    setLeague(row)
  }, [])

  const close = React.useCallback(() => {
    if (busy) return
    setLeague(null)
  }, [busy])

  const confirm = React.useCallback(async payload => {
    const row = payload?.league || league
    const serviceLeague = buildServiceLeague(row)
    const season = payload?.season || {}

    setBusy(true)

    try {
      const result = await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.UPSERT_LEAGUE_SEASON,
        payload: {
          league: serviceLeague,
          season: {
            ...season,
            leagueId: serviceLeague.id,
          },
          target: season.target,
        },
      })

      if (typeof onSuccess === 'function') {
        await onSuccess(result)
      }

      notify({
        status: SNACK_STATUS.SUCCESS,
        title: 'העונה נוצרה',
        message: `${serviceLeague.name || 'ליגה'} - ${result.seasonKey}`,
      })

      setLeague(null)
    } catch (error) {
      setLeague(null)
      setWriteReport(error?.writeReport || {
        flow: 'createLeagueSeason',
        status: 'failed',
        failedStage: error?.stage || 'unknown',
        message: error?.message || 'יצירת העונה נכשלה',
        completedStages: Object.keys(error?.results || {}),
        failures: [{
          code: error?.code || 'WRITE_FLOW_FAILED',
          message: error?.message || 'יצירת העונה נכשלה',
        }],
        duplicates: [],
        results: error?.results || {},
      })

      notify({
        status: SNACK_STATUS.ERROR,
        title: 'יצירת העונה נכשלה',
        message: serviceLeague.name || 'ליגה',
        details: mapFirestoreErrorToDetails(error),
      })
    } finally {
      setBusy(false)
    }
  }, [league, notify, onSuccess])

  return {
    league,
    busy,
    open,
    close,
    confirm,
    writeReport,
    closeWriteReport: () => setWriteReport(null),
  }
}
