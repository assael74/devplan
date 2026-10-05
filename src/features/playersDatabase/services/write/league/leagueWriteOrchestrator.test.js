// src/features/playersDatabase/services/write/league/leagueWriteOrchestrator.test.js

import {
  buildLeagueTeamsClearWritePlan,
  buildLeagueLoadWritePlan,
  buildLeagueOpenWritePlan,
} from '../../../domain/league/index.js'
import { auditLeague } from '../../audit/league/index.js'
import {
  completeWriteActionAudit,
  completeWriteActionStage,
  failWriteActionStage,
  openWriteActionReceipt,
} from '../receipt/index.js'
import {
  clearLeagueTeams,
  loadLeague,
  openLeagueSeason,
} from './leagueWriteOrchestrator.js'
import {
  readLeagueLoadSources,
  readLeagueMutationSources,
} from './readLeagueWriteSources.js'
import { writeClubsCenter } from './writeClubsCenter.js'
import { writeLeagueCanonical } from './writeLeagueCanonical.js'
import { writeLeaguesCenter } from './writeLeaguesCenter.js'
import { writeTeamSeasonCompetitionSnapshots } from './writeTeamSeasonCompetitionSnapshots.js'

jest.mock('../../../domain/league/index.js', () => ({
  buildLeagueLoadWritePlan: jest.fn(),
  buildLeagueOpenWritePlan: jest.fn(),
  buildLeagueSeasonDeleteWritePlan: jest.fn(),
  buildLeagueTeamsClearWritePlan: jest.fn(),
}))
jest.mock('../../audit/league/index.js', () => ({ auditLeague: jest.fn() }))
jest.mock('../receipt/index.js', () => ({
  completeWriteActionAudit: jest.fn(),
  completeWriteActionStage: jest.fn(),
  failWriteActionStage: jest.fn(),
  openWriteActionReceipt: jest.fn(),
}))
jest.mock('./readLeagueWriteSources.js', () => ({
  readLeagueLoadSources: jest.fn(),
  readLeagueMutationSources: jest.fn(),
}))
jest.mock('./writeClubsCenter.js', () => ({ writeClubsCenter: jest.fn() }))
jest.mock('./writeLeagueCanonical.js', () => ({ writeLeagueCanonical: jest.fn() }))
jest.mock('./writeLeaguesCenter.js', () => ({ writeLeaguesCenter: jest.fn() }))
jest.mock('./writeTeamSeasonCompetitionSnapshots.js', () => ({
  writeTeamSeasonCompetitionSnapshots: jest.fn(),
}))

