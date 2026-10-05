import * as React from 'react'

import { updatePlayerSeasonGoalDistribution } from '../../../../services/write/roster/edits/updatePlayerSeasonManual.js'

export default function usePlayerGoalDistributionEditor({
  player,
  selectedRow,
  notify,
}) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const show = React.useCallback(() => {
    setOpen(true)
  }, [])

  const close = React.useCallback(() => {
    if (!saving) setOpen(false)
  }, [saving])

  const save = React.useCallback(async goalDistribution => {
    if (!selectedRow || saving) return

    setSaving(true)
    try {
      await updatePlayerSeasonGoalDistribution({
        playerId: player.playerId,
        teamId: selectedRow.teamId,
        teamSeasonDocumentId: selectedRow.teamSeasonDocumentId,
        seasonId: selectedRow.seasonId,
        scoringGames: goalDistribution.scoringGames,
      })
      notify({
        status: 'success',
        message: 'פיזור השערים נשמר.',
      })
      setOpen(false)
    } catch (error) {
      notify({
        status: 'error',
        message: error?.message || 'שמירת פיזור השערים נכשלה.',
      })
    } finally {
      setSaving(false)
    }
  }, [notify, player, saving, selectedRow])

  return {
    open,
    saving,
    show,
    close,
    save,
  }
}
