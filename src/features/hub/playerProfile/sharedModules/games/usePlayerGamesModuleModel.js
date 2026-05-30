// playerProfile/sharedModules/games/usePlayerGamesModuleModel.js

import { useEffect, useMemo, useState } from 'react'

import {
  createInitialPlayerGamesFilters,
  resolvePlayerGamesFiltersDomain,
  sortPlayerGamesRows,
} from '../../sharedLogic/games/module/index.js'

import {
  createGameStatsDraftFromDoc,
  createInitialGameStatsDraft,
} from '../../../../../ui/forms/gameStatsForm/logic/index.js'

import {
  getPlayerId,
  getPlayerName,
  isPlayerInSquad,
  isPlayerStarting,
  toNumber,
} from '../../../../../ui/forms/gameStatsForm/logic/core/form.helpers.js'

import {
  getGameStatsDoc,
} from '../../../../../services/firestore/shorts/gameStats/index.js'

import {
  useGameStatsHubDrafts,
  useGameStatsHubUpdate,
} from '../../../hooks/games'

import {
  isLeagueGame,
  isPrivatePlayerEntity,
} from './playerGamesModule.helpers.js'

const clean = value => String(value ?? '').trim()
const getGameSource = game => game?.game || game || {}

const getStatsScope = player => {
  return isPrivatePlayerEntity(player) ? 'privatePlayer' : 'player'
}

const getStatsSource = scope => {
  return scope === 'privatePlayer' ? 'privatePlayerProfile' : 'playerProfile'
}

const getGameId = game => {
  const source = getGameSource(game)

  return clean(
    source?.id ||
      source?.gameId ||
      game?.id ||
      game?.gameId
  )
}

const getGameStatsDocId = game => {
  const source = getGameSource(game)

  return clean(
    source?.statsDocId ||
      source?.gameStatsDocId ||
      game?.statsDocId ||
      game?.gameStatsDocId
  )
}

const getCreatedStatsDocId = ({ result, payload }) => {
  return clean(
    result?.ids?.gameStatsDocId ||
      result?.gameStatsDocId ||
      payload?.gameStatsDocId ||
      payload?.statsDocId
  )
}

const isLocalDraftSave = payload => {
  return payload?.status === 'draft'
}

const mergeStatsDocId = ({ payload, draft, gameStatsDocId }) => {
  if (!gameStatsDocId) return { payload, draft }

  return {
    payload: {
      ...(payload || {}),
      gameStatsDocId,
    },
    draft: {
      ...(draft || {}),
      gameStatsDocId,
    },
  }
}

const buildStatsDeleteAction = ({ editingStatsGame, activeStatsFormDraft, statsPayloadsByGameId }) => {
  const gameId = getGameId(editingStatsGame)
  const localDraft = gameId ? statsPayloadsByGameId?.[gameId] : null

  if (isLocalDraftSave(localDraft)) {
    return {
      type: 'localDraft',
      label: 'מחיקת טיוטה',
      color: 'danger',
      disabled: false,
    }
  }

  const firestoreDocId =
    getGameStatsDocId(editingStatsGame) ||
    activeStatsFormDraft?.gameStatsDocId ||
    activeStatsFormDraft?.statsDocId ||
    ''

  if (firestoreDocId) {
    return {
      type: 'firestoreStats',
      label: 'מחיקת טופס סטטיסטיקה',
      color: 'danger',
      disabled: false,
    }
  }

  return null
}

const getGamePlayers = game => {
  const source = getGameSource(game)

  return Array.isArray(source?.gamePlayers) ? source.gamePlayers : []
}

const indexPlayersById = players => {
  return new Map(
    (Array.isArray(players) ? players : [])
      .map(player => [clean(getPlayerId(player)), player])
      .filter(([id]) => Boolean(id))
  )
}

const findPlayerEntry = ({ game, player }) => {
  const playerId = clean(player?.id)
  const players = getGamePlayers(game)

  return players.find(item => clean(getPlayerId(item)) === playerId) || null
}

const buildPlayerEntry = ({ game, player }) => {
  const source = getGameSource(game)
  const entry = findPlayerEntry({ game, player })
  const identity = player || entry || {}

  return {
    ...(entry || {}),
    id: player?.id || entry?.id || '',
    playerId: player?.id || entry?.playerId || entry?.id || '',
    name: getPlayerName(identity),
    photo: identity?.photo || entry?.photo || '',
    position:
      entry?.position ||
      identity?.primaryPosition ||
      identity?.position ||
      '',
    isSelected: true,
    isStarting: entry?.isStarting ?? entry?.onStart ?? false,
    onSquad: entry?.onSquad ?? true,
    timePlayed: toNumber(entry?.timePlayed ?? source?.gameDuration),
    timeVideoStats: toNumber(
      entry?.timeVideoStats ??
        entry?.timePlayed ??
        source?.gameDuration
    ),
  }
}

