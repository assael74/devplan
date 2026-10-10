// src/features/playersDatabase/ui/pages/DataOpsPage/logic/systemAuditFindings.presentation.test.js

import {
  areFindingValuesEquivalent,
  getFindingDisplayImpact,
} from './systemAuditFindings.presentation.js'

describe('system audit finding presentation', () => {
  test('treats objects with different key order as the same value', () => {
    const finding = {
      expected: { teamId: 'team-1', stats: { wins: 4, losses: 1 } },
      actual: { stats: { losses: 1, wins: 4 }, teamId: 'team-1' },
    }

    expect(areFindingValuesEquivalent(finding)).toBe(true)
    expect(getFindingDisplayImpact(finding)).toEqual(expect.objectContaining({
      tone: 'neutral',
      label: 'ללא השפעה',
    }))
  })

  test('describes a real player season reference impact', () => {
    const impact = getFindingDisplayImpact({
      target: 'playerSeasons',
      expected: 'team-season-1',
      actual: 'team-season-2',
    })

    expect(impact.tone).toBe('warning')
    expect(impact.text).toContain('פרופיל השחקן')
  })

  test('describes a real clubs center season identity impact', () => {
    const impact = getFindingDisplayImpact({
      target: 'clubsCenter',
      title: 'זהות העונה במרכז המועדונים אינה מסונכרנת',
      expected: { status: 'active' },
      actual: { status: 'pending' },
    })

    expect(impact.label).toBe('מרכז המועדונים')
    expect(impact.text).toContain('סטטוס העונה')
  })
})
