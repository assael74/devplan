// src/features/playersDatabase/ui/pages/teamPage/information/model/teamPerformanceInsight.model.test.js

import { buildTeamPerformanceInsight } from './teamPerformanceInsight.model.js'

const playersWithProfiles = (count, profileId = 'last_station') => (
  Array.from({ length: count }, (_, index) => ({
    playerId: `${profileId}-${index}`,
    rosterStatus: 'regular',
    professionalScoutProfileIds: [profileId],
  }))
)

const previousSeason = {
  seasonKey: '25/26',
  leagueLevel: 1,
  tableRank: 13,
  games: 24,
  scoutProfilesSummary: { total: 8 },
  teamPlayers: playersWithProfiles(8),
  performance: {
    offense: { priorityLevel: 'low' },
    defense: { priorityLevel: 'positive' },
  },
}

const currentSeason = {
  seasonKey: '26/27',
  leagueLevel: 1,
  tableRank: 18,
  games: 8,
  performance: {
    offense: { priorityLevel: 'low' },
    defense: {
      priorityLevel: 'low',
      qualityRate: 12,
      targetRate: 84,
      rankingNormalized: 28,
    },
  },
}

const buildInsight = ({
  current = currentSeason,
  previous = previousSeason,
  currentPlayers = playersWithProfiles(8),
} = {}) => (
  buildTeamPerformanceInsight({
    team: {
      name: 'בני יהודה תל אביב',
      league: { leagueLevel: current.leagueLevel },
      games: current.games,
    },
    currentSeason: current,
    previousSeason: previous,
    selectedTeamSeason: {
      teamPlayers: currentPlayers,
      scoutProfilesSummary: { total: currentPlayers.length },
    },
  })
)

test('reports a five-place fall and defensive priority levels with basic reliability', () => {
  const insight = buildInsight()

  expect(insight.summary).not.toContain('משחקת בליגה')
  expect(insight.summary).toContain('בני יהודה תל אביב ירדה ב־5 מקומות')
  expect(insight.summary).toContain('העדיפות ההגנתית ירדה מחיובית לנמוכה')
  expect(insight.summary).not.toContain('העדיפות ההתקפית')
  expect(insight.profileSummary).toBe('')
  expect(insight.changeStatus).toBe('significant')
  expect(insight.reliability).toBe('מהימנות בסיסית · 8 משחקים')
  expect(insight.facts.comparisonReliability).toBe('basic')
  expect(insight.details.find(detail => detail.key === 'rank').tone).toBe('negative')
  expect(insight.details.find(detail => detail.key === 'defense').text)
    .toBe('העדיפות ההגנתית ירדה מחיובית לנמוכה לעומת העונה הקודמת.')
  expect(insight.details.find(detail => detail.key === 'defense').tone).toBe('negative')
  expect(insight.details.find(detail => detail.key === 'reliability').text)
    .toBe('מהימנות ההשוואה בסיסית.')
})

test('reports a change of three unique profiled players separately', () => {
  const insight = buildInsight({ currentPlayers: playersWithProfiles(11) })

  expect(insight.profileSummary).toContain('עלה ב־3 שחקנים')
  expect(insight.summary).not.toContain('פרופיל')
  expect(insight.facts.profiles.professional.delta).toBe(3)
  expect(insight.details.find(detail => detail.key === 'professionalProfiles').tone).toBe('positive')
})

test('marks smaller measured changes for monitoring', () => {
  const insight = buildInsight({
    current: {
      ...currentSeason,
      tableRank: 14,
      performance: {
        offense: { priorityLevel: 'low' },
        defense: { priorityLevel: 'neutral' },
      },
    },
  })

  expect(insight.summary).toBe('לא זוהה שינוי משמעותי במדדים הזמינים.')
  expect(insight.changeStatus).toBe('minor')
  expect(insight.details.find(detail => detail.key === 'defense').text)
    .toBe('העדיפות ההגנתית ירדה מחיובית לרגילה לעומת העונה הקודמת.')
})

test('marks a better rank, stronger offense, and fewer underuse profiles as positive', () => {
  const insight = buildInsight({
    current: {
      ...currentSeason,
      tableRank: 8,
      performance: {
        offense: { priorityLevel: 'positive' },
        defense: { priorityLevel: 'positive' },
      },
    },
    previous: {
      ...previousSeason,
      scoutProfilesSummary: { total: 11 },
      teamPlayers: [
        ...playersWithProfiles(8),
        ...playersWithProfiles(3, 'underused_prospect'),
      ],
    },
  })

  expect(insight.details.find(detail => detail.key === 'rank').tone).toBe('positive')
  expect(insight.summary).toContain('העדיפות ההתקפית עלתה מנמוכה לחיובית')
  expect(insight.details.find(detail => detail.key === 'offense').text)
    .toBe('העדיפות ההתקפית עלתה מנמוכה לחיובית לעומת העונה הקודמת.')
  expect(insight.details.find(detail => detail.key === 'offense').tone).toBe('positive')
  expect(insight.details.find(detail => detail.key === 'underuseProfiles').tone).toBe('positive')
})

