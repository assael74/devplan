import React, { useMemo } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Box, Typography, CircularProgress } from '@mui/joy'

import { useAuth } from '../app/AuthProvider'
import { useCoreData } from '../features/core/useCoreData'
import { useShortsByRoute } from '../features/shorts/useShortsByRoute'

import { statsParm } from './x_utils/statsParmList'
import { allLists } from './x_utils/AllObjectList'

import AuthForm from './f_forms/registerForms/AuthForm'
import Layout from './Layout'
import TopBar from '../ui/TopBar'

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
  const { user } = useAuth()
  const { pathname } = useLocation()

  const { clubsShorts, teamsShorts, playersShorts, loadingCore, isCoreLoaded } = useCoreData({
    enabled: !!user,
  })

  const { shorts: nonCoreShorts, loading: loadingNonCore } = useShortsByRoute({
    enabled: !!user,
    pathname,
  })

  const loadingStates = useMemo(
    () => ({
      clubs: loadingCore.clubs,
      teams: loadingCore.teams,
      players: loadingCore.players,

      payments: loadingNonCore.payments,
      meetings: loadingNonCore.meetings,
      games: loadingNonCore.games,
      gameStats: loadingNonCore.gameStats,
      videos: loadingNonCore.videos,
      videoAnalysis: loadingNonCore.videoAnalysis,
      tags: loadingNonCore.tags,
      roles: loadingNonCore.roles,
      scouting: loadingNonCore.scouting,
    }),
    [loadingCore, loadingNonCore]
  )

  const allShorts = useMemo(
    () => ({
      clubsShorts,
      teamsShorts,
      playersShorts,
      ...nonCoreShorts,
    }),
    [clubsShorts, teamsShorts, playersShorts, nonCoreShorts]
  )

  const computedLists = useMemo(() => allLists({ ...allShorts }), [allShorts])

  const newProps = useMemo(
    () => ({
      allShorts,
      ...allShorts,
      ...computedLists,
      statsParm,
      loadingStates,
      isCoreLoaded,
      actions: {},
      gameStats: nonCoreShorts.gameStatsShorts,
    }),
    [allShorts, computedLists, loadingStates, isCoreLoaded, nonCoreShorts.gameStatsShorts]
  )

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/" element={<AuthForm />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      ) : !isCoreLoaded ? (
        <Route
          path="*"
          element={
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <CircularProgress size="lg" />
              <Typography level="body-md" sx={{ mt: 2 }}>
                טוען נתוני ליבה (מועדונים / קבוצות / שחקנים)...
              </Typography>
            </Box>
          }
        />
      ) : (
        <Route
          path="*"
          element={
            <Layout.Root>
              {/* TOP BAR חדש */}
              <TopBar title="DevPlan" />

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
      )}
    </Routes>
  )
}
