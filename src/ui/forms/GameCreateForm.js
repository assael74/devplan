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

const getIsPrivatePlayer = (context = {}, draft = {}) => {
  const player = context?.player || context?.entity || {}

  return (
    context?.isPrivatePlayer === true ||
    draft?.isPrivatePlayer === true ||
    player?.isPrivatePlayer === true ||
    player?.playerSource === 'private'
  )
}

const buildEffectiveDraft = ({ draft = {}, context = {}, isPrivatePlayer }) => {
  if (!isPrivatePlayer) return draft

  const player = context?.player || context?.entity || {}

  return {
    ...draft,
    playerId: draft?.playerId || context?.playerId || player?.id || '',
    teamId: draft?.teamId || context?.teamId || player?.teamId || '',
    clubId: draft?.clubId || context?.clubId || player?.clubId || '',
    teamName: draft?.teamName || player?.teamName || player?.team?.teamName || '',
    clubName: draft?.clubName || player?.clubName || player?.club?.clubName || '',
    isSelected: draft?.isSelected ?? true,
    isStarting: draft?.isStarting ?? false,
    goals: draft?.goals ?? 0,
    assists: draft?.assists ?? 0,
    timePlayed: draft?.timePlayed ?? 0,
    gameSource: 'external',
    isExternalGame: true,
    isPrivatePlayer: true,
  }
}

function getFieldErrors(draft = {}, isPrivatePlayer = false) {
  const gameDate = clean(draft?.gameDate)
  const rivel = clean(draft?.rivel)
  const type = clean(draft?.type)
  const gameDuration = clean(draft?.gameDuration)
  const home = draft?.home

  return {
    playerId: isPrivatePlayer && !clean(draft?.playerId),
    teamName: isPrivatePlayer && !clean(draft?.teamName),
    clubName: isPrivatePlayer && !clean(draft?.clubName),
    gameDate: !gameDate || !isValidDateFormat(gameDate),
    rivel: !rivel,
    type: !type,
    gameDuration: !gameDuration,
    home: home !== true && home !== false,
  }
}

function getIsValid(draft = {}, isPrivatePlayer = false) {
  return !Object.values(getFieldErrors(draft, isPrivatePlayer)).some(Boolean)
}

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

  const isPrivatePlayer = useMemo(() => {
    return getIsPrivatePlayer(context, draft)
  }, [context, draft])

  const effectiveDraft = useMemo(() => {
    return buildEffectiveDraft({
      draft,
      context,
      isPrivatePlayer,
    })
  }, [draft, context, isPrivatePlayer])

  const fieldErrors = useMemo(() => {
    return getFieldErrors(effectiveDraft, isPrivatePlayer)
  }, [effectiveDraft, isPrivatePlayer])

  const isValid = useMemo(() => {
    return getIsValid(effectiveDraft, isPrivatePlayer)
  }, [effectiveDraft, isPrivatePlayer])

  useEffect(() => {
    onValidChange(isValid)
  }, [isValid, onValidChange])

  useEffect(() => {
    if (!isPrivatePlayer) return

    const needsSync =
      effectiveDraft?.playerId !== draft?.playerId ||
      effectiveDraft?.teamName !== draft?.teamName ||
      effectiveDraft?.clubName !== draft?.clubName ||
      effectiveDraft?.gameSource !== draft?.gameSource ||
      effectiveDraft?.isExternalGame !== draft?.isExternalGame

    if (!needsSync) return

    onDraft(effectiveDraft)
  }, [draft, effectiveDraft, isPrivatePlayer, onDraft])

  const layout = useMemo(() => {
    return getGameCreateFormLayout({ variant, isMobile })
  }, [variant, isMobile])

  return (
    <GameCreateFields
      draft={effectiveDraft}
      onDraft={onDraft}
      context={context}
      fieldErrors={fieldErrors}
      layout={layout}
      isPrivatePlayer={isPrivatePlayer}
    />
  )
}
