// src/features/hub/domain/hub.state.js

import { useMemo, useState, useCallback } from 'react'
import { useHubSelectors } from './hub.selectors'
import { createHubSelectionHandlers } from './hub.selection'

export const HUB_MODE = {
  CLUBS: 'clubs',
  TEAMS: 'teams',
  PLAYERS: 'players',
  PRIVATES: 'privates',
  SCOUTING: 'scouting',
}

function getEmptySelection(mode) {
  if (mode === HUB_MODE.CLUBS) return { type: 'club', id: null }
  if (mode === HUB_MODE.TEAMS) return { type: 'team', id: null }
  if (mode === HUB_MODE.PLAYERS) return { type: 'player', id: null }
  if (mode === HUB_MODE.PRIVATES) return { type: 'player', id: null }
  if (mode === HUB_MODE.SCOUTING) return { type: 'scout', id: null }

  return { type: 'club', id: null }
}

export function useHubState({
  corePlayers,
  coreClubs,
  coreTeams,
  coreScouting,
  initialMode = HUB_MODE.CLUBS,
}) {
  const [mode, setMode] = useState(initialMode)
  const [query, setQuery] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [controlSelection, setControlSelection] = useState(
    getEmptySelection(initialMode)
  )
  const [selectionByMode, setSelectionByMode] = useState({})

  const {
    playersUi,
    clubPlayersUi,
    privatePlayersUi,
    playersById,
    clubsById,
    teamsById,
    scoutsById,
    filteredPlayers,
    clubGroups,
    scoutRows,
    counts,
  } = useHubSelectors({
    corePlayers,
    coreClubs,
    coreTeams,
    coreScouting,
    query,
    mode,
  })

  const resolvedEntity = useMemo(() => {
    const type = controlSelection?.type
    const id = controlSelection?.id

    if (!type || !id) return null

    if (type === 'player') return playersById[id] || null
    if (type === 'club') return clubsById[id] || null
    if (type === 'team') return teamsById[id] || null
    if (type === 'scout') return scoutsById[id] || null

    return null
  }, [controlSelection, playersById, clubsById, teamsById, scoutsById])

  const controlSelectionView = useMemo(() => {
    if (!resolvedEntity) {
      return {
        type: controlSelection.type,
        data: null,
      }
    }

    return {
      type: controlSelection.type,
      data: resolvedEntity,
    }
  }, [resolvedEntity, controlSelection.type])

  const cacheSelectionForMode = useCallback((nextMode, selection) => {
    if (!nextMode || !selection) return

    setSelectionByMode((prev) => ({
      ...prev,
      [nextMode]: selection,
    }))
  }, [])

  const getCachedSelectionForMode = useCallback(
    (nextMode) => selectionByMode[nextMode] || null,
    [selectionByMode]
  )

  const setModeSafe = useCallback(
    (nextMode) => {
      setMode((prevMode) => {
        const resolvedMode = nextMode || HUB_MODE.PLAYERS
        if (prevMode === resolvedMode) return prevMode

        cacheSelectionForMode(prevMode, controlSelection)

        setSelectedPlayer(null)
        setDrawerOpen(false)

        const cached = selectionByMode[resolvedMode] || null
        setControlSelection(cached || getEmptySelection(resolvedMode))

        return resolvedMode
      })
    },
    [cacheSelectionForMode, controlSelection, selectionByMode]
  )

  const selection = useMemo(
    () =>
      createHubSelectionHandlers({
        MODE: HUB_MODE,
        playersUi,
        clubsById,
        teamsById,
        setMode: setModeSafe,
        setDrawerOpen,
        setSelectedPlayer,
        setControlSelection: (next) => {
          const type = next?.type
          const id = next?.data?.id || next?.id || null

          setControlSelection({ type, id })
        },
      }),
    [playersUi, clubsById, teamsById, setModeSafe]
  )

  return {
    MODE: HUB_MODE,
    mode,
    query,
    drawerOpen,
    selectedPlayer,

    controlSelection: controlSelectionView,
    rawControlSelection: controlSelection,

    setControlSelection,
    cacheSelectionForMode,
    getCachedSelectionForMode,

    counts,
    clubPlayersUi,
    privatePlayersUi,
    filteredPlayers,
    clubGroups,
    scoutRows,

    setMode: setModeSafe,
    setQuery,
    setDrawerOpen,

    ...selection,
  }
}
