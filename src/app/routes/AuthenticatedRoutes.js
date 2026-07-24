// src/app/routes/AuthenticatedRoutes.js

import React from 'react'
import { Navigate, Route } from 'react-router-dom'

import AppLayout from '../layout/AppLayout'
import TopBar from '../../ui/core/layout/TopBar'
import CalendarSkeleton from '../../ui/loading/pages/CalendarSkeleton.js'
import HomeSkeleton from '../../ui/loading/pages/HomeSkeleton.js'
import HubSkeleton from '../../ui/loading/pages/HubSkeleton.js'
import ProfileSkeleton from '../../ui/loading/pages/ProfileSkeleton.js'
import SimulatorSkeleton from '../../ui/loading/pages/SimulatorSkeleton.js'
import TagsSkeleton from '../../ui/loading/pages/TagsSkeleton.js'
import VideoSkeleton from '../../ui/loading/pages/VideoSkeleton.js'
import TopBarNotificationsHost from './TopBarNotificationsHost'
import { lazyRoute } from './routeUi'
import { ADMIN_ROUTES, PUBLIC_ROUTES, ROUTE_REDIRECTS } from './routeCatalog'
import {
  AbilitiesExplainerPage,
  CalendarHubPage,
  ClubProfilePage,
  FirestoreUsagePage,
  HomePage,
  HubPage,
  PlayerProfilePage,
  PlayersDatabaseLeaguePage,
  PlayersDatabaseLeaguesCenterPage,
  PlayersDatabasePage,
  PlayersDatabasePlayerPage,
  PlayersDatabaseProfilesPage,
  PlayersDatabaseSearchPage,
  PlayersDatabaseTeamPage,
  ReportsDashboardPage,
  SquadSimulatorPage,
  TagsManagementPage,
  TeamProfilePage,
  VideoHubPage,
} from './routeComponents'

function renderAdminRoutes() {
  return (
    <>
      <Route path={PUBLIC_ROUTES.login} element={<Navigate to={ROUTE_REDIRECTS.adminHome} replace />} />
      <Route path={PUBLIC_ROUTES.register} element={<Navigate to={ROUTE_REDIRECTS.adminHome} replace />} />
      <Route path={PUBLIC_ROUTES.forgotPassword} element={<Navigate to={ROUTE_REDIRECTS.adminHome} replace />} />
      <Route path={PUBLIC_ROUTES.pendingApproval} element={<Navigate to={ROUTE_REDIRECTS.adminHome} replace />} />
      <Route path={ADMIN_ROUTES.root} element={<Navigate to={ROUTE_REDIRECTS.adminHome} replace />} />

      <Route path={ADMIN_ROUTES.home} element={lazyRoute(<HomePage />, <HomeSkeleton />)} />
      <Route path={ADMIN_ROUTES.hub} element={lazyRoute(<HubPage />, <HubSkeleton />)} />
      <Route path={ADMIN_ROUTES.calendar} element={lazyRoute(<CalendarHubPage />, <CalendarSkeleton />)} />
      <Route path={ADMIN_ROUTES.video} element={lazyRoute(<VideoHubPage />, <VideoSkeleton />)} />
      <Route path={ADMIN_ROUTES.tags} element={lazyRoute(<TagsManagementPage />, <TagsSkeleton />)} />

      <Route path={ADMIN_ROUTES.playersDatabase} element={lazyRoute(<PlayersDatabasePage />)} />
      <Route path={ADMIN_ROUTES.playersDatabaseLeagues} element={lazyRoute(<PlayersDatabaseLeaguesCenterPage />)} />
      <Route path={ADMIN_ROUTES.playersDatabaseSearch} element={lazyRoute(<PlayersDatabaseSearchPage />)} />
      <Route path={ADMIN_ROUTES.playersDatabaseProfiles} element={lazyRoute(<PlayersDatabaseProfilesPage />)} />
      <Route path={ADMIN_ROUTES.playersDatabaseLegacyScan} element={<Navigate to={ROUTE_REDIRECTS.playersDatabaseSearch} replace />} />
      <Route path={ADMIN_ROUTES.playersDatabaseLeague} element={lazyRoute(<PlayersDatabaseLeaguePage />)} />
      <Route path={ADMIN_ROUTES.playersDatabaseTeam} element={lazyRoute(<PlayersDatabaseTeamPage />)} />
      <Route path={ADMIN_ROUTES.playersDatabasePlayer} element={lazyRoute(<PlayersDatabasePlayerPage />)} />

      <Route path={ADMIN_ROUTES.abilitiesExplainer} element={lazyRoute(<AbilitiesExplainerPage />)} />
      <Route path={ADMIN_ROUTES.squadSimulator} element={lazyRoute(<SquadSimulatorPage />, <SimulatorSkeleton />)} />
      <Route path={ADMIN_ROUTES.firestoreUsage} element={lazyRoute(<FirestoreUsagePage />)} />
      <Route path={ADMIN_ROUTES.reportsDashboard} element={lazyRoute(<ReportsDashboardPage />)} />

      <Route path={ADMIN_ROUTES.club} element={lazyRoute(<ClubProfilePage />, <ProfileSkeleton />)} />
      <Route path={ADMIN_ROUTES.clubTab} element={lazyRoute(<ClubProfilePage />, <ProfileSkeleton />)} />
      <Route path={ADMIN_ROUTES.team} element={lazyRoute(<TeamProfilePage />, <ProfileSkeleton />)} />
      <Route path={ADMIN_ROUTES.teamTab} element={lazyRoute(<TeamProfilePage />, <ProfileSkeleton />)} />
      <Route path={ADMIN_ROUTES.player} element={lazyRoute(<PlayerProfilePage />, <ProfileSkeleton />)} />
      <Route path={ADMIN_ROUTES.playerTab} element={lazyRoute(<PlayerProfilePage />, <ProfileSkeleton />)} />

      <Route path='*' element={<Navigate to={ROUTE_REDIRECTS.adminFallback} replace />} />
    </>
  )
}

function renderSquadRoutes() {
  return (
    <>
      <Route path={PUBLIC_ROUTES.login} element={<Navigate to={ROUTE_REDIRECTS.squadHome} replace />} />
      <Route path={PUBLIC_ROUTES.register} element={<Navigate to={ROUTE_REDIRECTS.squadHome} replace />} />
      <Route path={PUBLIC_ROUTES.forgotPassword} element={<Navigate to={ROUTE_REDIRECTS.squadHome} replace />} />
      <Route path={PUBLIC_ROUTES.pendingApproval} element={<Navigate to={ROUTE_REDIRECTS.squadHome} replace />} />
      <Route path={ADMIN_ROUTES.root} element={<Navigate to={ROUTE_REDIRECTS.squadHome} replace />} />
      <Route path={ADMIN_ROUTES.squadSimulator} element={lazyRoute(<SquadSimulatorPage />, <SimulatorSkeleton />)} />
      <Route path='*' element={<Navigate to={ROUTE_REDIRECTS.squadHome} replace />} />
    </>
  )
}

export default function renderAuthenticatedRoutes({ isAdmin }) {
  return (
    <Route
      element={
        <AppLayout
          navMode={isAdmin ? 'full' : 'squadSimulator'}
          topbar={
            <TopBar
              title='DevPlan'
              right={<TopBarNotificationsHost />}
            />
          }
          navBadges={{ players: 108, teams: 7, clubs: 3 }}
        />
      }
    >
      {isAdmin ? renderAdminRoutes() : renderSquadRoutes()}
    </Route>
  )
}
