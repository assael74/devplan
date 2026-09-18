import { render, screen } from '@testing-library/react'

import ClubAgeGroupSignalCards from './ClubAgeGroupSignalCards.js'
import ClubSummarySpotlight from './ClubSummarySpotlight.js'

const model = {
  state: 'signal',
  type: 'FUTURE_LEAGUE_PATH_RISE',
  title: 'עלייה צפויה ברמת הליגה',
  teams: [{
    teamId: 'club_2012_1',
    ageGroupLabel: "נערים ג'",
    birthYear: 2012,
    teamSlot: 1,
  }, {
    teamId: 'club_2011_1',
    ageGroupLabel: "נערים ב'",
    birthYear: 2011,
    teamSlot: 1,
  }],
  additionalTeamsCount: 1,
}

describe('ClubSummarySpotlight', () => {
  test('renders Signal First from the shared model', () => {
    render(<ClubSummarySpotlight model={model} />)

    const text = screen.getByText('עלייה').parentElement.parentElement
      .parentElement.textContent

    expect(text).toBe("עלייה צפויה ברמת הליגהנערים ג' · 2012·נערים ב' · 2011\u200E+1")
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument()
  })

  test('uses the required no-signal placeholder', () => {
    render(<ClubSummarySpotlight model={{ state: 'empty' }} />)

    expect(screen.getByText('אין איתותים')).toBeInTheDocument()
  })

  test('renders the partial-coverage summary state', () => {
    render(<ClubSummarySpotlight model={{
      state: 'partialCoverage',
      message: 'כיסוי חלקי',
    }} />)

    expect(screen.getByText('כיסוי חלקי')).toBeInTheDocument()
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument()
  })

  test('renders the no-coverage summary state', () => {
    render(<ClubSummarySpotlight model={{
      state: 'noCoverage',
      message: 'אין כיסוי',
      title: 'חסר כיסוי לאיתות מסלול ליגה',
      action: 'טען ליגה:',
      ageGroups: [{
        ageGroupLabel: 'ילדים א׳',
        birthYear: 2013,
      }, {
        ageGroupLabel: 'נערים ג׳',
        birthYear: 2012,
      }, {
        ageGroupLabel: 'נערים ב׳',
        birthYear: 2011,
      }],
    }} />)

    expect(screen.getByText('חסר כיסוי לאיתות מסלול ליגה')).toBeInTheDocument()
    expect(screen.getByText('טען ליגה:')).toBeInTheDocument()
    expect(screen.getByText('ילדים א׳ · 2013 · נערים ג׳ · 2012 · נערים ב׳ · 2011')).toBeInTheDocument()
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument()
  })

  test('renders a team card with its primary signal and existing context', () => {
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
          defensePriorityValue: 'neutral',
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
  })
})
