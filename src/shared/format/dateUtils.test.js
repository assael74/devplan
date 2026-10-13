// src/shared/format/dateUtils.test.js
import { createIsraelDateTimeFormatter, getFullDateTimeIl } from './dateUtils.js'

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