test('League Load builds Approved State before receipt and writes all canonical stages', async () => {
  const onProgress = jest.fn()
  const approvedState = {
    leagueId: 'league-a',
    seasonId: '2026_2027',
    document: {
      leagueId: 'league-a',
      names: { display: 'League A' },
      seasonsById: {
        '2026_2027': { seasonKey: '26/27', birthYear: 2011 },
      },
    },
  }
  readLeagueLoadSources.mockResolvedValue({ existingLeague: null })
  buildLeagueLoadWritePlan.mockReturnValue(approvedState)
  openWriteActionReceipt.mockResolvedValue('receipt-a')
  writeLeagueCanonical.mockResolvedValue({ completed: true })
  writeTeamSeasonCompetitionSnapshots.mockResolvedValue({ completed: true })
  writeLeaguesCenter.mockResolvedValue({ completed: true })
  writeClubsCenter.mockResolvedValue({ completed: true })
  completeWriteActionStage.mockResolvedValue(undefined)
  auditLeague.mockResolvedValue({
    status: 'CLEAN',
    findings: [],
    coverage: { complete: true },
  })
  completeWriteActionAudit.mockResolvedValue({
    status: 'closed',
    executionStatus: 'succeeded',
    recoveryRequired: false,
  })

  const result = await loadLeague({
    input: {
      league: { leagueId: 'league-a' },
      season: { seasonId: '2026_2027' },
      rows: [],
    },
    onProgress,
  })

  expect(buildLeagueLoadWritePlan.mock.invocationCallOrder[0]).toBeLessThan(
    openWriteActionReceipt.mock.invocationCallOrder[0],
  )
  expect(openWriteActionReceipt.mock.invocationCallOrder[0]).toBeLessThan(
    writeLeagueCanonical.mock.invocationCallOrder[0],
  )
  expect(openWriteActionReceipt).toHaveBeenCalledWith(expect.objectContaining({
    actionType: 'leagueLoad',
    target: { leagueId: 'league-a', seasonId: '2026_2027' },
  }))
  expect(writeLeagueCanonical).toHaveBeenCalledWith({ approvedState })
  expect(writeTeamSeasonCompetitionSnapshots).toHaveBeenCalledWith({ approvedState })
  expect(writeLeaguesCenter).toHaveBeenCalledWith({ approvedState })
  expect(writeClubsCenter).toHaveBeenCalledWith({ approvedState })
  expect(result).toEqual(expect.objectContaining({
    receiptId: 'receipt-a',
    status: 'closed',
    executionStatus: 'succeeded',
  }))
  expect(onProgress.mock.calls.map(([event]) => [event.type, event.stageId || ''])).toEqual([
    ['receiptOpened', ''],
    ['stageCompleted', 'canonical'],
    ['stageCompleted', 'teamSeasonCompetitionSnapshots'],
    ['stageCompleted', 'leaguesCenter'],
    ['stageCompleted', 'clubsCenter'],
    ['stageCompleted', 'audit'],
  ])
})

test('League Load reports completed stages before a later projection failure', async () => {
  jest.clearAllMocks()
  const onProgress = jest.fn()
  const approvedState = {
    leagueId: 'league-a',
    seasonId: '2026_2027',
    document: { leagueId: 'league-a', seasonsById: {} },
  }
  readLeagueLoadSources.mockResolvedValue({ existingLeague: null })
  buildLeagueLoadWritePlan.mockReturnValue(approvedState)
  openWriteActionReceipt.mockResolvedValue('receipt-failed')
  writeLeagueCanonical.mockResolvedValue({ completed: true })
  writeTeamSeasonCompetitionSnapshots.mockResolvedValue({ completed: true })
  writeLeaguesCenter.mockRejectedValue(new Error('center failed'))
  completeWriteActionStage.mockResolvedValue(undefined)
  failWriteActionStage.mockResolvedValue(undefined)

  await expect(loadLeague({
    input: {
      league: { leagueId: 'league-a' },
      season: { seasonId: '2026_2027' },
      rows: [],
    },
    onProgress,
  })).rejects.toMatchObject({ receiptId: 'receipt-failed' })

  expect(onProgress.mock.calls.map(([event]) => [event.type, event.stageId || ''])).toEqual([
    ['receiptOpened', ''],
    ['stageCompleted', 'canonical'],
    ['stageCompleted', 'teamSeasonCompetitionSnapshots'],
    ['stageFailed', 'leaguesCenter'],
  ])
})

