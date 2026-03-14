/// ui/forms/PlayerCreateForm.js

import React, { useEffect, useMemo } from 'react'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import Box from '@mui/joy/Box'

import PlayerCreateFields from './ui/players/PlayerCreateFields.js'

import { getPlayerCreateFormLayout } from './layouts/playerCreateForm.layout.js'

const clean = (v) => String(v ?? '').trim()

export default function PlayerCreateForm({
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
  const clubId = draft?.clubId || ''
  const teamId = draft?.teamId || ''
  const birth = draft?.birth || ''
  const clubs = context?.clubs || []
  const teams = context?.teams || []

  const validity = useMemo(() => {
    const okFirst = clean(playerFirstName).length >= 2
    const okLast = clean(playerLastName).length >= 2
    const okClub = !!clean(clubId)
    const okTeam = !!clean(teamId)
    const okBirth = !!clean(birth)
    return { okFirst, okLast, okClub, okTeam, okBirth, isValid: okFirst && okLast && okClub && okTeam && okBirth }
  }, [playerFirstName, playerLastName, clubId, teamId, birth])

  useEffect(() => {
    onValidChange(validity.isValid)
  }, [validity.isValid, onValidChange])

  const layout = useMemo(() => {
    return getPlayerCreateFormLayout({ variant, isMobile })
  }, [variant, isMobile])

  return (
    <PlayerCreateFields
      draft={draft}
      onDraft={onDraft}
      onValidChange={onValidChange}
      context={context}
      validity={validity}
      layout={layout}
    />
  )
}
