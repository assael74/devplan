// features/playersDatabase/ui/pages/leagueCenterPage/hooks/useLeagueSeasonCreate.js

import * as React from 'react'
import { useNavigate } from 'react-router-dom'

import { useSnackbar } from '../../../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { mapFirestoreErrorToDetails } from '../../../../../../ui/core/feedback/snackbar/snackbar.format.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import {
  ensureLeagueDoc,
  upsertLeagueSeason,
} from '../../../../services/write/index.js'
import { PLAYERS_DATABASE_UI_ROUTES } from '../../../logic/routeBuilders.js'
import { buildServiceLeague } from '../logic/leagueCenter.logic.js'

export default function useLeagueSeasonCreate() {
  const navigate = useNavigate()
  const { notify } = useSnackbar()
  const [league, setLeague] = React.useState(null)
  const [busy, setBusy] = React.useState(false)

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
      await ensureLeagueDoc(serviceLeague)

      const result = await upsertLeagueSeason({
        league: serviceLeague,
        season: {
          ...season,
          leagueId: serviceLeague.id,
        },
        target: season.target,
      })

      notify({
        status: SNACK_STATUS.SUCCESS,
        title: 'העונה נוצרה',
        message: `${serviceLeague.name || 'ליגה'} - ${result.seasonKey}`,
      })

      setLeague(null)
      navigate(PLAYERS_DATABASE_UI_ROUTES.league(serviceLeague.id))
    } catch (error) {
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'יצירת העונה נכשלה',
        message: serviceLeague.name || 'ליגה',
        details: mapFirestoreErrorToDetails(error),
      })
    } finally {
      setBusy(false)
    }
  }, [league, navigate, notify])

  return {
    league,
    busy,
    open,
    close,
    confirm,
  }
}
