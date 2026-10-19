// src/features/playersDatabase/ui/pages/clubsPage/components/ClubSummaryRow.test.js

import { render, screen } from '@testing-library/react'
import { buildTeamSignalSummary } from '../../../../domain/signals/teamSignalSummary.js'
import ClubSummaryRow from './ClubSummaryRow.js'

jest.mock('../../../components/club/ClubIdentity.js', () => () => <span>מועדון</span>)
jest.mock('../../../../../../ui/core/icons/iconUi.js', () => ({ iconUi: () => null }))

test('renders multiple compact families instead of selecting a single primary signal', () => {
  const summary = buildTeamSignalSummary({ familiesById: {
    performance: { level: 2, availability: 'available' },
    'roster-balance': { level: 1, availability: 'available' },
  } })
  render(<ClubSummaryRow club={{}} model={{ teamSignalSummary: summary }} />)
  expect(screen.getByText('ביצועי השנתון · 2')).toBeInTheDocument()
  expect(screen.getByText('איזון הסגל · 1')).toBeInTheDocument()
  expect(screen.queryByText('איתות מרכזי')).not.toBeInTheDocument()
})

test('renders a missing summary as unknown', () => {
  render(<ClubSummaryRow club={{}} model={{}} />)
  expect(screen.getByText('איתותים טרם חושבו')).toBeInTheDocument()
  expect(screen.queryByText('ללא איתותים')).not.toBeInTheDocument()
})
