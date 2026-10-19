// src/features/playersDatabase/services/write/manualEdits.boundary.test.mjs

import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../../', import.meta.url)

const activeHooks = [
  'ui/hooks/useTeamUrlEditor.js',
  'ui/pages/clubPage/hooks/useClubUrlEditor.js',
  'ui/pages/leaguePage/hooks/useLeagueUrlEditor.js',
  'ui/pages/playerPage/hooks/usePlayerAgentEditor.js',
  'ui/pages/playerPage/hooks/usePlayerGoalDistributionEditor.js',
  'ui/pages/playerPage/hooks/usePlayerUrlEditor.js',
  'ui/pages/searchPage/hooks/useSearchPlayerActions.js',
  'ui/pages/searchPage/hooks/useSearchTeamUrlEditor.js',
  'ui/pages/teamPage/hooks/useTeamPageUrlEditor.js',
  'ui/pages/teamPage/hooks/useTeamRoleEditor.js',
]

const canonicalWriters = [
  'services/write/club/edits/updateClubUrl.js',
  'services/write/league/edits/updateLeagueCompetitionRules.js',
  'services/write/league/edits/updateLeagueSeasonUrl.js',
  'services/write/league/edits/updateLeagueSeasonSettings.js',
  'services/write/league/edits/updateTeamSeasonUrl.js',
  'services/write/player/edits/updatePlayerRootManual.js',
  'services/write/roster/edits/updatePlayerSeasonManual.js',
]

const read = relativePath => readFile(new URL(relativePath, root), 'utf8')

test('active manual-edit hooks do not import writeV2 edits', async () => {
  for (const file of activeHooks) {
    const source = await read(file)
    assert.doesNotMatch(source, /services\/writeV2\/edits/)
  }
})

test('canonical manual-edit writers do not use removed identities or masters', async () => {
  for (const file of canonicalWriters) {
    const source = await read(file)
    assert.doesNotMatch(
      source,
      /playerDocumentId|clubSeasonIdentityIndex|birthTeamSeason|clubsMaster|leaguesMaster/,
    )
  }
})
