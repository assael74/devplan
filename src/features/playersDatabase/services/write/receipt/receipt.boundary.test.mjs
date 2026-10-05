// src/features/playersDatabase/services/write/receipt/receipt.boundary.test.mjs

import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const featureRoot = new URL('../../../', import.meta.url)
const read = relativePath => readFile(new URL(relativePath, featureRoot), 'utf8')

const activeOrchestrators = [
  'services/write/club/clubBootstrapOrchestrator.js',
  'services/write/league/leagueWriteOrchestrator.js',
  'services/write/roster/rosterWriteOrchestrator.js',
  'services/write/stats/statsWriteOrchestrator.js',
  'services/write/stats/statsClearOrchestrator.js',
]

test('all active receipt flows use the canonical receipt service', async () => {
  for (const file of activeOrchestrators) {
    const source = await read(file)

    assert.match(source, /openWriteActionReceipt/)
    assert.match(source, /services\/write\/receipt|\.\.\/receipt/)
    assert.doesNotMatch(source, /writeV2|writeActionsV2|dbWriteActionsV2/)
  }
})

test('the active collection map and receipt repository expose only dbWriteActions', async () => {
  const constants = await read('constants/pdb.constants.js')
  const repository = await read('services/write/receipt/repository.js')

  assert.match(constants, /writeActions: 'dbWriteActions'/)
  assert.doesNotMatch(constants, /writeActionsV2|dbWriteActionsV2/)
  assert.match(repository, /PLAYERS_DATABASE_COLLECTIONS\.writeActions/)
  assert.doesNotMatch(repository, /writeActionsV2|dbWriteActionsV2/)
})

test('WriteAction catalog matches supported actions and standalone edits have no receipt', async () => {
  const catalog = await read('catalog/firestoreDocuments/writeAction.catalog.js')
  const editContract = await read('md/contracts/STANDALONE_EDITS_CONTRACT.md')
  const editWriter = await read('services/write/shared/manualEdit.write.js')

  assert.match(catalog, /clubsBootstrap: \[/)
  assert.doesNotMatch(catalog, /^\s+edit: \[/m)
  assert.match(editContract, /אין Receipt/)
  assert.doesNotMatch(editWriter, /openWriteActionReceipt|services\/write\/receipt/)
})
