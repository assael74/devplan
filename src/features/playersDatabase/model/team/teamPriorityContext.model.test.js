// src/features/playersDatabase/model/team/teamPriorityContext.model.test.js

import { buildLeaguePageTeams } from '../league/page/leaguePage.model.js'
import { buildLeaguePriorityContexts } from './teamPriorityContext.model.js'
import { buildTeamPriorityDetails } from './teamPriorityDetails.model.js'

// Official table values from the supplied league export; no club or player data.
const table = [
  [8, 19, 6], [8, 27, 11], [8, 17, 5], [8, 26, 3], [7, 23, 12],
  [8, 18, 16], [7, 12, 14], [7, 18, 13], [8, 16, 12], [8, 12, 17],
  [8, 20, 18], [7, 12, 11], [8, 15, 21], [7, 10, 14], [7, 12, 27],
  [7, 5, 23], [8, 10, 20], [8, 7, 20], [7, 7, 23],
]
const performance = {
  defense: { qualityRate: 79, targetRate: 139, rankingRate: 180, scoutPriorityScore: 84, priorityLevel: 'elite' },
  offense: { qualityRate: 58, targetRate: 109, rankingRate: 100, scoutPriorityScore: 61, priorityLevel: 'positive' },
}
const season = {
  leagueTotalRound: 38,
  performanceCalculation: { appliedFactor: 1.217 },
  table: {
    teamsById: Object.fromEntries(table.map(([games, goalsFor, goalsAgainst], index) => [
      `team-${index + 1}`,
      {
        officialTable: { rank: index + 1, teamGamePlayed: games, goalsFor, goalsAgainst },
        performance: index === 8 ? performance : {},
      },
    ])),
  },
}

const getDetails = side => {
  const team = buildLeaguePageTeams({ season, leagueLevel: 1 }).find(row => row.tableRank === 9)
  return buildTeamPriorityDetails({ side, team, view: team.performanceView[side] })
}

test('the exported ninth-place defense explains 84 using the saved league adjustment', () => {
  const details = getDetails('defense')
  expect(details.items[0].evidence).toBe('דירוג הגנה: 5 מתוך 19')
  expect(details.items[1].evidence).toBe('בפועל 1.5 · יעד מותאם 2.08 ספיגות למשחק')
  expect(details.items[1].periodEvidence).toContain('יעד של כ־16.6')
  expect(details.items[1].text).toContain('סופגת פחות')
  expect(details.items[1].seasonEvidence).toContain('תחזית 57 מול יעד 79 ספיגות')
  expect(details.items.map(item => item.contribution.formula)).toEqual([
    '79 × 60% = 47.4', '93 × 25% = 23.25', '90 × 15% = 13.5',
  ])
  expect(details.calculation.formula).toBe('47.4 + 23.25 + 13.5 = 84.15')
  expect(details.calculation.result).toBe('לאחר עיגול: 84 מתוך 100')
  expect(details.items.every(item => item.impact.level === 'positive')).toBe(true)
})

test('offensive details use the goals-for target and identify only the positive component', () => {
  const details = getDetails('offense')
  expect(details.items[1].evidence).toBe('בפועל 2 · יעד מותאם 1.84 שערים למשחק')
  expect(details.items[1].seasonEvidence).toContain('תחזית 76 מול יעד 70 שערים')
  expect(details.items.map(item => item.impact.level)).toEqual(['neutral', 'positive', 'neutral'])
  expect(details.calculation.result).toBe('לאחר עיגול: 61 מתוך 100')
})

test('missing adjustment does not silently replace the adjusted target with a default', () => {
  expect(buildLeaguePriorityContexts({ season: { ...season, performanceCalculation: {} }, leagueLevel: 1 })).toEqual({})
  expect(buildLeaguePriorityContexts({ season })).toEqual({})
  expect(buildLeaguePriorityContexts()).toEqual({})
})
