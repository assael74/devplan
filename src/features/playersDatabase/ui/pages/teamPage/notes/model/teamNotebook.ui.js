// src/features/playersDatabase/ui/pages/teamPage/notes/model/teamNotebook.ui.js

import { TEAM_INSIGHTS } from '../../information/model/teamWorkspace.navigation.js'

export const EMPTY_NOTES = Object.freeze({ generalText: '', findingsById: {} })
export const EMPTY_OPTIONS = Object.freeze([])
export const EMPTY_FILTERS = Object.freeze({ query: '', insightId: '', seasonId: '', playerId: '' })

export const NOTE_STATUSES = Object.freeze([
  { id: 'open', label: 'דורש בדיקה', color: 'warning' },
  { id: 'confirmed', label: 'אומת', color: 'success' },
  { id: 'closed', label: 'נסגר', color: 'neutral' },
])

export const INSIGHT_OPTIONS = Object.freeze(TEAM_INSIGHTS.map(item => ({
  id: item.id,
  label: item.title,
})))

const text = value => typeof value === 'string' ? value : ''
const ids = value => Array.isArray(value) ? [...new Set(value.filter(item => text(item)))] : []
const time = value => Date.parse(value) || 0

export const getNoteStatus = id => NOTE_STATUSES.find(item => item.id === id) || NOTE_STATUSES[0]

export const getOptionLabel = (options, id, fallback = 'פריט') => {
  const option = options.find(item => item.id === id)
  return option ? option.label : `${fallback} · ${id}`
}

// View data only. Incoming objects and arrays are never mutated or written back.
export const createNotebookView = notes => {
  const source = notes && typeof notes === 'object' ? notes : EMPTY_NOTES
  const entries = source.findingsById && typeof source.findingsById === 'object'
    ? Object.entries(source.findingsById)
    : []
  const findings = entries.filter(([, value]) => value && typeof value === 'object')
    .map(([id, value]) => ({
      id,
      text: text(value.text),
      insightIds: ids(value.insightIds),
      relatedSeasonIds: ids([...ids(value.relatedSeasonIds), text(value.focusSeasonId)]),
      relatedPlayerIds: ids(value.relatedPlayerIds),
      focusSeasonId: text(value.focusSeasonId),
      status: getNoteStatus(value.status).id,
      createdAt: text(value.createdAt),
      updatedAt: text(value.updatedAt),
      isNew: false,
    }))
    .sort((a, b) => time(b.updatedAt || b.createdAt) - time(a.updatedAt || a.createdAt))
  return { generalText: text(source.generalText), findings }
}

export const createFindingDraft = ({ id, insightId = '', seasonId = '' }) => ({
  id,
  text: '',
  insightIds: INSIGHT_OPTIONS.some(item => item.id === insightId) ? [insightId] : [],
  relatedSeasonIds: seasonId ? [seasonId] : [],
  relatedPlayerIds: [],
  focusSeasonId: seasonId,
  status: 'open',
  createdAt: '',
  updatedAt: '',
  isNew: true,
})

export const formatNoteDate = value => {
  if (!value || !Number.isFinite(Date.parse(value))) return ''
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date(value))
}

export const getFindingPreview = finding => finding.text.trim() || 'ממצא חדש — עדיין לא נכתב טקסט'

// Keep linked IDs visible even when a historical player is absent from the supplied options.
export const includeLinkedOptions = (options, linkedIds, fallback) => {
  const result = []
  const seen = new Set()
  for (const option of options) {
    if (!option || !text(option.id) || seen.has(option.id)) continue
    result.push({ ...option, label: text(option.label) || option.id })
    seen.add(option.id)
  }
  for (const id of ids(linkedIds)) {
    if (seen.has(id)) continue
    result.push({ id, label: `${fallback} · ${id}`, description: 'פרטי התצוגה אינם ברשימה שסופקה' })
    seen.add(id)
  }
  return result
}

export const filterNotebookFindings = (findings, filters, playerOptions) => {
  const query = filters.query.trim().toLocaleLowerCase('he')
  return findings.filter(finding => {
    if (filters.insightId && !finding.insightIds.includes(filters.insightId)) return false
    if (filters.seasonId && !finding.relatedSeasonIds.includes(filters.seasonId)) return false
    if (filters.playerId && !finding.relatedPlayerIds.includes(filters.playerId)) return false
    if (!query) return true
    const playerNames = finding.relatedPlayerIds.map(id => getOptionLabel(playerOptions, id, 'שחקן'))
    return [finding.text, ...playerNames].join(' ').toLocaleLowerCase('he').includes(query)
  })
}
