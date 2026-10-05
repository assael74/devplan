import * as React from 'react'

import { updatePlayerAgent } from '../../../../services/write/player/edits/updatePlayerRootManual.js'

export default function usePlayerAgentEditor({
  player,
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

  const save = React.useCallback(async agent => {
    if (saving) return

    setSaving(true)
    try {
      await updatePlayerAgent({
        playerId: player.playerId,
        agent,
      })
      notify({
        status: 'success',
        message: 'פרטי הסוכן נשמרו.',
      })
      setOpen(false)
    } catch (error) {
      notify({
        status: 'error',
        message: error?.message || 'שמירת פרטי הסוכן נכשלה.',
      })
    } finally {
      setSaving(false)
    }
  }, [notify, player, saving])

  return {
    open,
    saving,
    show,
    close,
    save,
  }
}
