const clean = value => String(value === null || value === undefined ? '' : value).trim()
const normalizeName = value => clean(value).replace(/[.״"׳']/g, '').replace(/\s+/g, ' ').toLowerCase()
const normalizePart = value => normalizeName(value).replace(/[^0-9a-zA-Z\u0590-\u05FF]+/g, '_').replace(/^_+|_+$/g, '')

export const buildPlayerDocumentId = (player = {}) => {
  const externalPlayerId = clean(player.externalPlayerId)
  const birthYear = clean(player.birthYear)
  if (/^\d{5,}$/.test(externalPlayerId) && externalPlayerId !== birthYear && !/^(19|20)\d{2}$/.test(externalPlayerId)) {
    return `external__${normalizePart(externalPlayerId)}`
  }
  const existing = clean(player.playerDocumentId)
  if (/^(?:external|name)__(?:.+)$/.test(existing)) return existing
  const normalizedName = normalizeName(player.normalizedName || player.fullName)
  return normalizedName ? `name__${normalizePart(normalizedName)}` : ''
}
