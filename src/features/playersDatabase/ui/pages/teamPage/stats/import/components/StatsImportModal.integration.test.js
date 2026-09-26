import * as React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import StatsImportModal from './StatsImportModal.js'
import useTeamStatsImport from '../hooks/useTeamStatsImport.js'

const mockPrepareStatsImportPlanV2 = jest.fn()
const mockRunStatsFinalSyncStageV2 = jest.fn()

jest.mock('../../../../../../services/writeV2/stats/index.js', () => ({
  STATS_FINAL_SYNC_STAGES: [
    'canonical',
    'counterparts',
    'playerDocuments',
    'playerIndexes',
    'teamLeague',
    'clubs',
  ],
  prepareStatsImportPlanV2: (...args) => mockPrepareStatsImportPlanV2(...args),
  runStatsFinalSyncStageV2: (...args) => mockRunStatsFinalSyncStageV2(...args),
}))

jest.mock('../../../../../../services/read/identity/playerIdentityPreview.read.js', () => ({
  resolveTeamPlayerIdentities: jest.fn(async ({ players }) => players),
}))

jest.mock('../../../../../../services/read/index.js', () => ({
  buildLeagueTeamPerformanceProjection: jest.fn(() => ({
    teamGamePlayed: 1,
    goalsFor: 1,
    goalsAgainst: 0,
    tableRank: 1,
  })),
  listExistingTeamRootOptions: jest.fn(async () => []),
}))

jest.mock('../../../../../../domain/projections/teamPerformance.projection.js', () => ({
  resolveLeagueTeamPoints: jest.fn(() => 3),
}))

jest.mock('../../../../../../domain/validation/playerStatsLeague.validation.js', () => ({
  validatePlayerStatsAgainstLeague: jest.fn(() => ({
    valid: true,
    checks: [],
  })),
}))

jest.mock('../../../../../../model/team/page/teamPageSeason.model.js', () => ({
  findTeamPageSeasonDoc: jest.fn(({ teamSeasons }) => teamSeasons[0] || null),
}))

jest.mock('../../../../../../model/team/page/teamPagePlayer.model.js', () => ({
  adaptTeamPagePlayerRow: jest.fn(({ player }) => player),
}))

jest.mock('../logic/teamStatsImport.logic.js', () => ({
  parsePlayerStatsRows: jest.fn(() => [{
    playerId: 'player-1',
    fullName: 'שחקן בדיקה',
    games: 1,
    minutes: 90,
    goals: 0,
    assists: 0,
  }]),
}))

jest.mock('../../shared/logic/teamStatsMatch.logic.js', () => ({
  STATS_IDENTITY_STATUS: {
    ROSTER_MATCH: 'roster_match',
    AMBIGUOUS: 'ambiguous',
    SYSTEM_CANDIDATE: 'system_candidate',
    NEW_PLAYER: 'new_player',
    SYSTEM_MATCH: 'system_match',
  },
  buildRosterLookup: jest.fn(() => new Map()),
  enrichStatsRowForPreview: jest.fn(row => ({
    ...row,
    identityStatus: 'roster_match',
    rosterStatus: 'regular',
  })),
  applyResolvedStatsIdentity: jest.fn(({ row }) => row),
}))

jest.mock('../logic/teamStatsRowEdit.logic.js', () => ({
  updateStatsImportRow: jest.fn(({ row }) => row),
}))

jest.mock('../logic/teamStatsPreview.model.js', () => ({
  buildStatsPreviewModel: jest.fn(({ rows }) => rows),
  buildStatsMovementPreviewModel: jest.fn(() => ({
    requiresDecision: false,
  })),
  snapshotStatsPreviewProfiles: jest.fn(() => ({})),
}))

jest.mock('../../../logic/writeFlowReport.logic.js', () => ({
  buildWriteReportFromError: jest.fn(() => null),
}))

const team = {
  teamId: 'team-1',
  teamDocumentId: 'team-1',
  birthTeamDocumentId: 'team-1',
  name: 'קבוצת בדיקה',
  ageGroupId: 'u15',
  birthYear: 2011,
}

