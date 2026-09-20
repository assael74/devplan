// src/features/playersDatabase/ui/components/playerMeta/playerUrl.presentation.test.js

import { resolvePlayerUrl } from './playerUrl.presentation.js'

describe('resolvePlayerUrl', () => {
  test('keeps absolute URLs and resolves football paths exactly as before', () => {
    expect(resolvePlayerUrl('https://example.com/player/1')).toBe('https://example.com/player/1')
    expect(resolvePlayerUrl('/players/player/?player_id=1')).toBe('https://www.football.org.il/players/player/?player_id=1')
    expect(resolvePlayerUrl('players/player/?player_id=1')).toBe('https://www.football.org.il/players/player/?player_id=1')
    expect(resolvePlayerUrl('')).toBe('')
  })
})
