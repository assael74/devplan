// src/features/coreData/CoreDataProvider.js
// src/features/coreData/CoreDataProvider.js
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import {
  clubsShortsRef,
  teamsShortsRef,
  playersShortsRef,
  privatePlayersShortsRef,
  scoutingShortsRef,
  meetingsShortsRef,
  paymentsShortsRef,
  gamesShortsRef,
  externalGamesShortsRef,
  rolesShortsRef,
  videosShortsRef,
  videoAnalysisShortsRef,
} from '../../services/firestore/shortsCollections'
import { subscribeShorts } from '../../services/firestore/shorts/shorts.subscribe'
import { resolveCoreData } from './resolvers/coreData.resolver'
import { mergeShorts } from './resolvers/mergeShorts.js'
import { patchShortsDocsByRouter } from './utils/patchShortsEntity.js'
import { useAuth } from '../../app/AuthProvider.js'

const CoreDataContext = createContext(null)

const EMPTY_MAP = new Map()

const EMPTY_CORE_DATA = {
  clubs: [],
  teams: [],
  players: [],
  privatePlayers: [],
  playersWithoutTeam: [],
  scouting: [],
  meetings: [],
  payments: [],
  roles: [],
  videos: [],
  videoAnalysis: [],
  games: [],

  clubById: EMPTY_MAP,
  teamById: EMPTY_MAP,
  playerById: EMPTY_MAP,
  meetingsById: EMPTY_MAP,
  paymentsById: EMPTY_MAP,
  meetingsByPlayerId: EMPTY_MAP,
}

const resolveAccessRoles = (rolesShorts) => {
  if (!Array.isArray(rolesShorts)) return []
  return mergeShorts(rolesShorts, 'rolesInfo', ['rolesContact'], 'id')
}

const resetShortsState = ({
  setClubsShorts,
  setTeamsShorts,
  setPlayersShorts,
  setPrivatePlayersShorts,
  setScoutingShorts,
  setMeetingsShorts,
  setPaymentsShorts,
  setGamesShorts,
  setExternalGamesShorts,
  setRolesShorts,
  setVideosShorts,
  setVideoAnalysisShorts,
}) => {
  setClubsShorts(null)
  setTeamsShorts(null)
  setPlayersShorts(null)
  setPrivatePlayersShorts(null)
  setScoutingShorts(null)
  setMeetingsShorts(null)
  setPaymentsShorts(null)
  setGamesShorts(null)
  setExternalGamesShorts(null)
  setRolesShorts(null)
  setVideosShorts(null)
  setVideoAnalysisShorts(null)
}

