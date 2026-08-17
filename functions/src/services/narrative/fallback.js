// C:\projects\devplan\functions\src\services\narrative\fallback.js

function clean(value) {
  return String(value || '').trim()
}

function buildFallback(input = {}) {
  const entries = Array.isArray(input.context?.entries) ? input.context.entries : []
  const profiles = entries
    .flatMap(entry => Array.isArray(entry.profiles) ? entry.profiles : [])
    .filter(profile => clean(profile.profileId))
  const primary = profiles[0] || null
  const seasonKeys = [...new Set(entries.map(entry => clean(entry.seasonKey)).filter(Boolean))]
  const evidenceRefs = (Array.isArray(input.evidence) ? input.evidence : [])
    .slice(0, 6)
    .map(item => clean(item.id))
    .filter(Boolean)

  const title = primary
    ? `פרופיל ${clean(primary.profileLabel || primary.profileId)}`
    : 'סיפור שחקן'
  const seasonsText = seasonKeys.length
    ? `הסיפור מבוסס על ${seasonKeys.length} עונות זמינות.`
    : 'הסיפור מבוסס על המידע המקצועי הזמין.'

  return {
    title,
    summary: seasonsText,
    evidenceRefs,
  }
}

module.exports = { buildFallback }
