// src/features/playersDatabase/model/team/teamPriorityDetails.model.test.js

import { buildTeamPriorityDetails } from './teamPriorityDetails.model.js'

const view = {
  priority: { score: 78, level: 'high' },
  quality: { rate: 90 },
  target: { rate: 120, normalized: 80 },
  ranking: { rate: 150, normalized: 75 },
}
const team = { games: 8, goalsFor: 27, goalsAgainst: 6, tableRank: 1 }

test('uses measured goals and games instead of technical percentages', () => {
  const details = buildTeamPriorityDetails({ side: 'offense', view, teamName: 'קבוצה א', team })

  expect(details.context).toBe('קבוצה א')
  expect(details.items).toHaveLength(3)
  expect(details.items[0].evidence).toBe('27 שערים ב־8 משחקים')
  expect(details.items[1].evidence).toBe('3.4 שערים למשחק')
  expect(details.items[1].text).toContain('כובשת יותר')
  expect(details.items.every(item => !item.evidence.includes('%'))).toBe(true)
})

test('higher defensive target rates mean fewer conceded goals', () => {
  const details = buildTeamPriorityDetails({ side: 'defense', view, team })

  expect(details.items[0].evidence).toBe('6 ספיגות ב־8 משחקים')
  expect(details.items[1].evidence).toBe('0.8 ספיגות למשחק')
  expect(details.items[1].text).toContain('סופגת פחות')
  expect(details.items[2].evidence).toBe('מקום 1 בטבלה')
})

test('the conclusion explains a mixed result instead of repeating the league standing', () => {
  const details = buildTeamPriorityDetails({ side: 'defense', view: { ...view, ranking: { rate: 33 } }, team })

  expect(details.summary).toContain('למרות הפער מול המיקום')
  expect(details.summary).not.toContain('בחלק העליון')
  expect(details.items[2].text).toContain('פחות טוב')
})

test('a lower defensive target rate means more conceded goals', () => {
  const details = buildTeamPriorityDetails({ side: 'defense', view: { ...view, target: { rate: 80 } }, team })
  expect(details.items[1].text).toContain('סופגת יותר')
})

test('uses an exact rank only when it is provided', () => {
  const details = buildTeamPriorityDetails({ side: 'defense', view: { ...view, rank: 3 }, team: { ...team, teamsCount: 19 } })

  expect(details.items[0].evidence).toBe('דירוג הגנה: 3 מתוך 19')
  expect(details.items[2].evidence).toBe('דירוג הגנה: 3 · מקום 1 בטבלה')
})

test('capped ratios do not manufacture a precise rank or expected goal count', () => {
  const details = buildTeamPriorityDetails({ view: { ...view, target: { rate: 200 }, ranking: { rate: 200 } } })

  expect(details.items.every(item => item.evidence === '')).toBe(true)
  expect(details.items[1].text).toContain('כובשת יותר')
})

test('missing data gives a partial conclusion and explicit unavailable states', () => {
  const details = buildTeamPriorityDetails()

  expect(details.score).toBeNull()
  expect(details.summary).toContain('המידע חלקי')
  expect(details.items.every(item => item.evidence === 'לא זמין')).toBe(true)
})

test('zero conceded goals is meaningful while zero games has no measured pace', () => {
  const details = buildTeamPriorityDetails({ side: 'defense', view, team: { ...team, goalsAgainst: 0 } })
  expect(details.items[0].evidence).toBe('0 ספיגות ב־8 משחקים')
  expect(details.items[1].evidence).toBe('0 ספיגות למשחק')

  const opening = buildTeamPriorityDetails({ side: 'defense', view, team: { ...team, games: 0 } })
  expect(opening.items[1].evidence).toBe('')
})

test('positive, weaker and neutral components are explicit for both sides', () => {
  const details = buildTeamPriorityDetails({
    view: { ...view, target: { rate: 80 }, ranking: { rate: 100 } },
  })
  expect(details.items.map(item => item.impact)).toEqual([
    { level: 'positive', label: 'מקדם' },
    { level: 'negative', label: 'לא מקדם' },
    { level: 'neutral', label: 'לא מקדם' },
  ])
})

test('a mismatched stored score never receives a misleading arithmetic explanation', () => {
  const details = buildTeamPriorityDetails({ view })
  expect(details.calculation).toBeNull()
  expect(details.items.every(item => !item.contribution)).toBe(true)
  expect(details.calculationUnavailable).toContain('אינם תואמים לציון השמור')
})

test('a display rounding boundary does not pretend that 60.5 rounds to 60', () => {
  const details = buildTeamPriorityDetails({
    view: {
      priority: { score: 60, level: 'positive' },
      quality: { rate: 67 }, target: { rate: 75 }, ranking: { rate: 104 },
    },
  })
  expect(details.calculation).toBeNull()
})
