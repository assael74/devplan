import * as React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import StatsImportModal from './StatsImportModal.js'
import useTeamStatsImport from '../hooks/useTeamStatsImport.js'

const mockPrepareStatsImportPlanV2 = jest.fn()
const mockRunStatsFinalSyncStageV2 = jest.fn()
const mockCreateWriteActionReceiptV2 = jest.fn()
const mockReportWriteActionCanonicalStatusV2 = jest.fn()
const mockSaveWriteActionAuditSummaryV2 = jest.fn()
const mockCloseWriteActionReceiptV2 = jest.fn()
const mockAuditStatsV2 = jest.fn()

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

jest.mock('../../../../../../services/writeV2/receipt/index.js', () => ({
  WRITE_ACTION_V2_CANONICAL_STATUS: {
    REPORTED: 'reported',
    FAILED_OR_UNKNOWN: 'failed_or_unknown',
  },
  WRITE_ACTION_V2_FLOW_TYPE: { STATS: 'stats' },
  createWriteActionReceiptV2: (...args) => mockCreateWriteActionReceiptV2(...args),
  reportWriteActionCanonicalStatusV2: (...args) => mockReportWriteActionCanonicalStatusV2(...args),
  saveWriteActionAuditSummaryV2: (...args) => mockSaveWriteActionAuditSummaryV2(...args),
  closeWriteActionReceiptV2: (...args) => mockCloseWriteActionReceiptV2(...args),
}))

jest.mock('../../../../../../services/auditV2/index.js', () => ({
  auditStatsV2: (...args) => mockAuditStatsV2(...args),
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
  validatePlayerStatsAgainstLeague: () => ({
    valid: true,
    checks: [],
    rowIssues: [],
    context: {},
  }),
}))

jest.mock('../../../../../../model/team/page/teamPageSeason.model.js', () => ({
  findTeamPageSeasonDoc: ({ teamSeasons }) => teamSeasons[0] || null,
}))

jest.mock('../../../../../../model/team/page/teamPagePlayer.model.js', () => ({
  adaptTeamPagePlayerRow: ({ player }) => player,
}))

jest.mock('../logic/teamStatsImport.logic.js', () => ({
  buildApprovedStatsImportPlayer: row => ({
    ...row,
    statsStatus: 'loaded',
    playerStats: {
      games: row.games,
      goals: row.goals,
      minutes: row.minutes,
    },
  }),
  parsePlayerStatsRows: () => [{
    playerId: 'player-1',
    fullName: 'שחקן בדיקה',
    games: 1,
    minutes: 90,
    goals: 0,
    assists: 0,
  }],
}))

jest.mock('../../shared/logic/teamStatsMatch.logic.js', () => ({
  STATS_IDENTITY_STATUS: {
    ROSTER_MATCH: 'roster_match',
    AMBIGUOUS: 'ambiguous',
    SYSTEM_CANDIDATE: 'system_candidate',
    NEW_PLAYER: 'new_player',
    SYSTEM_MATCH: 'system_match',
  },
  buildRosterLookup: () => new Map(),
  enrichStatsRowForPreview: row => ({
    ...row,
    identityStatus: 'roster_match',
    rosterStatus: 'regular',
  }),
  applyResolvedStatsIdentity: ({ row }) => row,
}))

jest.mock('../logic/teamStatsRowEdit.logic.js', () => ({
  updateStatsImportRow: ({ row }) => row,
}))

jest.mock('../logic/teamStatsPreview.model.js', () => ({
  buildStatsPreviewModel: ({ rows }) => rows,
  buildStatsMovementPreviewModel: () => ({
    requiresDecision: false,
  }),
  snapshotStatsPreviewProfiles: () => ({}),
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
    jest.useRealTimers()

    mockPrepareStatsImportPlanV2.mockImplementation(async input => ({
      ...approvedPlan,
      approvedAt: input.approvedAt,
      playerSearchIndexStates: [{
        fields: {
          statsSnapshots: {
            current: { capturedAt: input.approvedAt },
          },
        },
      }],
    }))
    mockRunStatsFinalSyncStageV2.mockResolvedValue({ completed: true })
    mockCreateWriteActionReceiptV2.mockResolvedValue('receipt-1')
    mockReportWriteActionCanonicalStatusV2.mockResolvedValue()
    mockSaveWriteActionAuditSummaryV2.mockResolvedValue()
    mockCloseWriteActionReceiptV2.mockResolvedValue()
    mockAuditStatsV2.mockResolvedValue({
      coverage: { complete: true, coveredTargets: [], uncoveredTargets: [] },
      findings: [],
    })
  })

  test('Approval runs six writers plus Audit and Close stays blocked until clean Audit', async () => {
    render(<Harness />)

    expect(screen.queryByText('סנכרון סופי')).not.toBeInTheDocument()

    fireEvent.click(await screen.findByRole('button', { name: 'המשך לקליטת נתונים' }))

    const pasteInput = screen.getByRole('textbox')
    fireEvent.change(pasteInput, { target: { value: 'stats row' } })
    fireEvent.click(screen.getByRole('button', { name: 'המשך לזיהוי ואישור' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'אישור טעינת סטטיסטיקות' })).toBeEnabled()
      expect(mockPrepareStatsImportPlanV2).toHaveBeenCalled()
    })

    expect(mockPrepareStatsImportPlanV2.mock.calls[0][0].incomingPlayers[0])
      .toMatchObject({
        statsStatus: 'loaded',
        playerStats: {
          games: 1,
          goals: 0,
          minutes: 90,
        },
      })

    const preparedInput = mockPrepareStatsImportPlanV2.mock.calls[0][0]
    expect(preparedInput.approvedAt).not.toBe('preview')
    expect(Number.isNaN(Date.parse(preparedInput.approvedAt))).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: 'אישור טעינת סטטיסטיקות' }))

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'הפעל שלב' })).toHaveLength(7)
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
        const updatedButtons = screen.getAllByRole('button', { name: 'הפעל שלב' })

        expect(updatedButtons[index]).toBeDisabled()
        expect(updatedButtons[index + 1]).toBeEnabled()
      })
    }

    expect(screen.getByRole('button', { name: 'סגור' })).toBeDisabled()
    expect(mockRunStatsFinalSyncStageV2).toHaveBeenCalledTimes(6)

    const auditButton = screen.getAllByRole('button', { name: 'הפעל שלב' })[6]
    expect(auditButton).toBeEnabled()
    fireEvent.click(auditButton)

    await waitFor(() => {
      expect(mockAuditStatsV2).toHaveBeenCalledTimes(1)
      expect(mockCloseWriteActionReceiptV2).toHaveBeenCalledWith({ receiptId: 'receipt-1' })
      expect(screen.getByText('הסנכרון תקין · הקבלה נסגרה')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'סגור' })).toBeEnabled()
    })

    const preparedPlan = await mockPrepareStatsImportPlanV2.mock.results[0].value
    expect(preparedPlan.approvedAt).not.toBe('preview')
    expect(preparedPlan.playerSearchIndexStates[0].fields.statsSnapshots.current.capturedAt)
      .not.toBe('preview')
  })
})