test('marks a fully compared season with no change as steady', () => {
  const insight = buildInsight({
    current: {
      ...currentSeason,
      tableRank: 13,
      performance: previousSeason.performance,
    },
  })

  expect(insight.changeStatus).toBe('steady')
  expect(insight.details.find(detail => detail.key === 'competition').text)
    .toBe('רמת התחרות: אין שינוי מעונה קודמת.')
  expect(insight.details.find(detail => detail.key === 'rank').text)
    .toBe('אין שינוי מעונה קודמת.')
  expect(insight.details.find(detail => detail.key === 'offense').text)
    .toBe('אין שינוי מעונה קודמת.')
  expect(insight.details.find(detail => detail.key === 'professionalProfiles').text)
    .toBe('פרופיל מקצועי: אין שינוי מעונה קודמת.')
})

test('counts opportunity profiles separately and each player once per group', () => {
  const currentPlayers = [
    ...playersWithProfiles(8),
    ...playersWithProfiles(3, 'underused_prospect'),
    { playerId: 'underused_prospect-0', professionalScoutProfileIds: ['underused_prospect'] },
    {
      playerId: 'both-opportunities',
      rosterStatus: 'regular',
      professionalScoutProfileIds: ['underused_prospect', 'blocked_top_team'],
    },
    {
      playerId: 'former-player',
      rosterStatus: 'left',
      professionalScoutProfileIds: ['underused_prospect'],
    },
  ]
  const insight = buildInsight({
    currentPlayers,
    previous: {
      ...previousSeason,
      teamPlayers: playersWithProfiles(1, 'underused_prospect'),
    },
  })

  expect(insight.facts.profiles.professional.current).toBe(8)
  expect(insight.facts.profiles.underuse.current).toBe(4)
  expect(insight.facts.profiles.underuse.delta).toBe(3)
  expect(insight.details.find(detail => detail.key === 'underuseProfiles').tone).toBe('negative')
  expect(insight.profileSummary).toContain('פרופיל חוסר שימוש עלה ב־3 שחקנים')
  expect(insight.profileSummary).toContain('פרופיל סקאוט מקצועי עלה ב־8 שחקנים')
})

test('does not claim season trends before eight games', () => {
  const insight = buildInsight({
    current: { ...currentSeason, games: 7 },
    currentPlayers: playersWithProfiles(11),
  })

  expect(insight.summary).toBe('אין עדיין בסיס מספק להשוואה לעונה הקודמת.')
  expect(insight.profileSummary).toBe('')
  expect(insight.changeStatus).toBe('limited')
  expect(insight.reliability).toBe('מדגם לא מספק · 7 משחקים')
  expect(insight.facts.rankDelta).toBeNull()
  expect(insight.details.find(detail => detail.key === 'rank').text)
    .toBe('')
})

test('reports a known competition level change even before eight games', () => {
  const insight = buildInsight({ current: { ...currentSeason, leagueLevel: 2, games: 7 } })

  expect(insight.summary).toContain('רמת התחרות ירדה מרמה 1 לרמה 2')
  expect(insight.changeStatus).toBe('significant')
  expect(insight.details.find(detail => detail.key === 'competition').tone).toBe('negative')
  expect(insight.summary).not.toContain('מקומות')
})

test('does not compare table positions after a change in competition level', () => {
  const insight = buildInsight({
    current: { ...currentSeason, leagueLevel: 2 },
  })

  expect(insight.summary).toContain('רמת התחרות ירדה מרמה 1 לרמה 2')
  expect(insight.summary).not.toContain('מקומות')
  expect(insight.facts.rankDelta).toBeNull()
})

test('uses the weaker season for comparison reliability', () => {
  const insight = buildInsight({
    current: { ...currentSeason, games: 16 },
    previous: { ...previousSeason, games: 12 },
  })

  expect(insight.reliability).toBe('מהימנות תקינה · 16 משחקים')
  expect(insight.facts.comparisonReliability).toBe('intermediate')
})

test('omits profile comparison when a season has no roster player data', () => {
  const insight = buildInsight({
    previous: { ...previousSeason, teamPlayers: null },
    currentPlayers: playersWithProfiles(11),
    current: {
      ...currentSeason,
      tableRank: 13,
      performance: previousSeason.performance,
    },
  })

  expect(insight.profileSummary).toBe('')
  expect(insight.changeStatus).toBe('limited')
  expect(insight.facts.profiles.professional.delta).toBeNull()
  expect(insight.details.find(detail => detail.key === 'professionalProfiles').text)
    .toContain('אין נתון קודם')
})

test('does not turn an unloaded scouting season into zero profiles', () => {
  const insight = buildTeamPerformanceInsight({
    team: { league: { leagueLevel: 1 }, games: 8 },
    currentSeason,
    previousSeason,
    selectedTeamSeason: { teamPlayers: playersWithProfiles(8), scoutProfilesSummary: {} },
  })

  expect(insight.facts.profiles.professional.current).toBeNull()
  expect(insight.profileSummary).toBe('')
  expect(insight.details.find(detail => detail.key === 'professionalProfiles').text)
    .toContain('לא ניתן להשוות')
})
