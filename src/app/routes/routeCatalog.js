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
  privatePlayers: '/private-players',
  roles: '/roles',
  staffLegacy: '/staff',
  scouting: '/scouting',
  calendar: '/calendar',
  video: '/video',
  tags: '/tags',
  finance: '/finance',
  paymentsLegacy: '/payments',
  abilitiesExplainer: '/abilities/explainer',
  squadSimulator: '/squad-simulator',
  firestoreUsage: '/admin/firestore-usage',
  reportsDashboard: '/dev/reports',
  projectDocuments: '/dev/documents',
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
}
