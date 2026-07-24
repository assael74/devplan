// src/app/routes/routeCatalog.js

export const PUBLIC_ROUTES = {
  abilitiesForm: '/forms/abilities/:token',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  pendingApproval: '/pending-approval',
}

export const ADMIN_ROUTES = {
  root: '/',
  home: '/home',
  hub: '/hub',
  calendar: '/calendar',
  video: '/video',
  tags: '/tags',
  playersDatabase: '/players-database',
  playersDatabaseLeagues: '/players-database/leagues',
  playersDatabaseSearch: '/players-database/search',
  playersDatabaseProfiles: '/players-database/profiles',
  playersDatabaseLegacyScan: '/players-database/scan',
  playersDatabaseLeague: '/players-database/leagues/:leagueId',
  playersDatabaseTeam: '/players-database/leagues/:leagueId/teams/:teamId',
  playersDatabasePlayer: '/players-database/players/:playerId',
  abilitiesExplainer: '/abilities/explainer',
  squadSimulator: '/squad-simulator',
  firestoreUsage: '/admin/firestore-usage',
  reportsDashboard: '/dev/reports',
  club: '/clubs/:clubId',
  clubTab: '/clubs/:clubId/:tabKey',
  team: '/teams/:teamId',
  teamTab: '/teams/:teamId/:tabKey',
  player: '/players/:playerId',
  playerTab: '/players/:playerId/:tabKey',
}

export const ROUTE_REDIRECTS = {
  signedOut: PUBLIC_ROUTES.login,
  pendingApproval: PUBLIC_ROUTES.pendingApproval,
  adminHome: ADMIN_ROUTES.home,
  adminFallback: ADMIN_ROUTES.hub,
  squadHome: ADMIN_ROUTES.squadSimulator,
  playersDatabaseSearch: ADMIN_ROUTES.playersDatabaseSearch,
}
