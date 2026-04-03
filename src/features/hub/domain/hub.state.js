// src/features/hub/domain/hub.state.js

import { useMemo, useState, useCallback } from 'react'
import { useHubSelectors } from './hub.selectors'
import { createHubSelectionHandlers } from './hub.selection'

const MODE = {
  CLUBS: 'clubs',
  TEAMS: 'teams',
  PLAYERS: 'players',
  STAFF: 'staff',
  PRIVATES: 'privates',
  SCOUTING: 'scouting',
}

const getEmptySelectionForMode = (m) => {
  if (m === MODE.CLUBS) return { type: 'club', id: null }
  if (m === MODE.TEAMS) return { type: 'team', id: null }
  if (m === MODE.PLAYERS) return { type: 'player', id: null }
  if (m === MODE.STAFF) return { type: 'staff', id: null }
  if (m === MODE.PRIVATES) return { type: 'player', id: null }
  if (m === MODE.SCOUTING) return { type: 'scout', id: null }
  return { type: 'club', id: null }
}

export function useHubState({
  corePlayers,
  coreClubs,
  coreTeams,
  coreRoles,
  coreScouting,
}) {
  const [mode, setMode] = useState(MODE.CLUBS)
  const [query, setQuery] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [previewSelection, setPreviewSelection] = useState(
    getEmptySelectionForMode(MODE.CLUBS)
  )
  const [selectionByMode, setSelectionByMode] = useState({})

  const {
    playersUi,
    playersById,
    clubsById,
    teamsById,
    rolesById,
    scoutsById,
    filteredPlayers,
    clubGroups,
    staffRows,
    scoutRows,
    counts,
  } = useHubSelectors({
    corePlayers,
    coreClubs,
    coreTeams,
    coreRoles,
    coreScouting,
    query,
    mode,
  })

  const resolvedEntity = useMemo(() => {
    const selType = previewSelection?.type
    const selId = previewSelection?.id

    if (!selType || !selId) return null

    if (selType === 'player') return playersById[selId] || null
    if (selType === 'club') return clubsById[selId] || null
    if (selType === 'team') return teamsById[selId] || null
    if (selType === 'staff') return rolesById[selId] || null
    if (selType === 'scout') return scoutsById[selId] || null

    return null
  }, [previewSelection, playersById, clubsById, teamsById, rolesById, scoutsById])

  const preview = useMemo(() => {
    if (!resolvedEntity) return { type: previewSelection.type, data: null }
    return {
      type: previewSelection.type,
      data: resolvedEntity,
    }
  }, [resolvedEntity, previewSelection.type])

  const cacheSelectionForMode = useCallback((m, selection) => {
    if (!m || !selection) return
    setSelectionByMode((prev) => ({ ...prev, [m]: selection }))
  }, [])

  const getCachedSelectionForMode = useCallback(
    (m) => selectionByMode[m] || null,
    [selectionByMode]
  )

  const setModeSafe = useCallback(
    (nextMode) => {
      setMode((prevMode) => {
        const nm = nextMode || MODE.PLAYERS
        if (prevMode === nm) return prevMode

        cacheSelectionForMode(prevMode, previewSelection)

        setSelectedPlayer(null)
        setDrawerOpen(false)

        const cached = selectionByMode[nm] || null
        setPreviewSelection(cached || getEmptySelectionForMode(nm))

        return nm
      })
    },
    [cacheSelectionForMode, previewSelection, selectionByMode]
  )

  const selection = useMemo(
    () =>
      createHubSelectionHandlers({
        MODE,
        playersUi,
        clubsById,
        teamsById,
        setMode: setModeSafe,
        setDrawerOpen,
        setSelectedPlayer,
        setPreviewSelection: (next) => {
          const type = next?.type
          const id = next?.data?.id || next?.id || null
          setPreviewSelection({ type, id })
        },
      }),
    [playersUi, clubsById, teamsById, setModeSafe]
  )

  return {
    MODE,
    mode,
    query,
    drawerOpen,
    selectedPlayer,

    previewSelection: preview,
    rawSelection: previewSelection,

    setPreviewSelection,
    cacheSelectionForMode,
    getCachedSelectionForMode,

    counts,
    filteredPlayers,
    clubGroups,
    staffRows,
    scoutRows,

    setMode: setModeSafe,
    setQuery,
    setDrawerOpen,

    ...selection,
  }
}
