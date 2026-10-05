// src/features/playersDatabase/ui/pages/teamPage/structure/model/teamStructureFilter.model.test.js

import {
  TEAM_STRUCTURE_FILTER,
  resolveDefaultTeamStructureFilter,
} from './teamStructureFilter.model.js'

test('shows the full roster when players exist before Stats classification', () => {
  const result = resolveDefaultTeamStructureFilter({
    structure: null,
    rows: [{
      structureFilterKeys: [TEAM_STRUCTURE_FILTER.ALL_SQUAD],
    }],
  })

  expect(result).toBe(TEAM_STRUCTURE_FILTER.ALL_SQUAD)
})

test('uses classified players when a classified structure is available', () => {
  const result = resolveDefaultTeamStructureFilter({
    structure: { availability: 'available' },
    rows: [{
      structureFilterKeys: [
        TEAM_STRUCTURE_FILTER.ALL_SQUAD,
        TEAM_STRUCTURE_FILTER.CLASSIFIED,
      ],
    }],
  })

  expect(result).toBe(TEAM_STRUCTURE_FILTER.CLASSIFIED)
})
