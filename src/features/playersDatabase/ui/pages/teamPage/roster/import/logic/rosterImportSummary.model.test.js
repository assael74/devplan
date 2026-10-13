// src/features/playersDatabase/ui/pages/teamPage/roster/import/logic/rosterImportSummary.model.test.js
import { buildRosterImportSummary } from './rosterImportSummary.model.js'

test('reads the approved canonical roster, movements and pending players', () => {
  const outgoing = { movementId: 'out', playerId: 'old', toTeamId: 'target', toTeamSeasonDocumentId: 'target-season' }
  const plan = {
    canonical: { teamSeason: {
      roster: {
        playersById: {
          p1: { playerId: 'p1', fullName: 'פעיל', rosterStatus: 'regular' },
          p2: { playerId: 'p2', fullName: 'עזב', rosterStatus: 'left' },
          p3: { playerId: 'p3', fullName: 'צעיר', rosterStatus: 'youngerAgeGroup' },
        },
        pendingById: { unknown: { playerId: 'unknown', fullName: 'לא ידוע' } },
      },
      movement: {
        transfersInById: { in: { movementId: 'in', playerId: 'p1', fromTeamId: 'source' } },
        transfersOutById: { out: outgoing },
      },
      stats: { teamBalance: { lineStructure: { unassignedPlayersCount: 1 } } },
    } },
    counterparts: [{ documentId: 'target-season', movement: { transfersInById: { out: outgoing } } }],
  }
  const before = JSON.stringify(plan)
  const summary = buildRosterImportSummary({
    plan,
    missingPlayers: [{ playerId: 'old', fullName: 'שחקן מהסגל הקודם' }],
    teamOptions: [{ birthTeamDocumentId: 'target', teamName: 'קבוצת יעד' }],
  })
  expect(summary.players).toHaveLength(3)
  expect(summary.preview).toMatchObject({ playersCount: 1, transfersInCount: 1, transfersOutCount: 1, pendingPlayersCount: 1 })
  expect(summary.preview.teamBalance).toBe(plan.canonical.teamSeason.stats.teamBalance)
  expect(summary.pendingPlayers[0].fullName).toBe('לא ידוע')
  expect(summary.counterparts[1]).toMatchObject({ playerName: 'שחקן מהסגל הקודם', teamName: 'קבוצת יעד', exists: true })
  expect(summary.counterparts[0].exists).toBe(false)
  expect(JSON.stringify(plan)).toBe(before)
})

test('does not invent balance or hide a genuinely empty roster', () => {
  const summary = buildRosterImportSummary({ plan: { canonical: { teamSeason: { roster: { playersById: {} } } } } })
  expect(summary.players).toEqual([])
  expect(summary.preview).toEqual({ playersCount: 0, transfersInCount: 0, transfersOutCount: 0, pendingPlayersCount: 0, teamBalance: null })
})
