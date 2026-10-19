// src/features/playersDatabase/ui/pages/teamPage/roster/import/logic/teamRosterImport.logic.test.js
import {
  parsePlayerRosterRows,
  resolveRosterImportMetadata,
} from './teamRosterImport.logic.js'

describe('Roster Excel import metadata', () => {
  test('ignores a shirt-number column in the pasted roster', () => {
    const [row] = parsePlayerRosterRows('שם השחקן\tמזהה התאחדות\tמספר חולצה\nשחקן א\t12345\t9')
    expect(row.fullName).toBe('שחקן א')
    expect(row).not.toHaveProperty('numShirt')
  })

  test('reads one source snapshot key and effective time from roster headers', () => {
    const rows = parsePlayerRosterRows([
      'שם השחקן\tמזהה התאחדות\tמזהה תמונת מצב\tתאריך תחולה',
      'שחקן א\t12345\tsource-revision-18\t2026-11-01',
      'שחקן ב\t23456\tsource-revision-18\t2026-11-01',
    ].join('\n'))

    expect(resolveRosterImportMetadata({ rows })).toEqual({
      sourceSnapshotKey: 'source-revision-18',
      effectiveAt: '2026-11-01',
    })
  })

  test('rejects inconsistent roster-wide snapshot metadata', () => {
    expect(() => resolveRosterImportMetadata({ rows: [
      { sourceSnapshotKey: 'one' },
      { sourceSnapshotKey: 'two' },
    ] })).toThrow('sourceSnapshotKey')
  })
})
