// src/ui/patterns/mentions/mentionContent.model.test.js

import { mentionContentText, mentionIds, normalizeMentionContent } from './mentionContent.model.js'

test('derives unique IDs from the mentions still present in the text', () => {
  const content = [
    { type: 'text', text: 'בדיקה של ' },
    { type: 'mention', id: 'player-1', label: 'שחקן א', href: '/players/player-1' },
    { type: 'text', text: ' וגם ' },
    { type: 'mention', id: 'player-1', label: 'שחקן א', href: '/players/player-1' },
  ]

  expect(mentionIds(content)).toEqual(['player-1'])
  expect(mentionContentText(content)).toBe('בדיקה של שחקן א וגם שחקן א')
  expect(mentionIds(content.slice(0, 1))).toEqual([])
})

test('keeps plain text and rejects unsafe mention links', () => {
  expect(normalizeMentionContent('הערה ישנה')).toEqual([{ type: 'text', text: 'הערה ישנה' }])
  expect(normalizeMentionContent([
    { type: 'mention', id: 'player-1', label: 'שחקן א', href: 'javascript:alert(1)' },
  ])[0].href).toBe('')
})
