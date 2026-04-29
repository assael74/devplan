// ui/forms/ClubCreateForm.js

import React, { useEffect, useMemo } from 'react'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import Box from '@mui/joy/Box'

import { getClubCreateFormLayout } from './layouts/clubCreateForm.layout.js'

import ClubNameField from '../fields/inputUi/clubs/ClubNameField'
import ClubIfaLinkField from '../fields/inputUi/clubs/ClubIfaLinkField'

import { createSx as sx } from './ui/clubs/sx/create.sx.js'

const clean = (v) => String(v ?? '').trim()

const fallback = (value, fallbackValue) => {
  return value == null ? fallbackValue : value
}

export default function ClubCreateForm({
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

  const clubName = fallback(draft.clubName, '')
  const clubIfaLink = fallback(draft.clubIfaLink, '')

  const isValid = useMemo(() => clean(clubName).length >= 2, [clubName])

  useEffect(() => {
    if (typeof onValidChange === 'function') onValidChange(isValid)
  }, [isValid, onValidChange])

  const layout = useMemo(() => {
    return getClubCreateFormLayout({ variant, isMobile })
  }, [variant, isMobile])

  return (
    <Box sx={sx.root(layout)}>
      <Box sx={sx.block(layout.topCols)}>
        <Box sx={{ minWidth: 0 }}>
          <ClubNameField
            required
            value={clubName}
            onChange={(v) => onDraft({ ...draft, clubName: v })}
            error={!isValid && clean(clubName).length > 0}
            helperText={isValid ? 'תקין' : 'נדרש מינימום 2 תווים'}
            size="sm"
          />
        </Box>
      </Box>

      <Box sx={sx.block(layout.mainCols)}>
        <Box sx={{ minWidth: 0 }}>
          <ClubIfaLinkField
            value={clubIfaLink}
            onChange={(v) => onDraft({ ...draft, clubIfaLink: v })}
            size="sm"
            required={false}
          />
        </Box>
      </Box>
    </Box>
  )
}
