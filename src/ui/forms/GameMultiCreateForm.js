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

function normalizeDraft(draft = {}, context = {}) {
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

  return {
    teamId: draft?.teamId || context?.team?.id || '',
    clubId: draft?.clubId || context?.team?.club?.id || '',
    defaults,
    games: games.slice(0, 10),
  }
}

export default function GameMultiCreateForm({
  draft,
  onDraft,
  onValidChange,
  context = {},
  variant = 'modal',
  forceMobile = false,
}) {
  const theme = useTheme()
  const isMobileViewport = useMediaQuery(theme.breakpoints.down('sm'))
  const isMobile = forceMobile || isMobileViewport

  const normalizedDraft = useMemo(() => {
    return normalizeDraft(draft, context)
  }, [draft, context])

  useEffect(() => {
    const needsSync =
      !Array.isArray(draft?.games) ||
      draft?.games.length < 2 ||
      !draft?.defaults ||
      !draft?.teamId ||
      !draft?.clubId

    if (needsSync) {
      onDraft?.(normalizedDraft)
    }
  }, [draft, normalizedDraft, onDraft])

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

    return {
      total: rows.length,
      rowValidity,
      isValid:
        rows.length >= 2 &&
        rows.length <= 10 &&
        rowValidity.every((item) => item.isValid),
    }
  }, [normalizedDraft])

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
    />
  )
}
