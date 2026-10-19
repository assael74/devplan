// src/features/playersDatabase/ui/pages/leaguePage/components/LeagueFutureCompetitionBadge.test.js

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import LeagueFutureCompetitionBadge from './LeagueFutureCompetitionBadge.js'
import { buildTeamSignalSummary } from '../../../../domain/signals/teamSignalSummary.js'
import { getLeagueById } from '../../../../services/read/index.js'

jest.mock('../../../../services/read/index.js', () => ({ getLeagueById: jest.fn() }))
jest.mock('../../../../../../ui/core/icons/iconUi.js', () => ({ iconUi: () => null }))

const seasonId = '2026_2027'
const row = { id: 'target', clubId: 'club', teamSlot: 1, teamSignalSummary: buildTeamSignalSummary() }
const context = {
  seasonId, birthYear: 2012,
  leaguesCenterDocument: { leaguesById: { older: { seasonsById: { [seasonId]: {
    birthYear: 2011, teamsById: { source: { clubId: 'club', teamSlot: 1 } },
  } } } } },
}
const league = {
  leagueId: 'older', level: 1, seasonsById: { [seasonId]: {
    birthYear: 2011, seasonStatus: 'active', leagueTotalRound: 38,
    competitionRules: { configured: true, relegation: { directPlaces: [18, 19, 20] } },
    table: { teamsById: { source: {
      clubId: 'club', teamSlot: 1, officialTable: { rank: 1, points: 22, teamGamePlayed: 8 },
    } } },
  } },
}

beforeEach(() => {
  jest.clearAllMocks()
  getLeagueById.mockResolvedValue(league)
})

test('reads the source through the cached reader only when the missing-data tooltip opens', async () => {
  render(<LeagueFutureCompetitionBadge row={row} context={context} />)
  expect(getLeagueById).not.toHaveBeenCalled()
  fireEvent.mouseOver(screen.getByLabelText(/צפי התחרות: טוען/))
  await waitFor(() => expect(getLeagueById).toHaveBeenCalledWith('older'))
  await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent('שנתון 2011: טרם הושלמו 50% ממשחקי העונה'))
})

test('an unavailable source match is explained without reading an arbitrary league', async () => {
  render(<LeagueFutureCompetitionBadge row={{ ...row, teamSlot: 2 }} context={context} />)
  fireEvent.mouseOver(screen.getByLabelText(/חסרים נתוני השנתון המשפיע/))
  expect(await screen.findByRole('tooltip')).toHaveTextContent('חסרים נתוני השנתון המשפיע')
  expect(getLeagueById).not.toHaveBeenCalled()
})

test('failed source reads display a loading error instead of claiming missing rules or early games', async () => {
  getLeagueById.mockRejectedValue(new Error('offline'))
  render(<LeagueFutureCompetitionBadge row={row} context={context} />)
  fireEvent.mouseOver(screen.getByLabelText(/צפי התחרות: טוען/))
  await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent('טעינת נתוני ליגת המקור נכשלה'))
})
