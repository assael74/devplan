/// ui/forms/TeamCreateForm.js

import React, { useEffect, useMemo } from 'react'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import Box from '@mui/joy/Box'

import TeamCreateFields from './ui/teams/TeamCreateFields.js'

import { getTeamCreateFormLayout } from './layouts/teamCreateForm.layout.js'

const clean = (v) => String(v ?? '').trim()

export default function TeamCreateForm({
  draft = {},
  onDraft,
  onValidChange,
  context = {},
  variant = 'modal',
  forceMobile = false,
  clubDisabled = false
}) {
  const theme = useTheme()
  const isMobileViewport = useMediaQuery(theme.breakpoints.down('sm'))
  const isMobile = forceMobile || isMobileViewport

  const teamName = draft?.teamName || ''
  const clubId = draft?.clubId || ''
  const teamYear = draft?.teamYear || ''
  const isProject = draft?.isProject === true
  const teamIfaLink = draft?.teamIfaLink || ''
  const clubs = context?.clubs || []

  const validity = useMemo(() => {
    const okName = clean(teamName).length >= 2
    const okClub = !!clean(clubId)
    const okYear = !!clean(teamYear)
    return { okName, okClub, okYear, isValid: okName && okClub && okYear }
  }, [teamName, clubId, teamYear])

  useEffect(() => {
    if (typeof onValidChange === 'function') onValidChange(validity.isValid)
  }, [validity.isValid, onValidChange])

  const nameErr = !validity.okName && clean(teamName).length > 0
  const clubErr = !validity.okClub && clean(clubId).length > 0
  const yearErr = !validity.okYear && clean(teamYear).length > 0

  const layout = useMemo(() => {
    return getTeamCreateFormLayout({ variant, isMobile })
  }, [variant, isMobile])

  return (
    <TeamCreateFields
      draft={draft}
      onDraft={onDraft}
      onValidChange={onValidChange}
      context={context}
      validity={validity}
      layout={layout}
    />
  )
}
