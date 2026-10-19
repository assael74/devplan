// src/features/playersDatabase/model/team/teamNotes.model.test.js

import {
  buildTeamNotesSavePatch,
  createEmptyTeamNotes,
  hasTeamNoteContent,
  hasTeamNoteData,
} from './teamNotes.model.js'

test('updates edited text and player IDs without replacing report links', () => {
  const notes = createEmptyTeamNotes()
  notes.performance.reportsIds = ['report-1']
  notes.performance.relatedPlayerIds = ['player__2012__98765']
  notes.general.content = [{ type: 'text', text: 'קיים' }]
  const patch = buildTeamNotesSavePatch({
    currentNotes: notes,
    contentsById: {
      performance: [
        { type: 'text', text: 'בדיקה של ' },
        { type: 'mention', id: 'player__2012__12345', label: 'שחקן א', href: '/player/1' },
      ],
    },
    dirtyIds: ['performance'],
    showInvestigationIndicator: false,
  })

  expect(patch).toEqual({
    'notes.performance.content': [
      { type: 'text', text: 'בדיקה של ' },
      { type: 'mention', id: 'player__2012__12345', label: 'שחקן א' },
    ],
    'notes.performance.relatedPlayerIds': ['player__2012__98765', 'player__2012__12345'],
  })
  expect(notes.performance.reportsIds).toEqual(['report-1'])
})

test('migrates legacy text and keeps a root with notes or report links', () => {
  const patch = buildTeamNotesSavePatch({
    currentNotes: 'הערה ישנה',
    contentsById: {},
    dirtyIds: [],
    showInvestigationIndicator: true,
  })

  expect(patch.notes.general.content).toEqual([{ type: 'text', text: 'הערה ישנה' }])
  expect(patch.notes.performance.reportsIds).toEqual([])
  expect(hasTeamNoteData(patch.notes)).toBe(true)
  expect(hasTeamNoteData(createEmptyTeamNotes())).toBe(false)
})

test('rejects a mention without a canonical player ID', () => {
  expect(() => buildTeamNotesSavePatch({
    currentNotes: createEmptyTeamNotes(),
    contentsById: { general: [{ type: 'mention', id: 'name-only', label: 'שחקן' }] },
    dirtyIds: ['general'],
    showInvestigationIndicator: false,
  })).toThrow('מזהה קנוני')
})

test('note indicator depends on saved writing, not the manual investigation flag or links', () => {
  const notes = createEmptyTeamNotes()
  notes.showInvestigationIndicator = true
  notes.performance.reportsIds = ['report-1']
  expect(hasTeamNoteContent(notes)).toBe(false)
  expect(hasTeamNoteData(notes)).toBe(true)

  notes.performance.content = [{ type: 'text', text: '  ' }, { type: 'mention', id: 'player__2012__12345', label: 'שחקן' }]
  expect(hasTeamNoteContent(notes)).toBe(true)
})
