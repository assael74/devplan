import { buildPlayersDatabaseImportPlan } from './buildPlayersDatabaseImportPlan.js'

export const buildPlayersDatabaseImportPlanSample = () =>
  buildPlayersDatabaseImportPlan([
    {
      rowId: 'sample-1',
      externalPlayerId: 'EXT-92841',
      profileUrl: 'https://example.com/player/92841',
      fullName: 'נועם לוי',
      clubName: 'מכבי חיפה',
      teamName: 'נערים ג׳ צפון',
      leagueName: 'על מחוזית',
      seasonId: '2025-2026',
      minutes: 1420,
      goals: 18,
    },
    {
      rowId: 'sample-2',
      playerName: 'משה לוי',
      clubName: 'בני סכנין',
      teamName: 'נערים ב בני סכנין',
      leagueName: 'נערים ב צפון',
      minutes: 520,
      goals: 4,
    },
  ])
