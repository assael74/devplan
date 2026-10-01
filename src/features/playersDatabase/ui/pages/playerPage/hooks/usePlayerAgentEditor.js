import * as React from 'react'

import { updatePlayerAgent } from '../../../../services/writeV2/edits/player/updateAgent.js'

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
      await updatePlayerAgent({
        playerDocumentId:
          player.domain?.identity?.playerDocumentId || player.id,
        agent,
      })
      notify({
        status: 'success',
        message: 'פרטי הסוכן נשמרו.',
      })
      setOpen(false)
      void reload().catch(() => {})
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
