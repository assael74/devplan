// src/features/playersDatabase/services/writeV2/stats/flows/writeClearStatsCanonical.flow.test.js

import { updateDoc } from 'firebase/firestore'
import { trackedGetDocFromServer } from '../../../../../../services/firestore/usage/index.js'

import { buildClearStatsApprovedStateV2 } from '../../../../domain/statsV2/clearStatsApprovedState.builder.js'
import {
  buildStatsAbsentTeamBalance,
  buildStatsAbsentTeamSeasonState,
} from '../../../../domain/statsV2/statsAbsence.builder.js'
import { prepareClearStatsPlanV2 } from '../prepare/prepareClearStatsPlanV2.js'
import { applyApprovedClearStatsTeamSeason } from '../support/applyApprovedClearStatsTeamSeason.js'
import { writeClearStatsCanonicalV2 } from './writeClearStatsCanonical.flow.js'

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((db, collectionName, id) => ({ collectionName, id })),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
}))

jest.mock('../../../../../../services/firebase/firebase.js', () => ({
  db: {},
}))

jest.mock('../../../../../../services/firestore/usage/index.js', () => ({
  trackedGetDocFromServer: jest.fn(),
}))

const snapshot = ({ exists = true, data = {} } = {}) => ({
  exists: () => exists,
  data: () => data,
})

const presentTeamSeason = () => ({
  birthTeamDocumentId: 'team-1',
  seasonKey: '2026',
  leagueId: 'league-1',
  teamPlayers: [{
    playerId: 'p-1',
    rosterStatus: 'active',
    statsStatus: 'loaded',
    playerStats: { games: 4, goals: 1 },
    scoutSignals: [{ id: 'signal-1' }],
  }],
  transfersIn: [{ movementId: 'in-1' }],
  performance: { tableRank: 3 },
  scoutProfilesSummary: { total: 1, profileCounts: { profile: 1 } },
  statsLoadState: { status: 'loaded' },
})

const approvedState = ({ absent = false } = {}) => {
  const teamSeason = absent
    ? buildStatsAbsentTeamSeasonState(presentTeamSeason())
    : presentTeamSeason()
  const proposedPlan = prepareClearStatsPlanV2({
    teamRoot: { id: 'team-1' },
    teamSeason,
    league: { id: 'league-1' },
    birthTeamDocumentId: 'team-1',
    seasonKey: '2026',
    leagueId: 'league-1',
  })

  return buildClearStatsApprovedStateV2({
    proposedPlan,
    approvedAt: '2026-09-27T12:00:00.000Z',
  })
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('writeClearStatsCanonicalV2', () => {
  test('returns an idempotent success without Firestore access', async () => {
    const result = await writeClearStatsCanonicalV2({
      approvedState: approvedState({ absent: true }),
    })

    expect(result.writeSkipped).toBe(true)
    expect(trackedGetDocFromServer).not.toHaveBeenCalled()
    expect(updateDoc).not.toHaveBeenCalled()
  })

  test('requires an existing Team Root', async () => {
    trackedGetDocFromServer.mockResolvedValueOnce(snapshot({ exists: false }))

    await expect(writeClearStatsCanonicalV2({ approvedState: approvedState() }))
      .rejects.toMatchObject({ code: 'CLEAR_STATS_TEAM_ROOT_NOT_FOUND' })
    expect(updateDoc).not.toHaveBeenCalled()
  })

  test('requires an existing Team Season and never creates it', async () => {
    trackedGetDocFromServer
      .mockResolvedValueOnce(snapshot())
      .mockResolvedValueOnce(snapshot({ exists: false }))

    await expect(writeClearStatsCanonicalV2({ approvedState: approvedState() }))
      .rejects.toMatchObject({ code: 'CLEAR_STATS_TEAM_SEASON_NOT_FOUND' })
    expect(updateDoc).not.toHaveBeenCalled()
  })

  test('replaces only the approved top-level owned fields', async () => {
    const current = presentTeamSeason()
    trackedGetDocFromServer
      .mockResolvedValueOnce(snapshot())
      .mockResolvedValueOnce(snapshot({ data: current }))

    const result = await writeClearStatsCanonicalV2({ approvedState: approvedState() })

    expect(result.writeSkipped).toBe(false)
    expect(updateDoc).toHaveBeenCalledTimes(1)
    const [, payload] = updateDoc.mock.calls[0]
    expect(Object.keys(payload).sort()).toEqual([
      'scoutProfilesSummary',
      'statsLoadState',
      'teamBalance',
      'teamPlayers',
      'updatedAt',
    ])
    expect(payload.transfersIn).toBeUndefined()
    expect(payload.performance).toBeUndefined()
    expect(payload.teamBalance).toEqual(buildStatsAbsentTeamBalance())
  })

  test('skips the write when the current owned state already matches', async () => {
    const approved = approvedState()
    const current = applyApprovedClearStatsTeamSeason({
      currentSeason: presentTeamSeason(),
      canonicalMutation: approved.canonicalMutation,
    })
    trackedGetDocFromServer
      .mockResolvedValueOnce(snapshot())
      .mockResolvedValueOnce(snapshot({ data: current }))

    const result = await writeClearStatsCanonicalV2({ approvedState: approved })

    expect(result.writeSkipped).toBe(true)
    expect(updateDoc).not.toHaveBeenCalled()
  })

  test('rejects an invalid idempotency contract', async () => {
    const approved = approvedState()
    approved.isIdempotent = true

    await expect(writeClearStatsCanonicalV2({ approvedState: approved }))
      .rejects.toMatchObject({ code: 'CLEAR_STATS_APPROVED_MUTATION_INVALID' })
    expect(trackedGetDocFromServer).not.toHaveBeenCalled()
    expect(updateDoc).not.toHaveBeenCalled()
  })
})
