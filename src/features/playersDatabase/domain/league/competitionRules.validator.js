// src/features/playersDatabase/domain/league/competitionRules.validator.js

import { normalizeCompetitionRules } from '../projections/club/clubCompetition.projection.js'

const requireValidPlaces = values => {
  if (!Array.isArray(values)) {
    throw new Error('מיקומי תחרות: מבנה הנתונים אינו תקין')
  }

  if (!values.every(value => Number.isInteger(value) && value > 0)) {
    throw new Error('מיקומי תחרות אינם תקינים')
  }
}

export const validateLeagueCompetitionRules = rules => {
  if (!rules || typeof rules !== 'object' || Array.isArray(rules)) {
    throw new Error('חוקי תחרות חסרים')
  }

  for (const zone of ['promotion', 'relegation']) {
    for (const kind of ['directPlaces', 'playoffPlaces']) {
      requireValidPlaces(rules[zone] && rules[zone][kind])
    }
  }

  return normalizeCompetitionRules(rules)
}