const buildStatsDocPlayers = ({ statsDoc, game, player, contextPlayers }) => {
  const source = getGameSource(game)
  const gamePlayersById = indexPlayersById(getGamePlayers(game))
  const contextPlayersById = indexPlayersById(contextPlayers)
  const rows = Array.isArray(statsDoc?.playerStats) ? statsDoc.playerStats : []

  const statsPlayers = rows
    .map(row => {
      const playerId = clean(row?.playerId || row?.id)
      if (!playerId) return null

      const fromContext = contextPlayersById.get(playerId)
      const fromGame = gamePlayersById.get(playerId)
      const identity = fromContext || fromGame || row

      return {
        ...identity,
        id: playerId,
        playerId,
        name: getPlayerName(identity),
        photo: identity?.photo || identity?.playerPhoto || '',
        position:
          row?.position ||
          identity?.primaryPosition ||
          identity?.position ||
          '',
        isSelected: true,
        isStarting: isPlayerStarting(identity) || row?.isStarting === true,
        onSquad: isPlayerInSquad(identity) || row?.isSelected === true,
        timePlayed: toNumber(
          row?.timePlayed ??
            identity?.timePlayed ??
            source?.gameDuration
        ),
        timeVideoStats: toNumber(
          row?.timeVideoStats ??
            row?.timePlayed ??
            identity?.timeVideoStats ??
            identity?.timePlayed ??
            source?.gameDuration
        ),
      }
    })
    .filter(Boolean)

  const currentPlayerId = clean(player?.id)
  const hasCurrentPlayer = statsPlayers.some(item => item.playerId === currentPlayerId)

  if (hasCurrentPlayer || !currentPlayerId) return statsPlayers

  return [
    ...statsPlayers,
    buildPlayerEntry({ game, player }),
  ]
}

const buildPlayerStatsFormGame = ({ game, team, player, statsDoc = null, contextPlayers = [] }) => {
  const source = getGameSource(game)
  const gameId = getGameId(game)
  const teamId = clean(source?.teamId || game?.teamId || team?.id)
  const statsDocId = getGameStatsDocId(game)

  const statsPlayers = statsDoc
    ? buildStatsDocPlayers({ statsDoc, game, player, contextPlayers })
    : []

  return {
    ...source,
    id: gameId,
    gameId,
    teamId,
    statsDocId,
    gameStatsDocId: statsDocId,
    gamePlayers: statsPlayers.length
      ? statsPlayers
      : [buildPlayerEntry({ game, player })],
  }
}

const lockDraftToPlayer = ({ draft, player, scope = 'player' }) => {
  const playerId = clean(player?.id)
  if (!draft || !playerId) return draft

  const source = getStatsSource(scope)

  const lockRow = row => {
    const rowPlayerId = clean(row?.playerId || row?.id)
    const isEditable = rowPlayerId === playerId

    return {
      ...row,
      isStatsLocked: !isEditable,
      statsDisabled: !isEditable,
      readOnly: !isEditable,
      isEditableStatsPlayer: isEditable,
    }
  }

  const selectedPlayerIds = Array.isArray(draft.selectedPlayerIds)
    ? draft.selectedPlayerIds
    : []

  const nextSelectedPlayerIds = selectedPlayerIds.includes(playerId)
    ? selectedPlayerIds
    : [...selectedPlayerIds, playerId]

  return {
    ...draft,
    scope,
    source,
    activePlayerId: playerId,
    editablePlayerId: playerId,
    selectedPlayerIds: nextSelectedPlayerIds,
    players: Array.isArray(draft.players) ? draft.players.map(lockRow) : [],
    playerStats: Array.isArray(draft.playerStats) ? draft.playerStats.map(lockRow) : [],
    meta: {
      ...(draft.meta || {}),
      scope,
      source,
      playerId,
      editablePlayerId: playerId,
    },
  }
}

const createScopedInitialDraft = ({ game, team, player, scope }) => {
  return lockDraftToPlayer({
    draft: createInitialGameStatsDraft({ game, team }),
    player,
    scope,
  })
}

const buildStatsDeletePayload = ({
  gameId,
  gameStatsDocId,
  livePlayer,
  liveTeam,
  targetGame,
  draft,
  activeStatsFormDraft,
}) => {
  const scope =
    draft?.scope ||
    activeStatsFormDraft?.scope ||
    draft?.meta?.scope ||
    activeStatsFormDraft?.meta?.scope ||
    getStatsScope(livePlayer)

  const source =
    draft?.source ||
    activeStatsFormDraft?.source ||
    draft?.meta?.source ||
    activeStatsFormDraft?.meta?.source ||
    getStatsSource(scope)

  const playerId =
    livePlayer?.id ||
    draft?.playerId ||
    draft?.meta?.playerId ||
    activeStatsFormDraft?.meta?.playerId ||
    ''

  return {
    gameId,
    teamId: liveTeam?.id || draft?.teamId || targetGame?.teamId || '',
    gameStatsDocId,
    source,
    scope,
    playerId,
    meta: {
      ...(draft?.meta || {}),
      ...(activeStatsFormDraft?.meta || {}),
      playerId,
      scope,
      source,
    },
  }
}

