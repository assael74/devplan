// src/features/playersDatabase/services/auditV2/system/scouting/index.test.js

jest.mock('../../stats/readCanonical.js', () => ({
  readStatsCanonicalV2: jest.fn(),
}))

jest.mock('./evaluate.js', () => ({
  evaluateScoutingIntegrityV2: jest.fn(),
}))

import { readStatsCanonicalV2 } from '../../stats/readCanonical.js'
import { evaluateScoutingIntegrityV2 } from './evaluate.js'
import { auditScoutingIntegrityV2 } from './index.js'

describe('auditScoutingIntegrityV2', () => {
  test('reuses the narrow Stats canonical reader and evaluates only that target', async () => {
    const canonical = {
      birthTeamDocumentId: 'team-1',
      seasonKey: '26_27',
    }
    const expected = {
      auditType: 'scouting_integrity',
      result: 'clean',
      findings: [],
    }

    readStatsCanonicalV2.mockResolvedValue(canonical)
    evaluateScoutingIntegrityV2.mockReturnValue(expected)

    await expect(auditScoutingIntegrityV2({
      birthTeamDocumentId: 'team-1',
      seasonKey: '26_27',
    })).resolves.toEqual(expected)

    expect(readStatsCanonicalV2).toHaveBeenCalledWith({
      birthTeamDocumentId: 'team-1',
      seasonKey: '26_27',
    })
    expect(evaluateScoutingIntegrityV2).toHaveBeenCalledWith({ canonical })
  })
})
