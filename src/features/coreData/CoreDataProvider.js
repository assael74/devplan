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
  gameStatsShortsRef,
  rolesShortsRef,
  tagsShortsRef,
  videosShortsRef,
  videoAnalysisShortsRef,
} from '../../services/firestore/shortsCollections'
import { subscribeShorts } from '../../services/firestore/shorts/shorts.subscribe'
import { resolveCoreData } from './resolvers/coreData.resolver'
import { patchShortsDocsByRouter } from './utils/patchShortsEntity.js'

const CoreDataContext = createContext(null)

export function CoreDataProvider({ children }) {
  const [clubsShorts, setClubsShorts] = useState(null)
  const [teamsShorts, setTeamsShorts] = useState(null)

  const [playersShorts, setPlayersShorts] = useState(null)
  const [privatePlayersShorts, setPrivatePlayersShorts] = useState(null)

  const [scoutingShorts, setScoutingShorts] = useState(null)
  const [meetingsShorts, setMeetingsShorts] = useState(null)
  const [paymentsShorts, setPaymentsShorts] = useState(null)

  const [gamesShorts, setGamesShorts] = useState(null)
  const [externalGamesShorts, setExternalGamesShorts] = useState(null)
  const [gameStatsShorts, setGameStatsShorts] = useState(null)

  const [rolesShorts, setRolesShorts] = useState(null)
  const [tagsShorts, setTagsShorts] = useState(null)
  const [videosShorts, setVideosShorts] = useState(null)
  const [videoAnalysisShorts, setVideoAnalysisShorts] = useState(null)

  const [error, setError] = useState(null)

  useEffect(() => {
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
    const unsubGameStats = subscribeShorts(gameStatsShortsRef, setGameStatsShorts, setError)

    const unsubRoles = subscribeShorts(rolesShortsRef, setRolesShorts, setError)
    const unsubTags = subscribeShorts(tagsShortsRef, setTagsShorts, setError)
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
      unsubGameStats()

      unsubRoles()
      unsubTags()
      unsubVideos()
      unsubVideoAnalysis()
    }
  }, [])

  const loading =
    !Array.isArray(clubsShorts) ||
    !Array.isArray(teamsShorts) ||
    !Array.isArray(playersShorts) ||
    !Array.isArray(privatePlayersShorts) ||
    !Array.isArray(scoutingShorts) ||
    !Array.isArray(meetingsShorts) ||
    !Array.isArray(paymentsShorts) ||
    !Array.isArray(gamesShorts) ||
    !Array.isArray(externalGamesShorts) ||
    !Array.isArray(gameStatsShorts) ||
    !Array.isArray(rolesShorts) ||
    !Array.isArray(tagsShorts) ||
    !Array.isArray(videosShorts) ||
    !Array.isArray(videoAnalysisShorts)

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

      case 'tags':
        setTagsShorts(patcher)
        break

      case 'gameStats':
        setGameStatsShorts(patcher)
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
        gameStatsShorts,

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
      gameStatsShorts,

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
      gameStatsShorts,

      rolesShorts,
      tagsShorts,
      videosShorts,
      videoAnalysisShorts,

      ...resolved,
    }
  }, [
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
    gameStatsShorts,

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
