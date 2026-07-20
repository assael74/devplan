// features/playersDatabase/components/profilesPage/hooks/useProfileRowLinks.js

import { useState } from 'react'

import { updatePlayerRowLinks } from '../../../services/pdbPlayers.firestore.js'
import { markLeagueBoardCacheDirty } from '../../summary/hooks/leagueBoardCache.js'

export function useProfileRowLinks(invalidateProfileDocuments) {
  const [row, setRow] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const open = (profileRow, playerRow) => {
    setRow(profileRow && playerRow ? { profileRow, playerRow } : null)
    setError('')
  }

  const close = () => {
    if (saving) return

    setRow(null)
    setError('')
  }

  const save = async value => {
    if (!row?.playerRow) return

    setSaving(true)
    setError('')

    try {
      await updatePlayerRowLinks(row.playerRow, value)
      invalidateProfileDocuments(row.profileRow?.id)
      markLeagueBoardCacheDirty()
      setRow(null)
    } catch (err) {
      setError(err?.message || 'שמירת קישור השורה נכשלה')
    } finally {
      setSaving(false)
    }
  }

  return {
    row,
    saving,
    error,
    open,
    close,
    save,
  }
}
