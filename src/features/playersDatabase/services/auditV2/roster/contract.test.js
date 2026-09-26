import {
  ROSTER_AUDIT_V2_COVERED_TARGETS,
  ROSTER_AUDIT_V2_TARGET,
  ROSTER_AUDIT_V2_UNCOVERED_TARGETS,
} from './contract.js'

describe('Roster Audit V2 coverage contract', () => {
  test('covers the complete Roster Audit target set', () => {
    expect(ROSTER_AUDIT_V2_COVERED_TARGETS).toContain(
      ROSTER_AUDIT_V2_TARGET.LEAGUES_MASTER
    )
    expect(ROSTER_AUDIT_V2_UNCOVERED_TARGETS).not.toContain(
      ROSTER_AUDIT_V2_TARGET.LEAGUES_MASTER
    )
    expect(ROSTER_AUDIT_V2_COVERED_TARGETS).toEqual(expect.arrayContaining([
      ROSTER_AUDIT_V2_TARGET.CLUBS,
      ROSTER_AUDIT_V2_TARGET.CLUBS_MASTER,
    ]))
    expect(ROSTER_AUDIT_V2_UNCOVERED_TARGETS).toEqual([])
  })
})
