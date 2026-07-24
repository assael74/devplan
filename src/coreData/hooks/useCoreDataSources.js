// src/coreData/hooks/useCoreDataSources.js
import { useEffect, useMemo, useState } from 'react'
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
} from '../../../services/firestore/shortsCollections'
import { subscribeShorts } from '../../../services/firestore/shorts/shorts.subscribe'

const SOURCE_CONFIG = [
  ['clubs', clubsShortsRef, 'setClubsShorts'],
  ['teams', teamsShortsRef, 'setTeamsShorts'],
  ['players', playersShortsRef, 'setPlayersShorts'],
  ['privatePlayers', privatePlayersShortsRef, 'setPrivatePlayersShorts'],
  ['scouting', scoutingShortsRef, 'setScoutingShorts'],
  ['meetings', meetingsShortsRef, 'setMeetingsShorts'],
  ['payments', paymentsShortsRef, 'setPaymentsShorts'],
  ['games', gamesShortsRef, 'setGamesShorts'],
  ['externalGames', externalGamesShortsRef, 'setExternalGamesShorts'],
  ['roles', rolesShortsRef, 'setRolesShorts'],
  ['videos', videosShortsRef, 'setVideosShorts'],
  ['videoAnalysis', videoAnalysisShortsRef, 'setVideoAnalysisShorts'],
]

export const useCoreDataSources = user => {
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
  const [sourceErrors, setSourceErrors] = useState({})

  const setters = useMemo(
    () => ({
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
    }),
    []
  )

  useEffect(() => {
    if (!user) {
      Object.values(setters).forEach(setData => setData(null))
      setSourceErrors({})
      return undefined
    }

    const subscriptions = SOURCE_CONFIG.map(([source, ref, setterName]) =>
      subscribeShorts(
        ref,
        docs => {
          setters[setterName](docs)
          setSourceErrors(prev => {
            if (!prev[source]) return prev

            const next = { ...prev }
            delete next[source]
            return next
          })
        },
        sourceError => {
          setSourceErrors(prev => ({
            ...prev,
            [source]: sourceError,
          }))
        },
        {
          feature: 'coreData',
          shortKey: source,
        }
      )
    )

    return () => subscriptions.forEach(unsubscribe => unsubscribe())
    // Setters are stable React state functions and SOURCE_CONFIG is module-level.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return {
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
    sourceErrors,
    setters,
  }
}
