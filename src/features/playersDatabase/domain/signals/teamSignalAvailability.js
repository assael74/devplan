// src/features/playersDatabase/domain/signals/teamSignalAvailability.js

export const readSignalAvailability = value => (
  ['available', 'partial', 'unavailable'].includes(value) ? value : 'unavailable'
)

export const mergeSignalAvailability = (values = []) => {
  const states = values.map(readSignalAvailability)
  if (states.length && states.every(state => state === 'available')) return 'available'
  return states.some(state => state !== 'unavailable') ? 'partial' : 'unavailable'
}

export const readCompetitionAvailability = competition => (
  readSignalAvailability(competition?.availability?.availability)
)
