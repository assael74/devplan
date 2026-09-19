// src/features/playersDatabase/services/dataRepair/searchIndex/searchIndexBulkRepair.test.js

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  writeBatch: jest.fn(),
}))

jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))

jest.mock('../../audit/audit.read.js', () => ({
  readPlayerDatabaseAuditSnapshot: jest.fn(),
}))

jest.mock('../../write/searchIndex/team/index.js', () => ({
  resetTeamSeasonSearchIndexToLeagueOnly: jest.fn(),
}))

jest.mock('../player/index.js', () => ({
  PLAYER_DATA_ISSUE_CODE: {},
  canRepairPlayerDataIssue: jest.fn(),
  repairPlayerDataIssue: jest.fn(),
}))

jest.mock('../team/index.js', () => ({
  repairTeamSearchIndexLifecycleMany: jest.fn(),
}))

import { AUDIT_REPAIR_TYPE } from '../../audit/audit.contract.js'
import {
  isPlayerSearchIndexScoutProfileFinding,
  isTeamSearchIndexLifecycleFinding,
} from './searchIndexBulkRepair.js'

const playerFinding = (overrides = {}) => ({
  entityType: 'playerSearchIndex',
  documentId: 'player-index-1',
  relatedDocumentId: 'team-season-1',
  source: 'Team Season player scout profile → Player SearchIndex',
  ...overrides,
})

const teamFinding = (overrides = {}) => ({
  entityType: 'teamSearchIndex',
  documentId: 'team-index-1',
  teamDocumentId: 'team-1',
  seasonKey: '26/27',
  source: 'League season → buildTeamSeasonSearchMetrics',
  ...overrides,
})

describe('SearchIndex Audit repair finding contracts', () => {
  test('keeps the legacy player-index finding group eligible through normalization', () => {
    expect(isPlayerSearchIndexScoutProfileFinding(playerFinding())).toBeTruthy()
  })

  test('uses canonical player repairType instead of source text', () => {
    expect(isPlayerSearchIndexScoutProfileFinding(playerFinding({
      repairType: AUDIT_REPAIR_TYPE.REBUILD_PLAYER_SEARCH_INDEX,
      source: 'updated diagnostic wording',
    }))).toBeTruthy()
  })

  test('keeps the legacy team-index finding group eligible through normalization', () => {
    expect(isTeamSearchIndexLifecycleFinding(teamFinding())).toBeTruthy()
  })

  test('uses canonical team repairType instead of source text', () => {
    expect(isTeamSearchIndexLifecycleFinding(teamFinding({
      repairType: AUDIT_REPAIR_TYPE.REBUILD_TEAM_SEARCH_INDEX,
      source: 'updated diagnostic wording',
    }))).toBeTruthy()
  })

  test('rejects unknown repair types without falling back to a different executor', () => {
    expect(isPlayerSearchIndexScoutProfileFinding(playerFinding({
      repairType: 'retired_repair_type',
    }))).toBe(false)
    expect(isTeamSearchIndexLifecycleFinding(teamFinding({
      repairType: 'retired_repair_type',
    }))).toBe(false)
  })
})
