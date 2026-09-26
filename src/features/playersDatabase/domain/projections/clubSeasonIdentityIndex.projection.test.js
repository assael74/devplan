import {
  buildLeagueClubSeasonIdentityEntries,
  buildNextClubSeasonIdentityEntries,
} from './clubSeasonIdentityIndex.projection.js'

describe('clubSeasonIdentityIndex projection', () => {
  const league = {
    id: 'league-a',
    name: 'League A',
    level: 2,
    ageGroupId: 'u15',
  }
  const season = {
    seasonKey: '2026-27',
    birthYear: 2012,
  }

  it('builds deterministic entries from approved league rows', () => {
    const entries = buildLeagueClubSeasonIdentityEntries({
      league,
      season,
      rows: [
        { clubId: 'club-b', clubName: 'B', teamId: 'team-b', teamSlot: 1 },
        { clubId: 'club-a', clubName: 'A', teamId: 'team-a', teamSlot: 1 },
      ],
    })

    expect(entries.map(entry => entry.clubId)).toEqual(['club-a', 'club-b'])
    expect(entries[0]).toMatchObject({
      teamId: 'team-a',
      leagueId: 'league-a',
      leagueLevel: 2,
      ageGroupId: 'u15',
    })
  })

  it('replaces only the current league scope and preserves other leagues', () => {
    const next = buildNextClubSeasonIdentityEntries({
      leagueId: 'league-a',
      existingEntries: [
        { clubId: 'club-old', teamId: 'team-old', teamSlot: 1, leagueId: 'league-a' },
        { clubId: 'club-other', teamId: 'team-other', teamSlot: 1, leagueId: 'league-b' },
      ],
      leagueEntries: [
        { clubId: 'club-new', teamId: 'team-new', teamSlot: 1, leagueId: 'league-a' },
      ],
    })

    expect(next.entries).toHaveLength(2)
    expect(next.entries.some(entry => entry.leagueId === 'league-b')).toBe(true)
    expect(next.entries.some(entry => entry.teamId === 'team-new')).toBe(true)
    expect(next.removedEntries).toEqual([
      expect.objectContaining({ teamId: 'team-old' }),
    ])
  })

  it('treats a club change for the same team as a removed old identity', () => {
    const next = buildNextClubSeasonIdentityEntries({
      leagueId: 'league-a',
      existingEntries: [
        { clubId: 'club-old', teamId: 'team-1', teamSlot: 1, leagueId: 'league-a' },
      ],
      leagueEntries: [
        { clubId: 'club-new', teamId: 'team-1', teamSlot: 1, leagueId: 'league-a' },
      ],
    })

    expect(next.removedEntries).toEqual([
      expect.objectContaining({ clubId: 'club-old', teamId: 'team-1' }),
    ])
  })
})
