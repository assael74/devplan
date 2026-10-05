// src/features/playersDatabase/domain/league/competitionRules.validator.test.js

import { validateLeagueCompetitionRules } from './competitionRules.validator.js'

const validRules = {
  promotion: {
    directPlaces: [1],
    playoffPlaces: [2],
  },
  relegation: {
    directPlaces: [14],
    playoffPlaces: [13],
  },
}

describe('validateLeagueCompetitionRules', () => {
  it('returns normalized competition rules', () => {
    expect(validateLeagueCompetitionRules(validRules)).toEqual({
      configured: true,
      promotion: {
        enabled: true,
        directPlaces: [1],
        playoffPlaces: [2],
      },
      relegation: {
        enabled: true,
        directPlaces: [14],
        playoffPlaces: [13],
      },
    })
  })

  it('rejects an invalid place before normalization', () => {
    expect(() => validateLeagueCompetitionRules({
      ...validRules,
      promotion: {
        ...validRules.promotion,
        directPlaces: [0],
      },
    })).toThrow('מיקומי תחרות אינם תקינים')
  })

  it('rejects a missing places array', () => {
    expect(() => validateLeagueCompetitionRules({
      ...validRules,
      relegation: {
        directPlaces: [14],
      },
    })).toThrow('מיקומי תחרות: מבנה הנתונים אינו תקין')
  })
})
