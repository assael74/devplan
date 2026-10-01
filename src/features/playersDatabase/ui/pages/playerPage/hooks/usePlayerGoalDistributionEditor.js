import * as React from 'react'

import { updatePlayerSeasonGoalDistribution } from '../../../../services/writeV2/edits/player/updateGoalDistribution.js'

export default function usePlayerGoalDistributionEditor({
  player,
  selectedRow,
  notify,
  reload,
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
        playerDocumentId:
          player.domain?.identity?.playerDocumentId || player.id,
        birthTeamId: selectedRow.birthTeamId || selectedRow.teamId,
        birthTeamDocumentId:
          selectedRow.birthTeamDocumentId || selectedRow.teamDocumentId,
        seasonKey: selectedRow.seasonKey,
        scoringGames: goalDistribution.scoringGames,
      })
      notify({
        status: 'success',
        message: 'פיזור השערים נשמר.',
      })
      setOpen(false)
      void reload().catch(() => {})
    } catch (error) {
      notify({
        status: 'error',
        message: error?.message || 'שמירת פיזור השערים נכשלה.',
      })
    } finally {
      setSaving(false)
    }
  }, [notify, player, reload, saving, selectedRow])

  return {
    open,
    saving,
    show,
    close,
    save,
  }
}
