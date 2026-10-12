// src/features/playersDatabase/ui/pages/DataOpsPage/logic/focusedAuditSourceReload.test.js

import { getFocusedAuditSourceReload } from './focusedAuditSourceReload.js'

const scope = { leagueId: 'league-a', teamId: 'team-a', seasonId: '2025_2026' }

test('keeps the audited league and season in the source reload route', () => {
  expect(getFocusedAuditSourceReload({
    scope,
    finding: { type: 'missing_canonical_dependency', field: 'missing_league' },
  })).toMatchObject({
    route: '/players-database/leagues?openLeague=league-a&auditSeasonId=2025_2026&repairReload=1',
    context: { leagueId: 'league-a', seasonId: '2025_2026', seasonKey: '25/26', repairReload: true },
  })
})

test('offers manual source entry through the system audit for a missing club', () => {
  expect(getFocusedAuditSourceReload({
    scope,
    finding: { type: 'missing_canonical_dependency', target: 'clubProfile' },
  }).route).toBe('/players-database/data-ops/system-audit')
})

test('does not offer source reload for projection mismatches or an incomplete scope', () => {
  expect(getFocusedAuditSourceReload({ scope, finding: { type: 'projection_mismatch' } })).toBeNull()
  expect(getFocusedAuditSourceReload({ finding: { type: 'missing_canonical_dependency', field: 'missing_league' } })).toBeNull()
})
