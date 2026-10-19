// src/shared/format/dateUtils.test.js
import {
  createIsraelDateTimeFormatter,
  formatLoadTime,
  getFullDateTimeIl,
  getLoadTimeParts,
} from './dateUtils.js'

test.each([
  ['2026-01-15T10:00:00Z', '15.01.2026 · 12:00'],
  ['2026-07-15T10:00:00Z', '15.07.2026 · 13:00'],
  ['2026-07-15T22:00:00Z', '16.07.2026 · 01:00'],
])('formats %s in Israel independently of the device time zone', (value, expected) => {
  expect(getFullDateTimeIl(value)).toBe(expected)
})

test('shared time formatter preserves seconds and uses Israel time', () => {
  const formatter = createIsraelDateTimeFormatter({ timeStyle: 'medium' })
  expect(formatter.resolvedOptions().timeZone).toBe('Asia/Jerusalem')
  expect(formatter.format(new Date('2026-07-15T10:00:05Z'))).toBe('13:00:05')
})

test('load metadata uses an Israel date without a clock and the existing Hebrew relative age', () => {
  const value = '2026-07-15T22:30:00Z'
  const now = Date.parse('2026-07-16T22:30:00Z')
  expect(getLoadTimeParts(value, now)).toEqual({ dateLabel: '16.07.2026', ageLabel: 'אתמול' })
  expect(formatLoadTime(value, now)).toBe('16.07.2026 · אתמול')
})

test.each([null, undefined, 'invalid'])('does not invent a load timestamp for %p', value => {
  expect(getLoadTimeParts(value)).toEqual({ dateLabel: '', ageLabel: '' })
  expect(formatLoadTime(value)).toBe('')
})

test('load timestamps support Firestore timestamp inputs', () => {
  const date = new Date('2026-10-19T08:00:00Z')
  const now = date.getTime() + 10 * 60000
  const expected = { dateLabel: '19.10.2026', ageLabel: 'לפני 10 דקות' }
  expect(getLoadTimeParts({ seconds: date.getTime() / 1000 }, now)).toEqual(expected)
  expect(getLoadTimeParts({ toDate: () => date }, now)).toEqual(expected)
})
