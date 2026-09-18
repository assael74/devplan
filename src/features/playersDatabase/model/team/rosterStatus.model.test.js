import {
  countCurrentRosterPlayers,
  isCurrentRosterPlayer,
  ROSTER_STATUS,
} from './rosterStatus.model.js'
import { adaptTeamBalanceInput } from '../../domain/adapters/teamBalanceInput.adapter.js'

describe('Team Season roster status contract', () => {
  const players = [
    { playerId: 'regular', rosterStatus: ROSTER_STATUS.REGULAR, playerStats: { games: 8 } },
    { playerId: 'left', rosterStatus: ROSTER_STATUS.LEFT, playerStats: { games: 6 } },
    { playerId: 'younger', rosterStatus: ROSTER_STATUS.YOUNGER_AGE_GROUP, playerStats: { games: 4 } },
  ]

  test('counts regular players only as the current roster', () => {
    expect(countCurrentRosterPlayers(players)).toBe(1)
    expect(isCurrentRosterPlayer(players[0])).toBe(true)
    expect(isCurrentRosterPlayer(players[1])).toBe(false)
    expect(isCurrentRosterPlayer(players[2])).toBe(false)
  })

  test('excludes left and younger participants from Team Balance input', () => {
    expect(adaptTeamBalanceInput({ teamPlayers: players }).players).toEqual([
      expect.objectContaining({ playerId: 'regular' }),
    ])
  })
})
