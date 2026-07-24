// src/app/routes/routeComponents.js

import React from 'react'

const loadHomePage = () => import('../../features/home/HomePage')
const loadCalendarHubPage = () => import('../../features/calendarHub/CalendarHubPage')
const loadVideoHubPage = () => import('../../features/videoHub/VideoHubPage')
const loadTagsManagementPage = () => import('../../features/tagsHub/TagsManagementPage.js')
const loadPlayersDatabasePage = () => import('../../features/playersDatabase/index.js')
const loadHubPage = () => import('../../features/hub/ui/HubPage')
const loadPlayerProfilePage = () => import('../../features/hub/playerProfile/PlayerProfilePage')
const loadTeamProfilePage = () => import('../../features/hub/teamProfile/TeamProfilePage')
const loadClubProfilePage = () => import('../../features/hub/clubProfile/ClubProfilePage')
const loadAbilitiesPublicRouteEntry = () => import('./AbilitiesPublicRouteEntry.js')
const loadPublicReportPage = () =>
  import('../../features/reports/index.js').then(module => ({
    default: module.PublicReportPage,
  }))
const loadLoginPage = () => import('../../features/auth/pages/LoginPage')
const loadRegisterPage = () => import('../../features/auth/pages/RegisterPage')
const loadForgotPasswordPage = () => import('../../features/auth/pages/ForgotPasswordPage')
const loadPendingApprovalPage = () => import('../../features/auth/pages/PendingApprovalPage')
const loadFirestoreUsagePage = () => import('../../features/firestoreUsage/FirestoreUsagePage.js')

const loadPlayersDatabaseLeaguesCenterPage = () =>
  import('../../features/playersDatabase/index.js').then(module => ({
    default: module.LeaguesCenterPage,
  }))

const loadPlayersDatabaseLeaguePage = () =>
  import('../../features/playersDatabase/index.js').then(module => ({
    default: module.LeaguePage,
  }))

const loadPlayersDatabaseTeamPage = () =>
  import('../../features/playersDatabase/index.js').then(module => ({
    default: module.TeamPage,
  }))

const loadPlayersDatabasePlayerPage = () =>
  import('../../features/playersDatabase/index.js').then(module => ({
    default: module.PlayerPage,
  }))

const loadPlayersDatabaseSearchPage = () =>
  import('../../features/playersDatabase/index.js').then(module => ({
    default: module.SearchPage,
  }))

const loadPlayersDatabaseProfilesPage = () =>
  import('../../features/playersDatabase/index.js').then(module => ({
    default: module.ProfilesPage,
  }))

const loadAbilitiesExplainerPage = () =>
  import('../../features/abilities/explainer/AbilitiesExplainerPage.js')

const loadSquadSimulatorPage = () =>
  import('../../features/squadSimulator/index.js').then(module => ({
    default: module.SquadSimulatorPage,
  }))

const loadReportsDashboardPage = () =>
  import('../../features/reports/index.js').then(module => ({
    default: module.DashboardPage,
  }))

export const HomePage = React.lazy(loadHomePage)
export const CalendarHubPage = React.lazy(loadCalendarHubPage)
export const VideoHubPage = React.lazy(loadVideoHubPage)
export const TagsManagementPage = React.lazy(loadTagsManagementPage)
export const PlayersDatabasePage = React.lazy(loadPlayersDatabasePage)
export const PlayersDatabaseLeaguesCenterPage = React.lazy(loadPlayersDatabaseLeaguesCenterPage)
export const PlayersDatabaseLeaguePage = React.lazy(loadPlayersDatabaseLeaguePage)
export const PlayersDatabaseTeamPage = React.lazy(loadPlayersDatabaseTeamPage)
export const PlayersDatabasePlayerPage = React.lazy(loadPlayersDatabasePlayerPage)
export const PlayersDatabaseSearchPage = React.lazy(loadPlayersDatabaseSearchPage)
export const PlayersDatabaseProfilesPage = React.lazy(loadPlayersDatabaseProfilesPage)

export const HubPage = React.lazy(loadHubPage)
export const PlayerProfilePage = React.lazy(loadPlayerProfilePage)
export const TeamProfilePage = React.lazy(loadTeamProfilePage)
export const ClubProfilePage = React.lazy(loadClubProfilePage)

export const AbilitiesPublicRouteEntry = React.lazy(loadAbilitiesPublicRouteEntry)
export const PublicReportPage = React.lazy(loadPublicReportPage)
export const AbilitiesExplainerPage = React.lazy(loadAbilitiesExplainerPage)

export const LoginPage = React.lazy(loadLoginPage)
export const RegisterPage = React.lazy(loadRegisterPage)
export const ForgotPasswordPage = React.lazy(loadForgotPasswordPage)
export const PendingApprovalPage = React.lazy(loadPendingApprovalPage)

export const SquadSimulatorPage = React.lazy(loadSquadSimulatorPage)
export const FirestoreUsagePage = React.lazy(loadFirestoreUsagePage)
export const ReportsDashboardPage = React.lazy(loadReportsDashboardPage)

export const ADMIN_ROUTE_LOADERS = [
  loadHubPage,
  loadCalendarHubPage,
  loadVideoHubPage,
  loadTagsManagementPage,
  loadFirestoreUsagePage,
  loadReportsDashboardPage,
]

export const SQUAD_ROUTE_LOADERS = [loadSquadSimulatorPage]

export function preloadRoutes(loaders) {
  loaders.forEach(loader => {
    loader().catch(() => {})
  })
}
