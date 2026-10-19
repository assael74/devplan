// src/features/playersDatabase/ui/providers/PlayersDatabaseReadScope.test.js

import React, { StrictMode } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom'
import PlayersDatabaseReadScope from './PlayersDatabaseReadScope.js'
import { subscribeLeagueCenterData } from '../../services/read/pages/leagueCenter.read.js'
import { subscribeClubsDirectoryDocument } from '../../services/read/pages/clubs.read.js'
import { clearPlayersDatabaseDocumentCache } from '../../services/cache/index.js'

jest.mock('../../services/read/pages/leagueCenter.read.js', () => ({ subscribeLeagueCenterData: jest.fn() }))
jest.mock('../../services/read/pages/clubs.read.js', () => ({ subscribeClubsDirectoryDocument: jest.fn() }))
jest.mock('../../services/cache/index.js', () => ({ clearPlayersDatabaseDocumentCache: jest.fn() }))

const centerStop = jest.fn()
const directoryStop = jest.fn()

function App({ start = '/home', sessionKey = 'user-1' }) {
  return (
    <StrictMode>
      <MemoryRouter initialEntries={[start]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Link to="/players-database/leagues">Database</Link>
        <Link to="/players-database/leagues/league-1/teams/team-1">Team</Link>
        <Link to="/admin/firestore-usage">Usage</Link>
        <Routes>
          <Route element={<PlayersDatabaseReadScope key={sessionKey} />}>
            <Route path="*" element={<div>Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </StrictMode>
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  subscribeLeagueCenterData.mockReturnValue(centerStop)
  subscribeClubsDirectoryDocument.mockReturnValue(directoryStop)
})

test('opens the center only on first database visit and reuses it through navigation and return', async () => {
  const view = render(<App />)
  expect(subscribeLeagueCenterData).not.toHaveBeenCalled()
  await act(async () => { fireEvent.click(screen.getByText('Database')) })
  expect(subscribeLeagueCenterData).toHaveBeenCalledTimes(1)
  await act(async () => { fireEvent.click(screen.getByText('Team')) })
  await act(async () => { fireEvent.click(screen.getByText('Usage')) })
  expect(centerStop).not.toHaveBeenCalled()
  expect(directoryStop).toHaveBeenCalledTimes(1)
  await act(async () => { fireEvent.click(screen.getByText('Database')) })
  expect(subscribeLeagueCenterData).toHaveBeenCalledTimes(1)
  clearPlayersDatabaseDocumentCache.mockClear()
  view.unmount()
  expect(centerStop).toHaveBeenCalledTimes(1)
  expect(clearPlayersDatabaseDocumentCache).toHaveBeenCalledTimes(1)
})

test('direct entry in StrictMode opens one center source and a new user gets a new session', async () => {
  const view = render(<App start="/players-database/leagues" />)
  await act(async () => {})
  expect(subscribeLeagueCenterData).toHaveBeenCalledTimes(1)
  view.rerender(<App start="/players-database/leagues" sessionKey="user-2" />)
  await act(async () => {})
  expect(centerStop).toHaveBeenCalledTimes(1)
  expect(subscribeLeagueCenterData).toHaveBeenCalledTimes(2)
})
