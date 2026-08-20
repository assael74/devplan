// C:\projects\devplan\functions\src\services\narrative\fallback.js

function clean(value) {
  return String(value || '').trim()
}

function resolvePrimaryProfile(input = {}) {
  const seasonKey = clean(input.decision?.seasonKey)
  const entries = Array.isArray(input.meaning?.entries) ? input.meaning.entries : []
  const current = entries.find(entry => clean(entry.seasonKey) === seasonKey) ||
    entries.find(entry => clean(entry.sourceTarget) === 'current') ||
    entries[0] || null

  return current?.profiles?.primary || null
}

function buildFallback(input = {}) {
  const primary = resolvePrimaryProfile(input)
  const entries = Array.isArray(input.context?.entries) ? input.context.entries : []
  const seasonKeys = [...new Set(entries.map(entry => clean(entry.seasonKey)).filter(Boolean))]
  const evidenceRefs = (Array.isArray(input.evidence) ? input.evidence : [])
    .slice(0, 6)
    .map(item => clean(item.id))
    .filter(Boolean)
  const profileLabel = clean(primary?.profileLabel)
  const title = profileLabel ? `מקרה סקאוטינג סביב ${profileLabel}` : 'סיפור מקצועי לשחקן'
  const whyInteresting = profileLabel
    ? `מודל הסקאוט זיהה את ${profileLabel} כפרופיל המרכזי הנוכחי.`
    : 'קיים מידע מקצועי רלוונטי לשחקן, אך חסר פרופיל מרכזי להצגה.'
  const professionalContext = seasonKeys.length
    ? `התמונה מבוססת על ${seasonKeys.length} עונות זמינות.`
    : 'התמונה מבוססת על המידע המקצועי הזמין.'

  return {
    title,
    conclusionText: whyInteresting,
    whyInteresting,
    professionalContext,
    strengths: [],
    unknowns: [],
    evidenceRefs,
  }
}

module.exports = { buildFallback }
