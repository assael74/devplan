// src/features/playersDatabase/ui/pages/clubsPage/components/ClubAgeGroupSignalCards.test.js

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { buildTeamSignalSummary } from '../../../../domain/signals/teamSignalSummary.js'
import ClubAgeGroupSignalCards from './ClubAgeGroupSignalCards.js'

jest.mock('../../../../../../ui/core/icons/iconUi.js', () => ({ iconUi: () => null }))

test('shows all active families with their levels and direct links, while missing data stays unknown', () => {
  const summary = buildTeamSignalSummary({ familiesById: {
    'roster-balance': { level: 2, availability: 'available' },
    'future-competition': { level: 1, availability: 'available' },
  } })
  render(<MemoryRouter><ClubAgeGroupSignalCards cards={[{
    id: 'u15', ageGroupLabel: 'נערים ג׳', birthYear: 2012,
    teamSignalSummary: summary, teamHref: '/players-database/leagues/league/teams/club_2012_1?signalSeason=26%2F27',
    context: { tableRank: 3, gamesPlayed: 7, goalsFor: 11, goalsAgainst: 21 },
  }, {
    id: 'u14', ageGroupLabel: 'ילדים א׳', birthYear: 2013, context: {},
  }]} /></MemoryRouter>)

  expect(screen.getByText('נערים ג׳')).toBeInTheDocument()
  expect(screen.getByText('2012')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'איזון הסגל · 2' })).toHaveAttribute('href', expect.stringContaining('insight=roster-balance'))
  expect(screen.getByRole('link', { name: 'צפי התחרות · 1' })).toBeInTheDocument()
  expect(screen.getByText('מקום 3 · 7 מש׳ · 11–21')).toBeInTheDocument()
  expect(screen.getByText('איתותים טרם חושבו')).toBeInTheDocument()
  expect(screen.queryByText('אין איתותים')).not.toBeInTheDocument()
})
