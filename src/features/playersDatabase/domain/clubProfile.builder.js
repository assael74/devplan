// src/features/playersDatabase/domain/clubProfile.builder.js

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const list = value => [...new Set(String(value || '').split(',').map(clean).filter(Boolean))]

const level = (value, label) => {
  if (value === '' || value === null || value === undefined) return null
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0) throw new Error(`${label} חייבת להיות מספר שאינו שלילי`)
  return number
}

export const buildClubProfileDocument = ({ clubId, input = {}, updatedAt = null }) => {
  const id = clean(clubId)
  if (!id || id.includes('/')) throw new Error('מזהה המועדון חסר או לא תקין')
  const official = clean(input.officialName)
  const display = clean(input.displayName)
  if (!official || !display) throw new Error('יש להזין שם רשמי ושם תצוגה למועדון')
  const clubUrl = clean(input.clubUrl)
  if (clubUrl) {
    let parsed
    try {
      parsed = new URL(clubUrl)
    } catch {
      throw new Error('כתובת המועדון אינה תקינה')
    }
    if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('כתובת המועדון חייבת להתחיל ב־http או https')
  }
  return {
    clubId: id,
    externalClubId: clean(input.externalClubId),
    clubUrl,
    names: {
      official,
      display,
      short: clean(input.shortName),
      source: clean(input.sourceName),
    },
    aliases: list(input.aliases),
    searchAliases: list(input.searchAliases),
    clubLevel: level(input.clubLevel, 'רמת המועדון'),
    clubStrengthLevel: level(input.clubStrengthLevel, 'עוצמת המועדון'),
    timestamps: { createdAt: updatedAt, updatedAt },
  }
}
