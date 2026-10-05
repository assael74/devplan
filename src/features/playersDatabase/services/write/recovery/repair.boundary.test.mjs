// src/features/playersDatabase/services/write/recovery/repair.boundary.test.mjs

import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('./repairWriteAction.js', import.meta.url), 'utf8')

test('receipt repair never opens or resets a WriteAction receipt', () => {
  assert.doesNotMatch(source, /openWriteActionReceipt/)
  assert.match(source, /beginWriteActionRepair/)
  assert.match(source, /completeWriteActionAudit/)
})

test('receipt repair uses canonical projection writers and excludes canonical writers', () => {
  assert.match(source, /writeTeamSeasonCompetitionSnapshots/)
  assert.match(source, /writeRosterPlayerSeasons/)
  assert.match(source, /writeStatsPlayerRoots/)
  assert.doesNotMatch(source, /writeLeagueCanonical/)
  assert.doesNotMatch(source, /writeRosterCanonical/)
  assert.doesNotMatch(source, /writeStatsCanonical/)
  assert.doesNotMatch(source, /writeStatsCounterparts/)
})
