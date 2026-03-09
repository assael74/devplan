import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext'
import { enableFcm } from '../fcmClient.js';
import { onSnapshot } from 'firebase/firestore'
import { statsParm } from './x_utils/statsParmList'
import { allLists } from './x_utils/AllObjectList'
import { clubsShortsCollectionRef, teamsShortsCollectionRef } from './a_firestore/readData/FirestoreReadData'
import { playersShortsCollectionRef, paymentsShortsCollectionRef } from './a_firestore/readData/FirestoreReadData'
import { meetingsShortsCollectionRef, gamesShortsCollectionRef } from './a_firestore/readData/FirestoreReadData'
import { videosShortsCollectionRef, videoAnalysisShortsCollectionRef } from './a_firestore/readData/FirestoreReadData'
import { gameStatsShortsCollectionRef, tagsShortsCollectionRef } from './a_firestore/readData/FirestoreReadData'
import { rolesShortsCollectionRef, scoutingShortsCollectionRef } from './a_firestore/readData/FirestoreReadData'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { CssVarsProvider } from '@mui/joy/styles'
import CssBaseline from '@mui/joy/CssBaseline'
import { Box, Typography, CircularProgress } from '@mui/joy'

import AuthForm from './f_forms/registerForms/AuthForm.js'
import Layout from './Layout'
import Header from './c_navBar/Header'

import AnalystDash from './d_analystComp/A_AnalystDash'
import ClubsLayout from './d_analystComp/a_layouts/A_ClubsLayout'
import TeamsLayout from './d_analystComp/a_layouts/B_TeamsLayout'
import PlayersLayout from './d_analystComp/a_layouts/C_PlayersLayout'
import PaymentsLayout from './d_analystComp/a_layouts/D_PaymentsLayout'
import MeetingsLayout from './d_analystComp/a_layouts/E_MeetingsLayout'
import VideosLayout from './d_analystComp/a_layouts/F_VideosLayout'
import TagsLayout from './d_analystComp/a_layouts/G_TagsLayout'
import GamesLayout from './d_analystComp/a_layouts/H_GamesLayout'
import ScoutLayout from './d_analystComp/a_layouts/K_ScoutLayout'
import StatsParmLayout from './d_analystComp/a_layouts/I_StatsParmLayout'
import RolesLayout from './d_analystComp/a_layouts/J_RolesLayout'
import PlayerDashboard from './e_dashboards/playerDashboard/A_PlayerDashboard'
import TeamDashboard from './e_dashboards/teamDashboard/A_TeamDashboard'
import DocumentSizeChecker from './DocumentSizeChecker'

