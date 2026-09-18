import { render, screen } from '@testing-library/react'

import ClubAgeGroupSignalCards from './ClubAgeGroupSignalCards.js'

describe('ClubAgeGroupSignalCards', () => {
  test('renders the team primary signal and its existing context', () => {
    render(
      <ClubAgeGroupSignalCards cards={[{
        id: 'u15',
        ageGroupLabel: 'נערים ג׳',
        birthYear: 2012,
        signal: {
          id: 'FUTURE_LEAGUE_PATH_RISE:2012:team:club_2012_1',
          type: 'FUTURE_LEAGUE_PATH_RISE',
          title: 'עלייה צפויה ברמת הליגה',
        },
        context: {
          leagueName: 'ליגת העל',
          leagueLevel: 1,
          tableRank: 3,
          gamesPlayed: 7,
          goalsFor: 11,
          goalsAgainst: 21,
          offensePriorityValue: 'high',
          offensePriorityLabel: undefined,
          defensePriorityValue: 'neutral',
          defensePriorityLabel: undefined,
        },
      }, {
        id: 'u14',
        ageGroupLabel: 'ילדים א׳',
        birthYear: 2013,
        signal: null,
        context: {},
      }]} />
    )

    expect(screen.getByText('נערים ג׳ · 2012')).toBeInTheDocument()
    expect(screen.getByText('עלייה')).toBeInTheDocument()
    expect(screen.getByText('מקום 3 · 11–21 · 7 מש׳')).toBeInTheDocument()
    expect(screen.getByText('איתותים')).toBeInTheDocument()
    expect(screen.getByText('אין איתותים')).toBeInTheDocument()
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument()
  })
})
