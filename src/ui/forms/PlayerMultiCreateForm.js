/// ui/forms/PlayerMultiCreateForm.js

import React, { useEffect, useMemo } from 'react'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import { makeId } from '../../utils/id.js'
import PlayerMultiCreateFields from './ui/players/PlayerMultiCreateFields.js'
import { getPlayerMultiCreateFormLayout } from './layouts/playerMultiCreateForm.layout.js'

function clean(v) {
  return String(v ?? '').trim()
}

function createPlayerRow(defaults = {}) {
  return {
    uiKey: makeId('playerRow'),
    playerFirstName: '',
    playerLastName: '',
    month: '',
    year: defaults?.teamYear || '',
    teamId: defaults?.teamId || '',
    clubId: defaults?.clubId || '',
  }
}

function normalizeDraft(draft = {}, context = {}) {
  const teamId = draft?.teamId || context?.team?.id || ''
  const clubId = draft?.clubId || context?.team?.club?.id || ''
  const year = draft?.year || context?.team?.teamYear || ''

  const defaults = {
    teamId: draft?.defaults?.teamId || teamId,
    clubId: draft?.defaults?.clubId || clubId,
    year: draft?.defaults?.year || year,
  }

  const rawPlayers = Array.isArray(draft?.players) ? draft.players : []

  const players = rawPlayers.map((player) => ({
    uiKey: player?.uiKey || makeId('playerRow'),
    playerFirstName: player?.playerFirstName || '',
    playerLastName: player?.playerLastName || '',
    year: player?.year || '',
    month: player?.month || '',
    year: player?.year || defaults.year,
    teamId: player?.teamId || defaults.teamId,
    clubId: player?.clubId || defaults.clubId,
  }))

  while (players.length < 2) {
    players.push(createPlayerRow(defaults))
  }

  return {
    teamId,
    clubId,
    year,
    defaults,
    players: players.slice(0, 10),
  }
}

export default function PlayerMultiCreateForm({
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

  const normalizedDraft = useMemo(() => {
    return normalizeDraft(draft, context)
  }, [draft, context])

  useEffect(() => {
    const needsSync =
      !Array.isArray(draft?.players) ||
      draft?.players.length < 2 ||
      !draft?.defaults ||
      !draft?.teamId ||
      !draft?.clubId ||
      !draft?.year

    if (needsSync) {
      onDraft(normalizedDraft)
    }
  }, [draft, normalizedDraft, onDraft])

  const validity = useMemo(() => {
    const rows = normalizedDraft?.players || []

    const rowValidity = rows.map((row) => {
      const okFirstName = !!clean(row?.playerFirstName)
      const okLastName = !!clean(row?.playerLastName)

      const okYear = clean(row?.year)
      const okMonth = clean(row?.month)

      return {
        okFirstName,
        okLastName,
        okYear,
        okMonth,
        isValid: okFirstName && okLastName && okYear && okMonth,
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
    return getPlayerMultiCreateFormLayout({ variant, isMobile })
  }, [variant, isMobile])

  return (
    <PlayerMultiCreateFields
      draft={normalizedDraft}
      onDraft={onDraft}
      context={context}
      validity={validity}
      layout={layout}
    />
  )
}
