import { getExpectedClubDocumentIds } from './readActual.js'

describe('getExpectedClubDocumentIds', () => {
  test('selects only unique Club documents expected by the current League receipt', () => {
    const expected = {
      clubs: [
        { clubId: 'club-current-1' },
        { clubId: 'club-current-2' },
        { clubId: 'club-current-1' },
      ],
    }

    expect(getExpectedClubDocumentIds(expected)).toEqual([
      'club-current-1',
      'club-current-2',
    ])
    expect(getExpectedClubDocumentIds(expected)).not.toContain('club-other-league')
  })
})
