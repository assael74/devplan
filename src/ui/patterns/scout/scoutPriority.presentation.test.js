// src/ui/patterns/scout/scoutPriority.presentation.test.js

import { resolveScoutPriority } from './scoutPriority.presentation.js'

test.each(['unavailable', undefined, null, '', 'unknown'])('priority %p displays as unavailable', value => {
  expect(resolveScoutPriority(value)).toEqual(expect.objectContaining({
    label: 'לא זמין',
    shortLabel: 'לא זמין',
    iconId: 'noData',
  }))
})

test('a neutral result still displays as regular', () => {
  expect(resolveScoutPriority('neutral').label).toBe('רגיל')
})
