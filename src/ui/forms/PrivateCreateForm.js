/// ui/forms/PrivateCreateForm.js

import React, { useEffect, useMemo } from 'react'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import Box from '@mui/joy/Box'

import PrivateCreateFields from './ui/privates/PrivateCreateFields.js'

import { getPrivateCreateFormLayout } from './layouts/privateCreateForm.layout.js'

const clean = (v) => String(v ?? '').trim()

export default function PrivateCreateForm({
  draft = {},
  onDraft,
  onValidChange,
  context = {},
  variant = 'modal',
  forceMobile = false,
}) {
  const theme = useTheme()
  const isMobileViewport = useMediaQuery(theme.breakpoints.down('sm'))
  const isMobile = forceMobile || isMobileViewport

  const playerFirstName = draft?.playerFirstName || ''
  const playerLastName = draft?.playerLastName || ''
  const clubName = draft?.clubName || ''
  const teamName = draft?.teamName || ''
  const birth = draft?.birth || ''

  const validity = useMemo(() => {
    const okFirst = clean(playerFirstName).length >= 2
    const okLast = clean(playerLastName).length >= 2
    const okClub = !!clean(clubName)
    const okTeam = !!clean(teamName)
    const okBirth = !!clean(birth)
    return { okFirst, okLast, okClub, okTeam, okBirth, isValid: okFirst && okLast && okClub && okTeam && okBirth }
  }, [playerFirstName, playerLastName, clubName, teamName, birth])

  useEffect(() => {
    onValidChange(validity.isValid)
  }, [validity.isValid, onValidChange])

  const layout = useMemo(() => {
    return getPrivateCreateFormLayout({ variant, isMobile })
  }, [variant, isMobile])

  return (
    <PrivateCreateFields
      draft={draft}
      onDraft={onDraft}
      onValidChange={onValidChange}
      context={context}
      validity={validity}
      layout={layout}
    />
  )
}
