import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Box from '@mui/joy/Box'
import CircularProgress from '@mui/joy/CircularProgress'

import PublicStateView from '../components/PublicStateView.js'
import AbilitiesPublicPage from './AbilitiesPublicPage.js'

import {
  getAbilitiesInviteByTokenApi,
  markAbilitiesInviteOpenedApi,
  submitAbilitiesInviteFormApi,
} from '../invites/abilitiesInvites.api.js'

import { resolveInviteViewState } from '../invites/abilitiesInvites.helpers.js'

function clean(v) {
  return String(v ?? '').trim()
}

export default function AbilitiesPublicRoutePage() {
  const { token } = useParams()

  const [loading, setLoading] = useState(true)
  const [invite, setInvite] = useState(null)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let active = true

    async function run() {
      try {
        setLoading(true)
        setLoadError('')
        setInvite(null)

        const safeToken = clean(token)
        if (!safeToken) {
          if (!active) return
          setInvite(null)
          return
        }

        const found = await getAbilitiesInviteByTokenApi(safeToken)

        if (!active) return

        if (!found) {
          setInvite(null)
          return
        }

        const opened = await markAbilitiesInviteOpenedApi(found)

        if (!active) return
        setInvite(opened)
      } catch (error) {
        if (!active) return
        setLoadError(error?.message || 'טעינת הטופס נכשלה')
      } finally {
        if (active) setLoading(false)
      }
    }

    run()

    return () => {
      active = false
    }
  }, [token])

  const state = useMemo(() => resolveInviteViewState(invite), [invite])

  if (loading) {
    return (
      <Box sx={{ minHeight: '50vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress size="lg" />
      </Box>
    )
  }

  if (loadError) {
    return (
      <PublicStateView
        color="danger"
        title="שגיאה בטעינת הטופס"
        text={loadError}
      />
    )
  }

  if (state === 'invalid') {
    return (
      <PublicStateView
        color="danger"
        title="קישור לא תקין"
        text="לא נמצא טופס מתאים לקישור הזה."
      />
    )
  }

  if (state === 'expired') {
    return (
      <PublicStateView
        color="warning"
        title="תוקף הקישור פג"
        text="יש לפנות למועדון לקבלת קישור חדש."
      />
    )
  }

  if (state === 'cancelled') {
    return (
      <PublicStateView
        color="warning"
        title="הקישור בוטל"
        text="הטופס הזה כבר אינו זמין."
      />
    )
  }

  if (state === 'submitted') {
    return (
      <PublicStateView
        color="success"
        title="הטופס כבר הוגש"
        text="הערכת היכולות כבר התקבלה במערכת."
      />
    )
  }

  return (
    <AbilitiesPublicPage
      invite={invite}
      onSubmit={submitAbilitiesInviteFormApi}
    />
  )
}
