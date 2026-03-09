import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, Typography, CircularProgress } from '@mui/joy'

import { useAuth } from '../AuthProvider'
import AppLayout from '../layout/AppLayout'
import TopBar from '../../ui/core/layout/TopBar'

// Hub
import HubPage from '../../features/hub/ui/HubPage'

import PlayerProfilePage from '../../features/hub/playerProfile/PlayerProfilePage'
import TeamProfilePage from '../../features/hub/teamProfile/TeamProfilePage'
import ClubProfilePage from '../../features/hub/clubProfile/ClubProfilePage'
import CalendarHubPage from '../../features/calendarHub/CalendarHubPage'
import VideoHubPage from '../../features/videoHub/VideoHubPage'

import TagsManagementPage from '../../features/tagsHub/TagsManagementPage.js'

export default function AppRoutes() {
  const { user } = useAuth()
  const AuthForm = () => null

  // אם יש לך gate אחר ל-CoreData, תחזיר אותו אחר כך
  const isCoreLoaded = true

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
                טוען נתונים...
              </Typography>
            </Box>
          }
        />
      ) : (
        <Route
          element={
            <AppLayout topbar={<TopBar title="DevPlan" />} navBadges={{ players: 108, teams: 7, clubs: 3 }} />
          }
        >
          {/* Root → Hub */}
          <Route path="/" element={<Navigate to="/hub" replace />} />

          {/* Hub */}
          <Route path="/hub" element={<HubPage />} />
          <Route path="/calendar" element={<CalendarHubPage />} />
          <Route path="/video" element={<VideoHubPage />} />
          <Route path="/tags" element={<TagsManagementPage />} />

          {/* Deep pages */}
          <Route path="/clubs/:clubId" element={<ClubProfilePage />} />
          <Route path="/clubs/:clubId/:tabKey" element={<ClubProfilePage />} />

          <Route path="/teams/:teamId" element={<TeamProfilePage />} />
          <Route path="/teams/:teamId/:tabKey" element={<TeamProfilePage />} />

          <Route path="/players/:playerId" element={<PlayerProfilePage />} />
          <Route path="/players/:playerId/:tabKey" element={<PlayerProfilePage />} />

          <Route path="*" element={<Navigate to="/hub" replace />} />
        </Route>
      )}
    </Routes>
  )
}
