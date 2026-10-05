// src/features/playersDatabase/services/write/league/writeLeagueCanonical.test.js

import { doc, setDoc } from 'firebase/firestore'

import { writeLeagueCanonical } from './writeLeagueCanonical.js'

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => ({ id: 'league-ref' })),
  setDoc: jest.fn(() => Promise.resolve()),
}))

jest.mock('../../../../../services/firebase/firebase.js', () => ({
  db: { name: 'db' },
}))

describe('writeLeagueCanonical', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    doc.mockImplementation(() => ({ id: 'league-ref' }))
    setDoc.mockResolvedValue(undefined)
  })

  test('writes the approved canonical League document as a full replacement', async () => {
    const document = {
      leagueId: 'league-1',
      seasonsById: {
        '2025_2026': {
          seasonKey: '25/26',
        },
      },
    }

    const result = await writeLeagueCanonical({
      approvedState: {
        leagueId: 'league-1',
        document,
      },
    })

    expect(doc).toHaveBeenCalledWith(
      { name: 'db' },
      'dbLeagues',
      'league-1'
    )
    expect(setDoc).toHaveBeenCalledWith(
      { id: 'league-ref' },
      document
    )
    expect(result).toEqual({
      leagueId: 'league-1',
      written: true,
      skipped: false,
    })
  })

  test('does not write when canonicalWriteRequired is false', async () => {
    const result = await writeLeagueCanonical({
      approvedState: {
        leagueId: 'league-1',
        canonicalWriteRequired: false,
        document: null,
      },
    })

    expect(doc).not.toHaveBeenCalled()
    expect(setDoc).not.toHaveBeenCalled()
    expect(result).toEqual({
      leagueId: 'league-1',
      written: false,
      skipped: true,
    })
  })

  test('rejects a canonical document for another League', async () => {
    await expect(writeLeagueCanonical({
      approvedState: {
        leagueId: 'league-1',
        document: {
          leagueId: 'league-2',
          seasonsById: {},
        },
      },
    })).rejects.toThrow('Canonical League document identity does not match target league')

    expect(setDoc).not.toHaveBeenCalled()
  })
})
