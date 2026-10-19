// src/features/playersDatabase/model/team/teamNotes.model.js

export const TEAM_NOTE_SECTION_IDS = Object.freeze([
  'performance',
  'roster-balance',
  'year-movements',
  'future-competition',
  'club-gap',
  'general',
])

const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const clean = value => String(value === null || value === undefined ? '' : value).trim()
const uniqueIds = value => [...new Set((Array.isArray(value) ? value : []).map(clean).filter(Boolean))]

export const normalizeTeamNoteContent = value => {
  const parts = Array.isArray(value) ? value : [{ type: 'text', text: String(value || '') }]
  const result = []
  parts.forEach(part => {
    if (part && part.type === 'mention') {
      const id = clean(part.id)
      const label = clean(part.label)
      if (!/^player__\d{4}__\d{5,}$/.test(id) || !label) {
        throw new Error('אזכור שחקן חסר מזהה קנוני או שם')
      }
      result.push({ type: 'mention', id, label })
      return
    }
    const text = String(part && part.text !== undefined ? part.text : '')
    if (!text) return
    const previous = result[result.length - 1]
    if (previous && previous.type === 'text') previous.text += text
    else result.push({ type: 'text', text })
  })
  return result.length ? result : [{ type: 'text', text: '' }]
}

export const notePlayerIds = content => [...new Set(normalizeTeamNoteContent(content)
  .filter(part => part.type === 'mention')
  .map(part => part.id))]

export const createEmptyTeamNotes = () => Object.fromEntries([
  ['showInvestigationIndicator', false],
  ...TEAM_NOTE_SECTION_IDS.map(id => [id, {
    content: [{ type: 'text', text: '' }],
    relatedPlayerIds: [],
    reportsIds: [],
  }]),
])

export const hasTeamNoteContent = notes => {
  if (typeof notes === 'string') return Boolean(notes.trim())
  const source = object(notes)
  if (clean(source.generalText)) return true
  if (Object.values(object(source.routeTextsById)).some(value => clean(value))) return true
  return TEAM_NOTE_SECTION_IDS.some(id => {
    const section = object(source[id])
    const content = Array.isArray(section.content) ? section.content : []
    return content.some(part => part?.type === 'mention' || clean(part?.text)) ||
      clean(typeof section.content === 'string' ? section.content : '')
  })
}

export const hasTeamNoteData = notes => {
  if (hasTeamNoteContent(notes)) return true
  const source = object(notes)
  if (source.showInvestigationIndicator === true) return true
  return TEAM_NOTE_SECTION_IDS.some(id => {
    const section = object(source[id])
    return uniqueIds(section.relatedPlayerIds).length > 0 ||
      uniqueIds(section.reportsIds).length > 0
  })
}

export const buildTeamNotesSavePatch = ({
  currentNotes,
  contentsById,
  dirtyIds,
  showInvestigationIndicator,
}) => {
  const source = object(currentNotes)
  const legacyText = typeof currentNotes === 'string' ? currentNotes : source.generalText
  const legacyRoutes = object(source.routeTextsById)
  const patch = {}
  const needsMigration = typeof currentNotes !== 'object' || currentNotes === null || Array.isArray(currentNotes)

  TEAM_NOTE_SECTION_IDS.forEach(id => {
    const existing = object(source[id])
    const legacyContent = id === 'general' ? legacyText : legacyRoutes[id]
    const content = dirtyIds.includes(id)
      ? normalizeTeamNoteContent(contentsById[id])
      : normalizeTeamNoteContent(existing.content || legacyContent || '')
    if (dirtyIds.includes(id) || !Array.isArray(existing.content) || !Array.isArray(existing.relatedPlayerIds)) {
      patch[`notes.${id}.content`] = content
      patch[`notes.${id}.relatedPlayerIds`] = [...new Set([
        ...uniqueIds(existing.relatedPlayerIds),
        ...notePlayerIds(content),
      ])]
    }
    if (!Array.isArray(existing.reportsIds)) {
      patch[`notes.${id}.reportsIds`] = []
    }
  })

  if (source.showInvestigationIndicator !== showInvestigationIndicator) {
    patch['notes.showInvestigationIndicator'] = showInvestigationIndicator
  }
  if (needsMigration) {
    const notes = { showInvestigationIndicator }
    TEAM_NOTE_SECTION_IDS.forEach(id => {
      notes[id] = {
        content: patch[`notes.${id}.content`],
        relatedPlayerIds: patch[`notes.${id}.relatedPlayerIds`],
        reportsIds: [],
      }
    })
    return { notes }
  }
  return patch
}
