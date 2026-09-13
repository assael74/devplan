import * as React from 'react'

import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../../../services/write/index.js'

export default function usePlayerAgentEditor({
  player,
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

  const save = React.useCallback(async agent => {
    if (saving) return

    setSaving(true)
    try {
      await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_AGENT,
        payload: {
          player: {
            playerId: player.playerId || player.id,
            playerDocumentId:
              player.domain?.identity?.playerDocumentId || player.id,
            externalPlayerId: player.externalPlayerId,
          },
          agent,
        },
      })
      notify({
        status: 'success',
        message: 'פרטי הסוכן נשמרו.',
      })
      setOpen(false)
      reload()
    } catch (error) {
      notify({
        status: 'error',
        message: error?.message || 'שמירת פרטי הסוכן נכשלה.',
      })
    } finally {
      setSaving(false)
    }
  }, [notify, player, reload, saving])

  return {
    open,
    saving,
    show,
    close,
    save,
  }
}
