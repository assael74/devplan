import {
  parsePlayerRosterRows,
  resolveRosterImportMetadata,
} from './teamRosterImport.logic.js'

describe('Roster Excel import metadata', () => {
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