test('League Open builds an empty Approved State and records a dedicated receipt', async () => {
  jest.clearAllMocks()
  const approvedState = {
    leagueId: 'league-a',
    seasonId: '2026_2027',
    document: {
      leagueId: 'league-a',
      seasonsById: {
        '2026_2027': {
          table: { tableState: 'NOT_LOADED', teamsById: {} },
        },
      },
    },
    teamSeasonCompetitionSnapshots: [],
  }
  readLeagueLoadSources.mockResolvedValue({ existingLeague: null })
  buildLeagueOpenWritePlan.mockReturnValue(approvedState)
  openWriteActionReceipt.mockResolvedValue('receipt-open')
  writeLeagueCanonical.mockResolvedValue({ completed: true })
  writeTeamSeasonCompetitionSnapshots.mockResolvedValue({ updatedTeamSeasons: 0 })
  writeLeaguesCenter.mockResolvedValue({ completed: true })
  writeClubsCenter.mockResolvedValue({ completed: true })
  completeWriteActionStage.mockResolvedValue(undefined)
  auditLeague.mockResolvedValue({
    status: 'CLEAN',
    findings: [],
    coverage: { complete: true },
  })
  completeWriteActionAudit.mockResolvedValue({
    status: 'closed',
    executionStatus: 'succeeded',
    recoveryRequired: false,
  })

  const result = await openLeagueSeason({
    input: {
      league: { leagueId: 'league-a' },
      season: { seasonId: '2026_2027' },
    },
  })

  expect(buildLeagueOpenWritePlan.mock.invocationCallOrder[0]).toBeLessThan(
    openWriteActionReceipt.mock.invocationCallOrder[0]
  )
  expect(openWriteActionReceipt).toHaveBeenCalledWith(expect.objectContaining({
    actionType: 'leagueOpen',
    target: { leagueId: 'league-a', seasonId: '2026_2027' },
  }))
  expect(writeTeamSeasonCompetitionSnapshots).toHaveBeenCalledWith({ approvedState })
  expect(result).toEqual(expect.objectContaining({
    receiptId: 'receipt-open',
    status: 'closed',
    executionStatus: 'succeeded',
  }))
})

test('League Teams Clear builds Approved State before receipt and reports every stage', async () => {
  jest.clearAllMocks()
  const onProgress = jest.fn()
  const approvedState = {
    leagueId: 'league-a',
    seasonId: '2026_2027',
    document: {
      leagueId: 'league-a',
      seasonsById: {
        '2026_2027': {
          table: { tableState: 'NOT_LOADED', teamsById: {} },
        },
      },
    },
  }
  readLeagueMutationSources.mockResolvedValue({ existingLeague: { leagueId: 'league-a' } })
  buildLeagueTeamsClearWritePlan.mockReturnValue(approvedState)
  openWriteActionReceipt.mockResolvedValue('receipt-clear')
  writeLeagueCanonical.mockResolvedValue({ completed: true })
  writeTeamSeasonCompetitionSnapshots.mockResolvedValue({ updatedTeamSeasons: 1 })
  writeLeaguesCenter.mockResolvedValue({ completed: true })
  writeClubsCenter.mockResolvedValue({ completed: true })
  completeWriteActionStage.mockResolvedValue(undefined)
  auditLeague.mockResolvedValue({
    status: 'CLEAN',
    findings: [],
    coverage: { complete: true },
  })
  completeWriteActionAudit.mockResolvedValue({
    status: 'closed',
    executionStatus: 'succeeded',
    recoveryRequired: false,
  })

  const result = await clearLeagueTeams({
    input: { leagueId: 'league-a', seasonId: '2026_2027' },
    onProgress,
  })

  expect(buildLeagueTeamsClearWritePlan.mock.invocationCallOrder[0]).toBeLessThan(
    openWriteActionReceipt.mock.invocationCallOrder[0]
  )
  expect(openWriteActionReceipt).toHaveBeenCalledWith(expect.objectContaining({
    actionType: 'leagueTeamsClear',
    target: { leagueId: 'league-a', seasonId: '2026_2027' },
  }))
  expect(result).toEqual(expect.objectContaining({
    receiptId: 'receipt-clear',
    status: 'closed',
    executionStatus: 'succeeded',
  }))
  expect(onProgress.mock.calls.map(([event]) => [event.type, event.stageId || ''])).toEqual([
    ['receiptOpened', ''],
    ['stageCompleted', 'canonical'],
    ['stageCompleted', 'teamSeasonCompetitionSnapshots'],
    ['stageCompleted', 'leaguesCenter'],
    ['stageCompleted', 'clubsCenter'],
    ['stageCompleted', 'audit'],
  ])
})
