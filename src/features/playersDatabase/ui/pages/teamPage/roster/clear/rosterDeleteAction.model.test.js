// src/features/playersDatabase/ui/pages/teamPage/roster/clear/rosterDeleteAction.model.test.js

import { resolveNextTeamSeasonDeleteAction } from './rosterDeleteAction.model.js'

const teamSeason = ({ statsStatus = 'missing' } = {}) => ({
  identity: {
    teamId: 'club-1_2011_1',
    seasonId: '2026_2027',
    leagueId: 'league-1',
  },
  roster: {
    playersById: { 'player__2011__10000': { rosterStatus: 'regular' } },
    rosterImport: { contentHash: 'hash-1' },
  },
  movement: { transfersInById: {}, transfersOutById: {}, pendingById: {} },
  stats: { statsLoadState: { status: statsStatus } },
})

const target = {
  teamId: 'club-1_2011_1',
  seasonId: '2026_2027',
  leagueId: 'league-1',
}

describe('resolveNextTeamSeasonDeleteAction', () => {
  test('requires Stats clear before Roster clear', () => {
    expect(resolveNextTeamSeasonDeleteAction({
      ...target,
      teamSeason: teamSeason({ statsStatus: 'loaded' }),
    })).toBe('stats')
  })

  test('selects Roster clear for the canonical target after Stats is absent', () => {
    expect(resolveNextTeamSeasonDeleteAction({
      ...target,
      teamSeason: teamSeason(),
    })).toBe('roster')
  })

  test('rejects a mismatched canonical target', () => {
    expect(resolveNextTeamSeasonDeleteAction({
      ...target,
      seasonId: '2025_2026',
      teamSeason: teamSeason(),
    })).toBeNull()
  })
})
