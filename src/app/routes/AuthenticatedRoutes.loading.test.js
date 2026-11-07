// src/app/routes/AuthenticatedRoutes.loading.test.js

import React, { StrictMode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { Link, MemoryRouter, Routes } from 'react-router-dom'

import renderAuthenticatedRoutes from './AuthenticatedRoutes.js'

jest.mock('../layout/AppLayout', () => {
  const { Outlet } = require('react-router-dom')
  return { __esModule: true, default: Outlet }
})
jest.mock('../../ui/core/layout/TopBar', () => ({ __esModule: true, default: () => null }))
jest.mock('./TopBarNotificationsHost', () => ({ __esModule: true, default: () => null }))
jest.mock('./routeComponents', () => {
  const React = require('react')
  const { useLocation } = require('react-router-dom')
  const Page = () => React.createElement('p', null, useLocation().pathname)
  const names = [
    'AbilitiesExplainerPage', 'CalendarHubPage', 'ClubProfilePage', 'FinancePage',
    'FirestoreUsagePage', 'HomePage', 'HubPage', 'PrivatePage', 'RolesPage',
    'ScoutPage', 'PlayerProfilePage', 'ReportsDashboardPage', 'SquadSimulatorPage',
    'TagsManagementPage', 'TeamProfilePage', 'VideoHubPage',
  ]

  return Object.fromEntries(names.map(name => [name, Page]))
})

const paths = ['/home', '/hub', '/scouting', '/calendar', '/dev/reports', '/admin/firestore-usage']

function App({ isAdmin = true, initialPath = '/home' }) {
  return (
    <StrictMode>
      <MemoryRouter
        initialEntries={[initialPath]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        {paths.map(path => <Link key={path} to={path}>{'Go ' + path}</Link>)}
        <Routes>{renderAuthenticatedRoutes({ isAdmin })}</Routes>
      </MemoryRouter>
    </StrictMode>
  )
}

test('admin pages remain available through navigation', async () => {
  render(<App />)

  for (const path of paths) {
    fireEvent.click(screen.getByText('Go ' + path, { exact: true }))
    expect(await screen.findByText(path, { exact: true })).toBeInTheDocument()
  }
})

test('unknown admin routes fall back to the hub', async () => {
  render(<App initialPath='/removed-feature/nested-page' />)

  expect(await screen.findByText('/hub', { exact: true })).toBeInTheDocument()
})

test('restricted users stay in the squad simulator', async () => {
  render(<App isAdmin={false} />)

  expect(await screen.findByText('/squad-simulator', { exact: true })).toBeInTheDocument()
})
