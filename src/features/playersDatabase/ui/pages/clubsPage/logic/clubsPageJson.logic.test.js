// src/features/playersDatabase/ui/pages/clubsPage/logic/clubsPageJson.logic.test.js

import { buildClubsPageJsonOptions } from './clubsPageJson.logic.js'

describe('Clubs page JSON options', () => {
  test('builds the directory and seasonal center choices from loaded page documents', () => {
    const options = buildClubsPageJsonOptions({
      directory: {
        id: 'all',
        documentExists: true,
        clubsById: { clubA: {} },
      },
      centers: [
        {
          season: { seasonId: '2026_2027', label: '26/27' },
          document: {
            id: '2026_2027',
            documentExists: true,
            clubsById: { clubA: {} },
          },
        },
        {
          season: { seasonId: '2025_2026', label: '25/26' },
          document: { id: '2025_2026', documentExists: false },
        },
      ],
    })

    expect(options.map(option => ({
      id: option.id,
      available: option.available,
      fileName: option.fileName,
    }))).toEqual([
      {
        id: 'clubsDirectory',
        available: true,
        fileName: 'dbClubsDirectory-all.json',
      },
      {
        id: 'clubsCenter:2026_2027',
        available: true,
        fileName: 'dbClubsCenter-2026_2027.json',
      },
      {
        id: 'clubsCenter:2025_2026',
        available: false,
        fileName: 'dbClubsCenter-2025_2026.json',
      },
    ])
    expect(options[0].document).not.toHaveProperty('id')
    expect(options[0].document).not.toHaveProperty('documentExists')
  })
})