export default function AllNewLayouts() {
  const { currentUser } = useAuth()
  const { pathname } = useLocation()

  const [loadingStates, setLoadingStates] = useState({
    clubs: true,
    teams: true,
    players: true,
    payments: true,
    meetings: true,
    games: true,
    gameStats: true,
    videos: true,
    videoAnalysis: true,
    tags: true,
    roles: true,
    scouting: true
  })

  const [clubsShorts, setClubsShorts] = useState()
  const [teamsShorts, setTeamsShorts] = useState()
  const [playersShorts, setPlayersShorts] = useState()
  const [paymentsShorts, setPaymentsShorts] = useState()
  const [meetingsShorts, setMeetingsShorts] = useState()
  const [gamesShorts, setGamesShorts] = useState()
  const [gameStatsShorts, setGameStatsShorts] = useState()
  const [videosShorts, setVideosShorts] = useState()
  const [videoAnalysisShorts, setVideoAnalysisShorts] = useState()
  const [tagsShorts, setTagsShorts] = useState()
  const [rolesShorts, setRolesShorts] = useState()
  const [scoutingShorts, setScoutingShorts] = useState()

  // טוען נתונים רק לאחר התחברות
  useEffect(() => {
    if (!currentUser) return;
    enableFcm({
      userId: currentUser.uid,
      vapidKey: 'BEGyEar2xKum8iOCEJVV96F4m5amZsdXEtdKzFKH0kZe6bkF_OC0yElFoidJl5brU2hRFjb0mKi6hooXs6nrDOk'
    }).catch(console.error);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const bind = (key, ref, setter) =>
      onSnapshot(
        ref,
        (snapshot) => {
          setter(snapshot.docs.map(d => d.data()));
          setLoadingStates(prev => ({ ...prev, [key]: false }));
        },
        (err) => {
          console.error('onSnapshot error:', key, err);
          setLoadingStates(prev => ({ ...prev, [key]: false }));
        }
      );

    const unsubs = [
      bind('clubs', clubsShortsCollectionRef, setClubsShorts),
      bind('teams', teamsShortsCollectionRef, setTeamsShorts),
      bind('players', playersShortsCollectionRef, setPlayersShorts),
      bind('payments', paymentsShortsCollectionRef, setPaymentsShorts),
      bind('meetings', meetingsShortsCollectionRef, setMeetingsShorts),
      bind('games', gamesShortsCollectionRef, setGamesShorts),
      bind('gameStats', gameStatsShortsCollectionRef, setGameStatsShorts),
      bind('videos', videosShortsCollectionRef, setVideosShorts),
      bind('videoAnalysis', videoAnalysisShortsCollectionRef, setVideoAnalysisShorts),
      bind('tags', tagsShortsCollectionRef, setTagsShorts),
      bind('roles', rolesShortsCollectionRef, setRolesShorts),
      bind('scouting', scoutingShortsCollectionRef, setScoutingShorts),
    ];

    return () => unsubs.forEach(u => u());
  }, [currentUser]);

  const isAllDataLoaded = Object.values(loadingStates).every(v => v === false)

  const newProps = {
    allShorts: {
      clubsShorts,
      teamsShorts,
      playersShorts,
      paymentsShorts,
      meetingsShorts,
      gamesShorts,
      gameStatsShorts,
      videosShorts,
      videoAnalysisShorts,
      tagsShorts,
      rolesShorts,
      scoutingShorts
    },
    clubsShorts,
    teamsShorts,
    playersShorts,
    paymentsShorts,
    meetingsShorts,
    gamesShorts,
    gameStatsShorts,
    videosShorts,
    videoAnalysisShorts,
    tagsShorts,
    rolesShorts,
    scoutingShorts,
    statsParm,
    loadingStates,
    isAllDataLoaded,
    ...allLists({
      clubsShorts,
      teamsShorts,
      playersShorts,
      paymentsShorts,
      meetingsShorts,
      gamesShorts,
      gameStatsShorts,
      videosShorts,
      videoAnalysisShorts,
      tagsShorts,
      rolesShorts,
      scoutingShorts
    }),
    actions: {},
    gameStats: gameStatsShorts,
  }

  return (
    <CssVarsProvider>
      <CssBaseline />
      <Routes>
        {!currentUser ? (
          <>
            <Route path="/" element={<AuthForm />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : !isAllDataLoaded ? (
          <Route
            path="*"
            element={
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <CircularProgress size="lg" />
                <Typography level="body-md" sx={{ mt: 2 }}>
                  טוען נתונים...
                </Typography>
              </Box>
            }
          />
        ) : (
          <>
            <Route
              path="*"
              element={
                <Layout.Root>
                  <Layout.Header>
                    <Header {...newProps} pathname={pathname} />
                  </Layout.Header>
                  <Routes>
                    <Route path="/" element={<AnalystDash {...newProps} pathname={pathname} />} />
                    <Route path="/Clubs" element={<ClubsLayout {...newProps} pathname={pathname} />} />
                    <Route path="/Teams" element={<TeamsLayout {...newProps} pathname={pathname} />} />
                    <Route path="/Players" element={<PlayersLayout {...newProps} pathname={pathname} />} />
                    <Route path="/Payments" element={<PaymentsLayout {...newProps} pathname={pathname} />} />
                    <Route path="/Meetings" element={<MeetingsLayout {...newProps} pathname={pathname} />} />
                    <Route path="/Videos" element={<VideosLayout {...newProps} pathname={pathname} />} />
                    <Route path="/Tags" element={<TagsLayout {...newProps} pathname={pathname} />} />
                    <Route path="/Games" element={<GamesLayout {...newProps} pathname={pathname} />} />
                    <Route path="/Roles" element={<RolesLayout {...newProps} pathname={pathname} />} />
                    <Route path="/scouting" element={<ScoutLayout {...newProps} pathname={pathname} />} />
                    <Route path="/Settings" element={<DocumentSizeChecker {...newProps} pathname={pathname} />} />
                    <Route path="/StatsParm" element={<StatsParmLayout {...newProps} pathname={pathname} />} />
                    <Route path="/Player/:playerId" element={<PlayerDashboard {...newProps} pathname={pathname} />} />
                    <Route path="/Team/:teamId" element={<TeamDashboard {...newProps} pathname={pathname} />} />
                  </Routes>
                </Layout.Root>
              }
            />
          </>
        )}
      </Routes>
    </CssVarsProvider>
  )
}
