import { buildStatsAbsentTeamSeasonState } from '../statsV2/statsAbsence.builder.js'
import { getTeamSeasonStatsState } from '../statsV2/teamSeasonStatsState.js'
import { buildPreparedTeamSeasonRoster } from './approvedRosterCanonical.builder.js'
import { ROSTER_IMPORT_MODE } from '../movement/index.js'

const season = {
  seasonId: '26/27',
  seasonKey: '26/27',
  seasonStatus: 'active',
  leagueId: 'league-1',
}

const rosterImport = {
  mode: ROSTER_IMPORT_MODE.AUTHORITATIVE_SNAPSHOT,
  sourceSnapshotKey: 'snapshot-1',
  contentHash: 'hash-1',
}

const movementState = {
  transfersIn: [],
  transfersOut: [],
  pendingPlayers: [],
  resolvedRosterAbsences: [],
}

const players = [
  { playerId: 'p1', externalPlayerId: '10001', fullName: 'Player One' },
  { playerId: 'p2', externalPlayerId: '10002', fullName: 'Player Two' },
]

const prepare = ({ existingSeason = null } = {}) => buildPreparedTeamSeasonRoster({
  season,
  team: { birthTeamDocumentId: 'team-1', clubId: 'club-1' },
  existingSeason,
  players,
  rosterImport,
  movementState,
})

describe('Roster import preserves Stats absence', () => {
  test('a new roster-only season starts with canonical absent Stats', () => {
    const prepared = prepare()

    expect(getTeamSeasonStatsState(prepared.persistedSeason)).toBe('absent')
    expect(prepared.persistedSeason.teamBalance.lineStructure.relevantPlayersCount).toBe(0)
  })

  test('roster import does not rebuild Balance after Clear Stats', () => {
    const existingSeason = buildStatsAbsentTeamSeasonState({
      id: 'team-1__26_27',
      birthTeamDocumentId: 'team-1',
      ...season,
      teamPlayers: [players[0]],
      playersCount: 1,
    })
    const absentBalance = existingSeason.teamBalance

    const prepared = prepare({ existingSeason })

    expect(prepared.persistedSeason.teamBalance).toEqual(absentBalance)
    expect(prepared.persistedSeason.teamPlayers).toHaveLength(2)
    expect(getTeamSeasonStatsState(prepared.persistedSeason)).toBe('absent')
  })
})
