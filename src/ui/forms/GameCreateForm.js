// ui/forms/GameCreateForm.js

import React, { useEffect, useMemo } from 'react'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import GameCreateFields from './ui/games/GameCreateFields.js'
import { getGameCreateFormLayout } from './layouts/gameCreateForm.layout.js'

const clean = (v) => String(v ?? '').trim()

export default function GameCreateForm({
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

  const gameDate = draft?.gameDate || ''
  const rivel = draft?.rivel || ''
  const home = draft?.home || ''
  const type = draft?.type || ''
  const gameDuration = draft?.gameDuration || ''

  const validity = useMemo(() => {
    const okDate = !!clean(gameDate)
    const okRivel = !!clean(rivel)
    const okType = !!clean(type)
    const okGameDuration = !!clean(gameDuration)
    const okHome = !!clean(home)

    return {
      okDate,
      okRivel,
      okType,
      okGameDuration,
      okHome,
      isValid: okDate && okRivel && okType && okGameDuration && okHome,
    }
  }, [gameDate, rivel, type, home, gameDuration])

  useEffect(() => {
    onValidChange(validity.isValid)
  }, [validity.isValid, onValidChange])

  const layout = useMemo(() => {
    return getGameCreateFormLayout({ variant, isMobile })
  }, [variant, isMobile])

  return (
    <GameCreateFields
      draft={draft}
      onDraft={onDraft}
      onValidChange={onValidChange}
      context={context}
      validity={validity}
      layout={layout}
    />
  )
}
