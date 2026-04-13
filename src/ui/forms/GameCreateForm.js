// ui/forms/GameCreateForm.js

import React, { useEffect, useMemo } from 'react'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import GameCreateFields from './ui/games/GameCreateFields.js'
import { getGameCreateFormLayout } from './layouts/gameCreateForm.layout.js'

const clean = (value) => String(value ?? '').trim()

const isValidDateFormat = (value) => {
  const date = clean(value)
  if (!date) return false

  return /^\d{4}-\d{2}-\d{2}$/.test(date) || /^\d{2}\/\d{2}\/\d{4}$/.test(date)
}

function getFieldErrors(draft = {}) {
  const gameDate = clean(draft?.gameDate)
  const rivel = clean(draft?.rivel)
  const type = clean(draft?.type)
  const gameDuration = clean(draft?.gameDuration)
  const home = draft?.home

  return {
    gameDate: !gameDate || !isValidDateFormat(gameDate),
    rivel: !rivel,
    type: !type,
    gameDuration: !gameDuration,
    home: home !== true && home !== false,
  }
}

function getIsValid(draft = {}) {
  return !Object.values(getFieldErrors(draft)).some(Boolean)
}

export default function GameCreateForm({
  draft = {},
  onDraft,
  onValidChange,
  context = {},
  variant = 'modal',
  forceMobile = false,
  isPrivatePlayer = false,
}) {
  const theme = useTheme()
  const isMobileViewport = useMediaQuery(theme.breakpoints.down('sm'))
  const isMobile = forceMobile || isMobileViewport

  const fieldErrors = useMemo(() => getFieldErrors(draft), [draft])
  const isValid = useMemo(() => getIsValid(draft), [draft])

  useEffect(() => {
    onValidChange(isValid)
  }, [isValid, onValidChange])

  const layout = useMemo(() => {
    return getGameCreateFormLayout({ variant, isMobile })
  }, [variant, isMobile])

  return (
    <GameCreateFields
      draft={draft}
      onDraft={onDraft}
      context={context}
      fieldErrors={fieldErrors}
      layout={layout}
      isPrivatePlayer={isPrivatePlayer}
    />
  )
}
