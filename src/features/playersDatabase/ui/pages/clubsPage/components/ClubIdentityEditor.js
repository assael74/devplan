// src/features/playersDatabase/ui/pages/clubsPage/components/ClubIdentityEditor.js

import { useEffect, useRef, useState } from 'react'
import { Alert, FormControl, FormLabel, Input, Stack, Textarea, Typography } from '@mui/joy'
import RegularModal from '../../../components/modals/RegularModal.js'
import { readClubProfileDocument } from '../../../../services/read/pages/clubs.read.js'
import { updateClubIdentity } from '../../../../services/write/club/clubIdentity.write.js'
import { uniqueClubAliases } from '../../../../domain/clubIdentity.js'

export default function ClubIdentityEditor({
  clubId,
  open = true,
  onClose,
  onSaved,
}) {
  const [draft, setDraft] = useState(null)
  const [initial, setInitial] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const inFlight = useRef(false)

  useEffect(() => {
    if (!open) return undefined
    setLoading(true)
    setDraft(null)
    setInitial(null)
    setError('')
    let active = true
    readClubProfileDocument({ clubId, refresh: true }).then(profile => {
      if (!active) return
      if (!profile?.documentExists) throw new Error('פרופיל המועדון חסר')
      const value = {
        displayName: profile.names?.display || '',
        shortName: profile.names?.short || '',
        aliasesText: uniqueClubAliases([...(profile.aliases || []), ...(profile.searchAliases || [])]).join('\n'),
      }
      setDraft(value)
      setInitial(value)
    }).catch(failure => {
      if (active) setError(failure.message || 'טעינת המועדון נכשלה')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [clubId, open])

  const change = (field, value) => setDraft(current => ({ ...current, [field]: value }))
  const dirty = draft && JSON.stringify(draft) !== JSON.stringify(initial)
  const save = async () => {
    if (!dirty || inFlight.current) return
    inFlight.current = true
    setSaving(true)
    setError('')
    try {
      await updateClubIdentity({
        clubId,
        displayName: draft.displayName,
        shortName: draft.shortName,
        aliases: draft.aliasesText.split('\n'),
      })
    } catch (failure) {
      setError(failure.message || 'שמירת המועדון נכשלה')
      setSaving(false)
      inFlight.current = false
      return
    }
    await onSaved()
    inFlight.current = false
    setSaving(false)
    onClose()
  }

  return (
    <RegularModal
      open={open}
      title='עריכת שמות המועדון'
      description='השמות משותפים לכל קבוצות הגיל והעונות'
      size='sm'
      contentSx={{
        height: 'min(360px, calc(100dvh - 220px))',
        boxSizing: 'border-box',
        scrollbarGutter: 'stable',
      }}
      busy={saving}
      disabled={loading || !dirty || !draft?.displayName.trim()}
      onClose={onClose}
      onConfirm={save}
    >
      <Stack spacing={2}>
        {error ? <Alert color='danger'>{error}</Alert> : null}
        {loading ? <Typography>טוען את פרטי המועדון...</Typography> : null}
        {draft ? <>
          <FormControl disabled={saving} required>
            <FormLabel>שם לתצוגה</FormLabel>
            <Input value={draft.displayName} onChange={event => change('displayName', event.target.value)} />
          </FormControl>
          <FormControl disabled={saving}>
            <FormLabel>שם מקוצר</FormLabel>
            <Input value={draft.shortName} onChange={event => change('shortName', event.target.value)} />
          </FormControl>
          <FormControl disabled={saving}>
            <FormLabel>שמות נוספים לזיהוי — שם אחד בכל שורה</FormLabel>
            <Textarea
              minRows={4}
              maxRows={4}
              slotProps={{ textarea: { className: 'dpScrollThin' } }}
              value={draft.aliasesText}
              onChange={event => change('aliasesText', event.target.value)}
            />
          </FormControl>
          <Typography level='body-sm'>השם הרשמי, שם התצוגה והשם המקוצר משתתפים בזיהוי אוטומטית.</Typography>
        </> : null}
      </Stack>
    </RegularModal>
  )
}
