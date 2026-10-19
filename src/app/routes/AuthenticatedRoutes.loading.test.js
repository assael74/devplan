// src/app/routes/AuthenticatedRoutes.loading.test.js

import React, { StrictMode } from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Link, MemoryRouter, Routes } from 'react-router-dom'
import { doc, getDoc, getDocFromServer, onSnapshot } from 'firebase/firestore'
import renderAuthenticatedRoutes from './AuthenticatedRoutes.js'
import { readLeagueCenterData } from '../../features/playersDatabase/services/read/pages/leagueCenter.read.js'
import { getDocumentStoreSnapshot } from '../../features/playersDatabase/services/cache/index.js'
import { getFirestoreUsageSession, resetFirestoreUsageSession } from '../../services/firestore/usage/firestoreUsage.session.js'

jest.mock('../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(), onSnapshot: jest.fn(), getDoc: jest.fn(), getDocFromServer: jest.fn(),
}))
jest.mock('../layout/AppLayout', () => {
  const { Outlet } = require('react-router-dom')
  return { __esModule: true, default: Outlet }
})
jest.mock('../../ui/core/layout/TopBar', () => ({ __esModule: true, default: () => null }))
jest.mock('./TopBarNotificationsHost', () => ({ __esModule: true, default: () => null }))
jest.mock('./routeComponents', () => {
  const React = require('react')
  const { Outlet, useLocation } = require('react-router-dom')
  const cache = require('../../features/playersDatabase/services/cache/index.js')
  const Scope = require('../../features/playersDatabase/ui/providers/PlayersDatabaseReadScope.js').default
  const Page = () => {
    const { pathname } = useLocation()
    const entry = React.useSyncExternalStore(
      callback => cache.subscribeDocumentStoreKey('leaguesCenter:all', callback),
      () => cache.getDocumentStoreSnapshot('leaguesCenter:all')
    )
    return React.createElement('div', null,
      React.createElement('p', null, pathname),
      React.createElement('p', { 'data-testid': 'center-data' }, Object.keys(entry.data?.leaguesById || {}).join(',')),
      React.createElement(Outlet)
    )
  }
  const names = [
    'AbilitiesExplainerPage', 'CalendarHubPage', 'ClubProfilePage', 'FinancePage', 'FirestoreUsagePage',
    'HomePage', 'HubPage', 'PrivatePage', 'RolesPage', 'ScoutPage', 'PlayerProfilePage',
    'PlayersDatabaseClubsPage', 'PlayersDatabaseClubPage', 'PlayersDatabaseDataOpsLayout',
    'PlayersDatabaseDataOpsPage', 'PlayersDatabaseDataOpsAuditPage', 'PlayersDatabaseDataOpsReceiptsPage',
    'PlayersDatabaseDataOpsSystemAuditPage', 'PlayersDatabaseLeaguePage', 'PlayersDatabaseLeaguesCenterPage',
    'PlayersDatabasePage', 'PlayersDatabasePlayerPage', 'PlayersDatabaseProfilesPage', 'PlayersDatabaseSearchPage',
    'PlayersDatabaseTeamPage', 'ReportsDashboardPage', 'SquadSimulatorPage', 'TagsManagementPage',
    'TeamProfilePage', 'VideoHubPage',
  ]
  return { ...Object.fromEntries(names.map(name => [name, Page])), PlayersDatabaseReadScope: Scope }
})

const paths = [
  '/players-database', '/players-database/leagues', '/players-database/leagues/league-1',
  '/players-database/leagues/league-1/teams/team-1', '/players-database/players/external__12345',
  '/players-database/clubs', '/players-database/clubs/club-1', '/players-database/search',
  '/players-database/profiles', '/players-database/data-ops', '/players-database/data-ops/receipts',
  '/players-database/data-ops/audit', '/players-database/data-ops/system-audit',
  '/admin/firestore-usage', '/home',
]
const sources = []
const centerKey = 'leaguesCenter:all'
const snapshot = (leaguesById, fromCache = false) => ({
  id: 'all', exists: () => true, data: () => ({ leaguesById }), metadata: { fromCache },
})

