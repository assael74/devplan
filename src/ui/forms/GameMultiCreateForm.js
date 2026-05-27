// ui/forms/GameMultiCreateForm.js

import React, { useEffect, useMemo } from 'react'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import { makeId } from '../../utils/id.js'
import GameMultiCreateFields from './ui/games/GameMultiCreateFields.js'
import { getGameMultiCreateFormLayout } from './layouts/gameMultiCreateForm.layout.js'

function clean(v) {
  return String(v ?? '').trim()
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

function createGameRow(defaults = {}) {
  return {
    uiKey: makeId('gameRow'),
    rivel: '',
    gameDate: '',
    gameHour: '',
    home: defaults?.home ?? true,
    type: defaults?.type || '',
    gameDuration: defaults?.gameDuration || '',
  }
}

function getPrivateMeta(context = {}, draft = {}) {
  const player = context?.player || context?.entity || {}

  return {
    playerId: draft?.playerId || context?.playerId || player?.id || '',
    teamId: draft?.teamId || context?.teamId || player?.teamId || '',
    clubId: draft?.clubId || context?.clubId || player?.clubId || '',
    teamName: draft?.teamName || player?.teamName || player?.team?.teamName || '',
    clubName: draft?.clubName || player?.clubName || player?.club?.clubName || '',
    isPrivatePlayer: true,
    gameSource: 'external',
    isExternalGame: true,
  }
}

function normalizeDraft(draft = {}, context = {}, isPrivatePlayer = false) {
  const defaults = {
    type: draft?.defaults?.type || draft?.type || '',
    gameDuration: draft?.defaults?.gameDuration || draft?.gameDuration || '',
    home: draft?.defaults?.home ?? true,
  }

  const rawGames = Array.isArray(draft?.games) ? draft.games : []

  const games = rawGames.map((game) => ({
    uiKey: game?.uiKey || makeId('gameRow'),
    rivel: game?.rivel || '',
    gameDate: game?.gameDate || '',
    gameHour: game?.gameHour || '',
    home: game?.home ?? defaults.home,
    type: game?.type || defaults.type,
    gameDuration: game?.gameDuration || defaults.gameDuration,
  }))

  while (games.length < 2) {
    games.push(createGameRow(defaults))
  }

  if (isPrivatePlayer) {
    return {
      ...getPrivateMeta(context, draft),
      defaults,
      games: games.slice(0, 10),
    }
  }

  return {
    teamId: draft?.teamId || context?.team?.id || '',
    clubId: draft?.clubId || context?.team?.club?.id || '',
    defaults,
    games: games.slice(0, 10),
  }
}

export default function GameMultiCreateForm({
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

  const normalizedDraft = useMemo(() => {
    return normalizeDraft(draft, context, isPrivatePlayer)
  }, [draft, context, isPrivatePlayer])

  useEffect(() => {
    const needsBaseSync =
      !Array.isArray(draft?.games) ||
      draft?.games.length < 2 ||
      !draft?.defaults

    const needsRegularSync =
      !isPrivatePlayer &&
      (!draft?.teamId || !draft?.clubId)

    const needsPrivateSync =
      isPrivatePlayer &&
      (
        !draft?.playerId ||
        !draft?.teamName ||
        !draft?.clubName ||
        draft?.gameSource !== 'external' ||
        draft?.isExternalGame !== true
      )

    if (needsBaseSync || needsRegularSync || needsPrivateSync) {
      onDraft(normalizedDraft)
    }
  }, [draft, normalizedDraft, isPrivatePlayer, onDraft])

  const validity = useMemo(() => {
    const rows = normalizedDraft?.games || []

    const rowValidity = rows.map((row) => {
      const okRivel = !!clean(row?.rivel)
      const okDate = !!clean(row?.gameDate)
      const okHour = !!clean(row?.gameHour)
      const okHome = row?.home === true || row?.home === false
      const okType = !!clean(row?.type || normalizedDraft?.defaults?.type)
      const okGameDuration = !!clean(row?.gameDuration || normalizedDraft?.defaults?.gameDuration)

      return {
        okRivel,
        okDate,
        okHour,
        okHome,
        okType,
        okGameDuration,
        isValid: okRivel && okDate && okHour && okHome && okType && okGameDuration,
      }
    })

    const okPrivateMeta =
      !isPrivatePlayer ||
      (
        !!clean(normalizedDraft?.playerId) &&
        !!clean(normalizedDraft?.teamName) &&
        !!clean(normalizedDraft?.clubName)
      )

    return {
      total: rows.length,
      rowValidity,
      isValid:
        rows.length >= 2 &&
        rows.length <= 10 &&
        okPrivateMeta &&
        rowValidity.every((item) => item.isValid),
    }
  }, [normalizedDraft, isPrivatePlayer])

  useEffect(() => {
    onValidChange(validity.isValid)
  }, [validity.isValid, onValidChange])

  const layout = useMemo(() => {
    return getGameMultiCreateFormLayout({ variant, isMobile })
  }, [variant, isMobile])

  return (
    <GameMultiCreateFields
      draft={normalizedDraft}
      onDraft={onDraft}
      context={context}
      validity={validity}
      layout={layout}
      isPrivatePlayer={isPrivatePlayer}
    />
  )
}
