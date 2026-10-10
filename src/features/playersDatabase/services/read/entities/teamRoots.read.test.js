// src/features/playersDatabase/services/read/entities/teamRoots.read.test.js

import { buildMovementTeamOptions } from './teamRoots.read.js'

describe('buildMovementTeamOptions', () => {
  test('uses dbClubsDirectory as the club list and builds deterministic slots 1 to 3', () => {
    const options = buildMovementTeamOptions({
      clubsDirectory: {
        clubsById: {
          'hapoel-kpr-shlm': {
            names: {
              official: 'הפועל כפר שלם',
              display: 'הפועל כפר שלם',
              short: 'כפר שלם',
            },
            clubLevel: 3,
          },
        },
      },
      existingOptions: [],
      birthYear: 2012,
    })

    expect(options).toEqual([expect.objectContaining({
      clubId: 'hapoel-kpr-shlm',
      label: 'כפר שלם',
      clubLevel: 3,
      availableTeams: [
        expect.objectContaining({
          birthTeamDocumentId: 'hapoel-kpr-shlm_2012_1',
          birthTeamSlot: 1,
        }),
        expect.objectContaining({
          birthTeamDocumentId: 'hapoel-kpr-shlm_2012_2',
          birthTeamSlot: 2,
        }),
        expect.objectContaining({
          birthTeamDocumentId: 'hapoel-kpr-shlm_2012_3',
          birthTeamSlot: 3,
        }),
      ],
    })])
  })

  test('preserves existing team choices while taking the club label from the directory', () => {
    const existingTeam = {
      clubId: 'club-a',
      birthTeamDocumentId: 'club-a_2012_2',
      birthTeamSlot: 2,
    }
    const options = buildMovementTeamOptions({
      clubsDirectory: {
        clubsById: {
          'club-a': {
            names: { short: 'מועדון א' },
          },
        },
      },
      existingOptions: [{
        clubId: 'club-a',
        label: 'שם ישן',
        availableTeams: [existingTeam],
      }],
      birthYear: 2012,
    })

    expect(options[0].label).toBe('מועדון א')
    expect(options[0].availableTeams).toHaveLength(3)
    expect(options[0].availableTeams[1]).toBe(existingTeam)
  })
})