function App({ sessionKey = 'user-1' }) {
  return (
    <StrictMode>
      <MemoryRouter initialEntries={['/admin/firestore-usage']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {paths.map(path => <Link key={path} to={path}>{`Go ${path}`}</Link>)}
        <Routes>{renderAuthenticatedRoutes({ isAdmin: true, sessionKey })}</Routes>
      </MemoryRouter>
    </StrictMode>
  )
}

const navigate = async path => {
  fireEvent.click(screen.getByText(`Go ${path}`, { exact: true }))
  await waitFor(() => expect(screen.getAllByText(path, { exact: true }).length).toBeGreaterThan(0))
}
const centerSources = () => sources.filter(source => source.ref.path === 'dbLeaguesCenter/all')

beforeEach(() => {
  jest.clearAllMocks()
  sources.length = 0
  resetFirestoreUsageSession()
  doc.mockImplementation((_db, collection, id) => ({ path: `${collection}/${id}`, id }))
  onSnapshot.mockImplementation((ref, onValue, onError) => {
    const source = { ref, onValue, onError, stop: jest.fn() }
    sources.push(source)
    return source.stop
  })
})

test('real admin routes retain one center source, one initial read and the same cache through every page and monitor return', async () => {
  const view = render(<App />)
  expect(centerSources()).toHaveLength(0)
  await navigate('/players-database')
  expect(centerSources()).toHaveLength(1)
  const center = centerSources()[0]
  await act(async () => { center.onValue(snapshot({ first: {} })) })

  for (let cycle = 0; cycle < 2; cycle += 1) {
    for (const path of paths) {
      await navigate(path)
      expect(getDocumentStoreSnapshot(centerKey).data.leaguesById).toEqual({ first: {} })
      await expect(readLeagueCenterData()).resolves.toMatchObject({ leaguesById: { first: {} } })
      expect(centerSources()).toHaveLength(1)
      expect(center.stop).not.toHaveBeenCalled()
    }
  }

  expect(getDoc).not.toHaveBeenCalled()
  expect(getDocFromServer).not.toHaveBeenCalled()
  expect(getFirestoreUsageSession().byCollection.dbLeaguesCenter).toMatchObject({ listeners: 1, reads: 1, listenerInitials: 1 })
  await act(async () => { center.onValue(snapshot({ first: {}, addedAfterSave: {} })) })
  expect(screen.getByTestId('center-data')).toHaveTextContent('addedAfterSave')
  expect(centerSources()).toHaveLength(1)
  expect(getFirestoreUsageSession().byCollection.dbLeaguesCenter).toMatchObject({ reads: 2, listenerUpdates: 1 })
  view.unmount()
  expect(center.stop).toHaveBeenCalledTimes(1)
  expect(getDocumentStoreSnapshot(centerKey).status).toBe('idle')
})

test('only explicit server refresh adds a getDocFromServer read and a new session opens a new source', async () => {
  const view = render(<App />)
  await navigate('/players-database/leagues')
  await act(async () => { centerSources()[0].onValue(snapshot({ old: {} })) })
  getDocFromServer.mockResolvedValue(snapshot({ refreshed: {} }))
  await act(async () => { await readLeagueCenterData({ fromServer: true }) })
  expect(getDocFromServer).toHaveBeenCalledTimes(1)
  expect(getDocumentStoreSnapshot(centerKey).data.leaguesById).toEqual({ refreshed: {} })
  expect(centerSources()).toHaveLength(1)
  const previous = centerSources()[0]
  view.rerender(<App sessionKey="user-2" />)
  await waitFor(() => expect(centerSources()).toHaveLength(2))
  expect(previous.stop).toHaveBeenCalledTimes(1)
  expect(centerSources()).toHaveLength(2)
  expect(getDocumentStoreSnapshot(centerKey).data).toBeNull()
})
