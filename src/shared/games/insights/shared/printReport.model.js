// src/shared/games/insights/shared/printReport.model.js

const emptyText = 'לא זמין'

const cleanText = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback

  const text = String(value).trim()

  return text || fallback
}

const normalizeValue = (value) => {
  if (value === null || value === undefined || value === '') return emptyText

  return String(value)
}

const normalizeCard = (card = {}) => {
  return {
    id: card.id || card.key || card.label || card.title,
    title: cleanText(card.title || card.label, emptyText),
    value: normalizeValue(card.value),
    sub: cleanText(card.sub || card.subtitle),
    takeaway: cleanText(card.takeaway || card.insight),
  }
}

const normalizeCards = (cards) => {
  if (!Array.isArray(cards)) return []

  return cards
    .filter(Boolean)
    .map(normalizeCard)
}

const normalizeSection = (section = {}) => {
  const rows = section.rows || section.items || section.cards || []

  return {
    id: section.id || section.key || section.title,
    title: cleanText(section.title, emptyText),
    summary: cleanText(section.summary || section.takeaway || section.description),
    rows: normalizeCards(rows),
  }
}

const normalizeSections = (sections) => {
  if (!Array.isArray(sections)) return []

  return sections
    .filter(Boolean)
    .map(normalizeSection)
}

export const buildInsightsPrintReportModel = ({
  reportType = 'דוח תובנות',
  title = '',
  subtitle = '',
  producedAt = new Date(),
  meta = [],
  cards = [],
  sections = [],
}) => {
  return {
    reportType,
    title: cleanText(title, reportType),
    subtitle: cleanText(subtitle),
    producedAtLabel: producedAt.toLocaleDateString('he-IL'),
    meta: normalizeCards(meta),
    cards: normalizeCards(cards),
    sections: normalizeSections(sections),
  }
}
