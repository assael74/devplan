// src/features/playersDatabase/ui/pages/DataOpsPage/logic/systemAuditSnapshot.logic.test.js

import {
  buildSystemAuditSnapshot,
  readSystemAuditSnapshot,
  restoreSystemAuditResult,
  writeSystemAuditSnapshot,
} from './systemAuditSnapshot.logic.js'

describe('DataOps system audit snapshot', () => {
  test('stores the summary and findings so the result survives navigation', () => {
    const values = {}
    const storage = {
      getItem: key => values[key] || null,
      setItem: (key, value) => { values[key] = value },
    }
    const result = {
      result: 'FINDINGS',
      findings: [{ id: 'one' }, { id: 'two' }],
      coverage: { complete: true, coveredTargets: ['leagues'] },
      summary: { findingsCount: 2, checkedLeagues: 4 },
    }

    const snapshot = writeSystemAuditSnapshot({
      storage,
      result,
      completedAt: new Date('2026-10-09T08:00:00.000Z'),
    })

    expect(snapshot).toEqual(expect.objectContaining({
      result: 'FINDINGS',
      findingsCount: 2,
      findings: [{ id: 'one' }, { id: 'two' }],
      completedAt: '2026-10-09T08:00:00.000Z',
    }))
    expect(readSystemAuditSnapshot(storage)).toEqual(snapshot)
    expect(restoreSystemAuditResult(snapshot)).toEqual({
      result: 'FINDINGS',
      selectedChecks: [],
      findings: [{ id: 'one' }, { id: 'two' }],
      coverage: { complete: true, coveredTargets: ['leagues'] },
      summary: { findingsCount: 2, checkedLeagues: 4 },
    })
  })

  test('ignores invalid stored JSON', () => {
    expect(readSystemAuditSnapshot({ getItem: () => '{bad' })).toBeNull()
  })

  test('builds a count from findings when summary count is absent', () => {
    expect(buildSystemAuditSnapshot({ result: { findings: [{}, {}] } }).findingsCount).toBe(2)
  })

  test('does not restore details from an old summary-only snapshot', () => {
    expect(restoreSystemAuditResult({ findingsCount: 2 })).toBeNull()
  })
})