export default function usePlayerGamesModuleModel({
  entity,
  context,
  profileData,
  gamesInsightsRequest = 0,
  seasonStartYear = 2025,
}) {
  const livePlayer = useMemo(() => {
    const players = Array.isArray(context?.players) ? context.players : []

    return players.find(player => player?.id === entity?.id) || entity || null
  }, [context?.players, entity])

  const isPrivatePlayer = isPrivatePlayerEntity(livePlayer)

  const liveTeam = useMemo(() => {
    return context?.team || profileData?.entity?.team || livePlayer?.team || null
  }, [context?.team, profileData?.entity?.team, livePlayer])

  const contextPlayers = useMemo(() => {
    return [
      ...(Array.isArray(context?.players) ? context.players : []),
      ...(Array.isArray(liveTeam?.players) ? liveTeam.players : []),
      ...(Array.isArray(profileData?.entity?.players) ? profileData.entity.players : []),
      ...(Array.isArray(profileData?.entity?.team?.players) ? profileData.entity.team.players : []),
      ...(Array.isArray(profileData?.players) ? profileData.players : []),
    ]
  }, [
    context?.players,
    liveTeam?.players,
    profileData?.entity?.players,
    profileData?.entity?.team?.players,
    profileData?.players,
  ])

  const playerScoring = useMemo(() => {
    return (
      profileData?.playerScoring ||
      profileData?.scoring?.player ||
      null
    )
  }, [profileData])

  const initialFilters = useMemo(() => createInitialPlayerGamesFilters(), [])

  const [insightsOpen, setInsightsOpen] = useState(false)
  const [editingEntryGame, setEditingEntryGame] = useState(null)
  const [editingGame, setEditingGame] = useState(null)
  const [statsFormLoading, setStatsFormLoading] = useState(false)
  const [statsFormLoadingText, setStatsFormLoadingText] = useState('')
  const [filters, setFilters] = useState(initialFilters)

  const [sort, setSort] = useState({
    by: 'date',
    direction: 'desc',
  })

  const {
    editingStatsGame,
    activeStatsFormDraft,
    statsPayloadsByGameId,
    openStatsGame,
    closeStatsForm,
    saveStatsDraft,
    deleteStatsDraft,
    statsFormDraftsByGameId,
    completeStatsFirestoreSave,
  } = useGameStatsHubDrafts()

  const {
    runSave: saveStatsToFirestore,
    runDelete: deleteStatsFromFirestore,
    pending: statsSavePending,
    error: statsSaveError,
  } = useGameStatsHubUpdate()

  const domain = useMemo(() => {
    return resolvePlayerGamesFiltersDomain(livePlayer, filters, {
      seasonStartYear,
      scoring: playerScoring,
      profileData,
    })
  }, [livePlayer, filters, seasonStartYear, playerScoring, profileData])

  const {
    summary,
    games,
    options,
    indicators,
  } = domain || {}

  const calculationGames = useMemo(() => {
    const rows = Array.isArray(games) ? games : []

    return rows.filter(isLeagueGame)
  }, [games])

  const sortedGames = useMemo(() => {
    return sortPlayerGamesRows(games, sort)
  }, [games, sort])

  const statsDeleteAction = useMemo(() => {
    return buildStatsDeleteAction({
      editingStatsGame,
      activeStatsFormDraft,
      statsPayloadsByGameId,
    })
  }, [editingStatsGame, activeStatsFormDraft, statsPayloadsByGameId])

  useEffect(() => {
    if (gamesInsightsRequest > 0) {
      setInsightsOpen(true)
    }
  }, [gamesInsightsRequest])

  const handleChangeFilters = patch => {
    setFilters(prev => ({
      ...prev,
      ...(patch || {}),
    }))
  }

  const handleResetFilters = () => {
    setFilters(createInitialPlayerGamesFilters())
  }

  const handleChangeSortBy = value => {
    setSort(prev => ({
      ...prev,
      by: value,
    }))
  }

  const handleChangeSortDirection = value => {
    setSort(prev => ({
      ...prev,
      direction: value,
    }))
  }

  const handleEditGame = game => {
    if (!isPrivatePlayer) return

    setEditingGame(game || null)
  }

  const handleOpenStatsGame = async game => {
    const statsScope = getStatsScope(livePlayer)
    const gameStatsDocId = getGameStatsDocId(game)

    if (!gameStatsDocId) {
      const formGame = buildPlayerStatsFormGame({
        game,
        team: liveTeam,
        player: livePlayer,
        contextPlayers,
      })

      openStatsGame(
        formGame,
        createScopedInitialDraft({
          game: formGame,
          team: liveTeam,
          player: livePlayer,
          scope: statsScope,
        })
      )
      return
    }

    const gameId = getGameId(game)

    if (gameId && statsFormDraftsByGameId[gameId]) {
      const formGame = buildPlayerStatsFormGame({
        game,
        team: liveTeam,
        player: livePlayer,
        contextPlayers,
      })

      openStatsGame(formGame)
      return
    }

    setStatsFormLoading(true)
    setStatsFormLoadingText('טוען סטטיסטיקה שמורה...')

    try {
      const statsDoc = await getGameStatsDoc({ gameStatsDocId })

      if (!statsDoc) {
        const formGame = buildPlayerStatsFormGame({
          game,
          team: liveTeam,
          player: livePlayer,
          contextPlayers,
        })

        openStatsGame(
          formGame,
          createScopedInitialDraft({
            game: formGame,
            team: liveTeam,
            player: livePlayer,
            scope: statsScope,
          })
        )
        return
      }

      const formGame = buildPlayerStatsFormGame({
        game,
        team: liveTeam,
        player: livePlayer,
        statsDoc,
        contextPlayers,
      })

      const loadedDraft = createGameStatsDraftFromDoc({
        game: formGame,
        team: liveTeam,
        statsDoc,
      })

      openStatsGame(
        formGame,
        lockDraftToPlayer({
          draft: loadedDraft,
          player: livePlayer,
          scope: statsScope,
        })
      )
    } catch (err) {
      console.error('[handleOpenStatsGame] failed to load player stats doc', err)

      const formGame = buildPlayerStatsFormGame({
        game,
        team: liveTeam,
        player: livePlayer,
        contextPlayers,
      })

      openStatsGame(
        formGame,
        createScopedInitialDraft({
          game: formGame,
          team: liveTeam,
          player: livePlayer,
          scope: statsScope,
        })
      )
    } finally {
      setStatsFormLoading(false)
      setStatsFormLoadingText('')
    }
  }

  const handleSaveStats = async saveModel => {
    const payload = saveModel?.payload
    const draft = saveModel?.draft

    if (!payload) return

    if (isLocalDraftSave(payload)) {
      saveStatsDraft({ payload, draft })
      return
    }

    const result = await saveStatsToFirestore(payload)
    const gameStatsDocId = getCreatedStatsDocId({ result, payload })

    completeStatsFirestoreSave(
      mergeStatsDocId({
        payload,
        draft,
        gameStatsDocId,
      })
    )
  }

  const handleDeleteStats = async ({ draft, game, statsDeleteAction } = {}) => {
    const targetGame = game || editingStatsGame
    const gameId = getGameId(targetGame) || draft?.gameId || ''

    if (!gameId || !statsDeleteAction?.type) return

    if (statsDeleteAction.type === 'localDraft') {
      deleteStatsDraft(gameId)
      return
    }

    const gameStatsDocId =
      getGameStatsDocId(targetGame) ||
      draft?.gameStatsDocId ||
      draft?.statsDocId ||
      activeStatsFormDraft?.gameStatsDocId ||
      activeStatsFormDraft?.statsDocId ||
      ''

    if (!gameStatsDocId) return

    await deleteStatsFromFirestore(
      buildStatsDeletePayload({
        gameId,
        gameStatsDocId,
        livePlayer,
        liveTeam,
        targetGame,
        draft,
        activeStatsFormDraft,
      })
    )

    deleteStatsDraft(gameId)
    closeStatsForm()
  }

  const hasRows = Array.isArray(sortedGames) && sortedGames.length > 0

  const hasAnyGames =
    Array.isArray(livePlayer?.playerGames) &&
    livePlayer.playerGames.length > 0

  return {
    livePlayer,
    liveTeam,
    playerScoring,
    isPrivatePlayer,

    summary,
    games,
    options,
    indicators,
    calculationGames,
    sortedGames,

    filters,
    sort,

    insightsOpen,
    editingEntryGame,
    editingGame,

    statsFormLoading,
    statsFormLoadingText,
    editingStatsGame,
    activeStatsFormDraft,
    statsPayloadsByGameId,
    statsDeleteAction,
    statsSavePending,
    statsSaveError,

    hasRows,
    hasAnyGames,

    setInsightsOpen,
    setEditingEntryGame,
    setEditingGame,

    handleChangeFilters,
    handleResetFilters,
    handleChangeSortBy,
    handleChangeSortDirection,
    handleEditGame,

    handleOpenStatsGame,
    handleSaveStats,
    handleDeleteStats,
    closeStatsForm,
    deleteStatsDraft,
  }
}
