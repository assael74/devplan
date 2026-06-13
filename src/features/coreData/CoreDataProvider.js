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
import { patchShortsDocsByRouter } from './utils/patchShortsEntity.js'
import { useAuth } from '../../app/AuthProvider.js'

const CoreDataContext = createContext(null)

const EMPTY_TAGS_SHORTS = []

const EMPTY_MAP = new Map()

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
  const tagsShorts = EMPTY_TAGS_SHORTS
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

  const loading =
    Boolean(user) &&
    (!Array.isArray(clubsShorts) ||
    !Array.isArray(teamsShorts) ||
    !Array.isArray(playersShorts) ||
    !Array.isArray(privatePlayersShorts) ||
    !Array.isArray(scoutingShorts) ||
    !Array.isArray(meetingsShorts) ||
    !Array.isArray(paymentsShorts) ||
    !Array.isArray(gamesShorts) ||
    !Array.isArray(externalGamesShorts) ||
    !Array.isArray(rolesShorts) ||
    !Array.isArray(videosShorts) ||
    !Array.isArray(videoAnalysisShorts))

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

  const value = useMemo(() => {
    if (!user) {
      return {
        loading: false,
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
        tagsShorts,
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
        tags: [],
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
      return {
        loading: true,
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
        tagsShorts,
        videosShorts,
        videoAnalysisShorts,

        clubs: [],
        teams: [],
        players: [],
        scouting: [],
        meetings: [],
        payments: [],
        roles: [],
        tags: [],
        videos: [],
        videoAnalysis: [],
        games: [],

        clubById: new Map(),
        teamById: new Map(),
        playerById: new Map(),
      }
    }

    const resolved = resolveCoreData({
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
      tagsShorts,
      videosShorts,
      videoAnalysisShorts,
    })

    return {
      loading: false,
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
      tagsShorts,
      videosShorts,
      videoAnalysisShorts,

      ...resolved,
    }
  }, [
    user,
    loading,
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
    tagsShorts,
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