export function CoreDataProvider({ children }) {
  const { user } = useAuth()

  const [clubsShorts, setClubsShorts] = useState(null)
  const [teamsShorts, setTeamsShorts] = useState(null)

  const [playersShorts, setPlayersShorts] = useState(null)
  const [privatePlayersShorts, setPrivatePlayersShorts] = useState(null)

  const [scoutingShorts, setScoutingShorts] = useState(null)
  const [meetingsShorts, setMeetingsShorts] = useState(null)
  const [paymentsShorts, setPaymentsShorts] = useState(null)

  const [gamesShorts, setGamesShorts] = useState(null)
  const [externalGamesShorts, setExternalGamesShorts] = useState(null)

  const [rolesShorts, setRolesShorts] = useState(null)
  const [videosShorts, setVideosShorts] = useState(null)
  const [videoAnalysisShorts, setVideoAnalysisShorts] = useState(null)

  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      resetShortsState({
        setClubsShorts,
        setTeamsShorts,
        setPlayersShorts,
        setPrivatePlayersShorts,
        setScoutingShorts,
        setMeetingsShorts,
        setPaymentsShorts,
        setGamesShorts,
        setExternalGamesShorts,
        setRolesShorts,
        setVideosShorts,
        setVideoAnalysisShorts,
      })
      setError(null)
      return undefined
    }

    const unsubClubs = subscribeShorts(clubsShortsRef, setClubsShorts, setError)
    const unsubTeams = subscribeShorts(teamsShortsRef, setTeamsShorts, setError)

    const unsubPlayers = subscribeShorts(playersShortsRef, setPlayersShorts, setError)
    const unsubPrivatePlayers = subscribeShorts(
      privatePlayersShortsRef,
      setPrivatePlayersShorts,
      setError
    )

    const unsubScouting = subscribeShorts(scoutingShortsRef, setScoutingShorts, setError)
    const unsubMeetings = subscribeShorts(meetingsShortsRef, setMeetingsShorts, setError)
    const unsubPayments = subscribeShorts(paymentsShortsRef, setPaymentsShorts, setError)

    const unsubGames = subscribeShorts(gamesShortsRef, setGamesShorts, setError)
    const unsubExternalGames = subscribeShorts(
      externalGamesShortsRef,
      setExternalGamesShorts,
      setError
    )

    const unsubRoles = subscribeShorts(rolesShortsRef, setRolesShorts, setError)
    const unsubVideos = subscribeShorts(videosShortsRef, setVideosShorts, setError)
    const unsubVideoAnalysis = subscribeShorts(
      videoAnalysisShortsRef,
      setVideoAnalysisShorts,
      setError
    )

    return () => {
      unsubClubs()
      unsubTeams()

      unsubPlayers()
      unsubPrivatePlayers()

      unsubScouting()
      unsubMeetings()
      unsubPayments()

      unsubGames()
      unsubExternalGames()

      unsubRoles()
      unsubVideos()
      unsubVideoAnalysis()
    }
  }, [user])

  const hasClubsShorts = Array.isArray(clubsShorts)
  const hasTeamsShorts = Array.isArray(teamsShorts)
  const hasPlayersShorts = Array.isArray(playersShorts)
  const hasPrivatePlayersShorts = Array.isArray(privatePlayersShorts)
  const hasScoutingShorts = Array.isArray(scoutingShorts)
  const hasMeetingsShorts = Array.isArray(meetingsShorts)
  const hasPaymentsShorts = Array.isArray(paymentsShorts)
  const hasGamesShorts = Array.isArray(gamesShorts)
  const hasExternalGamesShorts = Array.isArray(externalGamesShorts)
  const hasRolesShorts = Array.isArray(rolesShorts)
  const hasVideosShorts = Array.isArray(videosShorts)
  const hasVideoAnalysisShorts = Array.isArray(videoAnalysisShorts)

  const accessLoading = Boolean(user) && !hasRolesShorts
  const primaryLoading =
    Boolean(user) &&
    (!hasClubsShorts || !hasTeamsShorts || !hasPlayersShorts || !hasRolesShorts)
  const secondaryLoading =
    Boolean(user) &&
    (!hasPrivatePlayersShorts || !hasScoutingShorts)
  const summaryLoading =
    Boolean(user) &&
    (!hasMeetingsShorts ||
      !hasPaymentsShorts ||
      !hasGamesShorts ||
      !hasExternalGamesShorts ||
      !hasVideosShorts ||
      !hasVideoAnalysisShorts)
  const loading =
    Boolean(user) &&
    (primaryLoading || secondaryLoading || summaryLoading)

  const patchEntity = useCallback((entityType, id, patch) => {
    if (!entityType || !id || !patch) return

    const patcher = (prev) =>
      patchShortsDocsByRouter({
        entityType,
        shortsDocs: prev,
        id,
        patch,
      })

    switch (entityType) {
      case 'players':
        setPlayersShorts(patcher)
        break

      case 'privates':
        setPrivatePlayersShorts(patcher)
        break

      case 'teams':
        setTeamsShorts(patcher)
        break

      case 'clubs':
        setClubsShorts(patcher)
        break

      case 'roles':
        setRolesShorts(patcher)
        break

      case 'scouting':
        setScoutingShorts(patcher)
        break

      case 'meetings':
        setMeetingsShorts(patcher)
        break

      case 'payments':
        setPaymentsShorts(patcher)
        break

      case 'games':
        setGamesShorts(patcher)
        break

      case 'externalGames':
        setExternalGamesShorts(patcher)
        break

      case 'videoAnalysis':
        setVideoAnalysisShorts(patcher)
        break

      case 'videos':
        setVideosShorts(patcher)
        break

      default:
        break
    }
  }, [])

  const accessRoles = useMemo(() => resolveAccessRoles(rolesShorts), [rolesShorts])

  const resolvedCoreData = useMemo(() => {
    if (!user || primaryLoading) return null

    return resolveCoreData({
      clubsShorts: clubsShorts || [],
      teamsShorts: teamsShorts || [],

      playersShorts: playersShorts || [],
      privatePlayersShorts: privatePlayersShorts || [],

      scoutingShorts: scoutingShorts || [],
      meetingsShorts: meetingsShorts || [],
      paymentsShorts: paymentsShorts || [],

      gamesShorts: gamesShorts || [],
      externalGamesShorts: externalGamesShorts || [],

      rolesShorts: rolesShorts || [],
      videosShorts: videosShorts || [],
      videoAnalysisShorts: videoAnalysisShorts || [],
    })
  }, [
    user,
    primaryLoading,

    clubsShorts,
    teamsShorts,

    playersShorts,
    privatePlayersShorts,

    scoutingShorts,
    meetingsShorts,
    paymentsShorts,

    gamesShorts,
    externalGamesShorts,

    rolesShorts,
    videosShorts,
    videoAnalysisShorts,
  ])

  const accessReady = !accessLoading
  const primaryReady = !primaryLoading
  const secondaryReady = !secondaryLoading
  const summaryReady = !summaryLoading
  const coreReady = primaryReady

  const value = useMemo(() => {
    if (!user) {
      return {
        loading: false,
        accessLoading: false,
        primaryLoading: false,
        secondaryLoading: false,
        summaryLoading: false,
        accessReady: true,
        primaryReady: true,
        secondaryReady: true,
        summaryReady: true,
        coreReady: true,
        error: null,
        patchEntity,

        clubsShorts: [],
        teamsShorts: [],

        playersShorts: [],
        privatePlayersShorts: [],

        scoutingShorts: [],
        meetingsShorts: [],
        paymentsShorts: [],

        gamesShorts: [],
        externalGamesShorts: [],

        rolesShorts: [],
        videosShorts: [],
        videoAnalysisShorts: [],

        clubs: [],
        teams: [],
        players: [],
        privatePlayers: [],
        playersWithoutTeam: [],
        scouting: [],
        meetings: [],
        payments: [],
        roles: [],
        videos: [],
        videoAnalysis: [],
        games: [],

        clubById: EMPTY_MAP,
        teamById: EMPTY_MAP,
        playerById: EMPTY_MAP,
        meetingsById: EMPTY_MAP,
        paymentsById: EMPTY_MAP,
        meetingsByPlayerId: EMPTY_MAP,
      }
    }

    if (loading) {
      const resolved = resolvedCoreData || {
        ...EMPTY_CORE_DATA,
        roles: accessRoles,
      }

      return {
        loading: true,
        accessLoading,
        primaryLoading,
        secondaryLoading,
        summaryLoading,
        accessReady,
        primaryReady,
        secondaryReady,
        summaryReady,
        coreReady,
        error,
        patchEntity,

        clubsShorts,
        teamsShorts,

        playersShorts,
        privatePlayersShorts,

        scoutingShorts,
        meetingsShorts,
        paymentsShorts,

        gamesShorts,
        externalGamesShorts,

        rolesShorts,
        videosShorts,
        videoAnalysisShorts,

        ...resolved,
      }
    }

    return {
      loading: false,
      accessLoading,
      primaryLoading,
      secondaryLoading,
      summaryLoading,
      accessReady,
      primaryReady,
      secondaryReady,
      summaryReady,
      coreReady,
      error,
      patchEntity,

      clubsShorts,
      teamsShorts,

      playersShorts,
      privatePlayersShorts,

      scoutingShorts,
      meetingsShorts,
      paymentsShorts,

      gamesShorts,
      externalGamesShorts,

      rolesShorts,
        videosShorts,
      videoAnalysisShorts,

      ...(resolvedCoreData || EMPTY_CORE_DATA),
    }
  }, [
    user,
    loading,
    accessLoading,
    primaryLoading,
    secondaryLoading,
    summaryLoading,
    accessReady,
    primaryReady,
    secondaryReady,
    summaryReady,
    coreReady,
    error,
    patchEntity,
    accessRoles,
    resolvedCoreData,

    clubsShorts,
    teamsShorts,

    playersShorts,
    privatePlayersShorts,

    scoutingShorts,
    meetingsShorts,
    paymentsShorts,

    gamesShorts,
    externalGamesShorts,

    rolesShorts,
    videosShorts,
    videoAnalysisShorts,
  ])

  return <CoreDataContext.Provider value={value}>{children}</CoreDataContext.Provider>
}

export function useCoreData() {
  const ctx = useContext(CoreDataContext)
  if (!ctx) throw new Error('useCoreData must be used within CoreDataProvider')
  return ctx
}
