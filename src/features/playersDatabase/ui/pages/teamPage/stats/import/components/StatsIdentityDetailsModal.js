// src/features/playersDatabase/ui/pages/teamPage/stats/import/components/StatsIdentityDetailsModal.js
import * as React from 'react'
import { FormControl, FormLabel, Input, Stack, Typography } from '@mui/joy'
import RegularModal from '../../../../../components/modals/RegularModal.js'

export default function StatsIdentityDetailsModal({ selection, onClose, onSave }) {
  const [externalPlayerId, setExternalPlayerId] = React.useState('')
  const [playerUrl, setPlayerUrl] = React.useState('')
  const [error, setError] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  React.useEffect(() => {
    if (!selection) return
    setExternalPlayerId(selection.row.externalPlayerId || '')
    setPlayerUrl(selection.row.playerUrl || '')
    setError('')
  }, [selection])
  const save = async () => {
    setSaving(true)
    setError('')
    try {
      await onSave({ rowIndex: selection.rowIndex, rowId: selection.row.id, externalPlayerId, playerUrl })
      onClose()
    } catch (failure) {
      setError(failure.message || 'בדיקת זהות השחקן נכשלה')
    } finally {
      setSaving(false)
    }
  }
  return (
    <RegularModal open={Boolean(selection)} title='פרטי זיהוי שחקן' description={selection?.row.fullName || ''}
      size='sm' busy={saving} disabled={saving || !externalPlayerId.trim() || !playerUrl.trim()}
      confirmLabel='אישור פרטים' onConfirm={save} onClose={() => { if (!saving) onClose() }}>
      <Stack spacing={1.5}>
        <FormControl required disabled={saving}>
          <FormLabel>מזהה שחקן בהתאחדות</FormLabel>
          <Input value={externalPlayerId} onChange={event => setExternalPlayerId(event.target.value)} slotProps={{ input: { inputMode: 'numeric' } }} />
        </FormControl>
        <FormControl required disabled={saving}>
          <FormLabel>קישור לעמוד השחקן</FormLabel>
          <Input value={playerUrl} onChange={event => setPlayerUrl(event.target.value)} />
        </FormControl>
        {error ? <Typography role='alert' color='danger' level='body-sm'>{error}</Typography> : null}
      </Stack>
    </RegularModal>
  )
}
