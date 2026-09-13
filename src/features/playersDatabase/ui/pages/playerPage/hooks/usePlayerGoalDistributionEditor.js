import * as React from 'react'

import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../../../services/write/index.js'

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
      await runPlayersDatabaseWriteAction({
        actionType:
          PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SEASON_GOAL_DISTRIBUTION,
        payload: {
          target: selectedRow.target || 'current',
          season: {
            seasonId: selectedRow.seasonId || selectedRow.seasonKey,
            seasonKey: selectedRow.seasonKey,
          },
          team: {
            teamId: selectedRow.teamId,
            birthTeamId: selectedRow.birthTeamId || selectedRow.teamId,
            teamDocumentId:
              selectedRow.birthTeamDocumentId || selectedRow.teamId,
            birthTeamDocumentId:
              selectedRow.birthTeamDocumentId || selectedRow.teamId,
          },
          player: {
            playerId: player.playerId || player.id,
            playerDocumentId:
              player.domain?.identity?.playerDocumentId || player.id,
            externalPlayerId: player.externalPlayerId,
          },
          ...goalDistribution,
        },
      })
      notify({
        status: 'success',
        message: 'פיזור השערים נשמר.',
      })
      setOpen(false)
      reload()
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
