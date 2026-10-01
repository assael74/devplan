// src/features/playersDatabase/ui/pages/clubPage/hooks/useClubUrlEditor.js

import { useState } from 'react'
import { saveEditor } from '../../../hooks/saveEditor.js'
import { updateClubUrl } from '../../../../services/writeV2/edits/club/updateUrl.js'

export default function useClubUrlEditor({ clubId, reload, notify }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const save = async clubUrl => {
    if (saving) return
    await saveEditor({
      write: () => updateClubUrl({ clubId, clubUrl }),
      reload,
      reloadAfterSuccess: false,
      notify,
      close: () => setOpen(false),
      setSaving,
      title: 'קישור המועדון נשמר',
    })
  }

  return {
    open,
    saving,
    save,
    show: () => setOpen(true),
    close: () => {
      if (!saving) setOpen(false)
    },
  }
}