const seasonOption = {
  optionKey: 'season-2026',
  seasonKey: '2026-27',
  seasonId: '28',
  leagueId: 'league-1',
  target: 'current',
  season: {
    seasonKey: '2026-27',
    seasonId: '28',
  },
}

const teamSeason = {
  id: 'team-1__2026-27',
  seasonKey: '2026-27',
  teamPlayers: [{
    playerId: 'player-1',
    fullName: 'שחקן בדיקה',
    rosterStatus: 'regular',
  }],
}

const approvedPlan = {
  planType: 'stats_v2',
  planVersion: 1,
  identity: {
    teamId: 'team-1',
    leagueId: 'league-1',
    seasonKey: '2026-27',
  },
  teamSeason: {
    playersCount: 1,
  },
  counterpartMovementPatches: [],
  playerDocumentPlans: [],
  playerSearchIndexStates: [],
  clubProjectionPatches: [],
}

function Harness() {
  const controller = useTeamStatsImport({
    leagueId: 'league-1',
    leagueDoc: { id: 'league-1' },
    leagueDocuments: [{ id: 'league-1' }],
    team,
    teamDoc: { id: 'team-1' },
    teamSeasons: [teamSeason],
    seasonOptions: [seasonOption],
    selectedSeasonOption: seasonOption,
    notify: jest.fn(),
    reload: jest.fn(),
  })

  React.useEffect(() => {
    controller.openModal()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <StatsImportModal
      team={team}
      seasonKey='2026-27'
      activeSeasonOptionKey={seasonOption.optionKey}
      hasTeamPlayers
      columns={[]}
      source={{}}
      controller={controller}
    />
  )
}

describe('StatsImportModal V2 integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()

    mockPrepareStatsImportPlanV2.mockResolvedValue(approvedPlan)
    mockRunStatsFinalSyncStageV2.mockResolvedValue({ completed: true })
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  test('Approval opens manual Final Sync and Close stays blocked until all six stages complete', async () => {
    render(<Harness />)

    expect(screen.queryByText('סנכרון סופי')).not.toBeInTheDocument()

    fireEvent.click(await screen.findByRole('button', { name: 'המשך לקליטת נתונים' }))

    const pasteInput = screen.getByRole('textbox')
    fireEvent.change(pasteInput, { target: { value: 'stats row' } })
    fireEvent.click(screen.getByRole('button', { name: 'המשך לזיהוי ואישור' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'אישור טעינת סטטיסטיקות' })).toBeInTheDocument()
    })

    await act(async () => {
      jest.advanceTimersByTime(300)
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(mockPrepareStatsImportPlanV2).toHaveBeenCalled()
    })

    fireEvent.click(screen.getByRole('button', { name: 'אישור טעינת סטטיסטיקות' }))

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'הפעל שלב' })).toHaveLength(6)
    })

    const closeButton = screen.getByRole('button', { name: 'סגור' })
    expect(closeButton).toBeDisabled()
    expect(mockRunStatsFinalSyncStageV2).not.toHaveBeenCalled()

    const stages = [
      'canonical',
      'counterparts',
      'playerDocuments',
      'playerIndexes',
      'teamLeague',
      'clubs',
    ]

    for (let index = 0; index < stages.length; index += 1) {
      const stageButtons = screen.getAllByRole('button', { name: 'הפעל שלב' })

      expect(stageButtons[index]).toBeEnabled()
      if (index + 1 < stages.length) {
        expect(stageButtons[index + 1]).toBeDisabled()
      }

      fireEvent.click(stageButtons[index])

      await waitFor(() => {
        expect(mockRunStatsFinalSyncStageV2).toHaveBeenCalledTimes(index + 1)
      })

      expect(mockRunStatsFinalSyncStageV2.mock.calls[index][0].stage).toBe(stages[index])

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: 'הפעל שלב' })[index]).toBeDisabled()
      })

      if (index + 1 < stages.length) {
        expect(mockRunStatsFinalSyncStageV2).toHaveBeenCalledTimes(index + 1)
      }
    }

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'סגור' })).toBeEnabled()
    })

    expect(mockRunStatsFinalSyncStageV2).toHaveBeenCalledTimes(6)
  })
})
