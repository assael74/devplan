// src/features/playersDatabase/services/audit/auditUi.boundary.test.mjs

import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const featureRoot = new URL('../../', import.meta.url)
const read = path => readFile(new URL(path, featureRoot), 'utf8')

test('the active audit UI uses only canonical read-only audits', async () => {
  const sources = await Promise.all([
    read('ui/pages/searchPage/SearchPage.js'),
    read('ui/pages/searchPage/hooks/useCanonicalSearchAudit.js'),
    read('ui/components/modals/CanonicalAuditModal.js'),
    read('ui/components/modals/index.js'),
  ])
  const activeSource = sources.join('\n')

  assert.doesNotMatch(activeSource, /services\/(auditV2|writeV2)/)
  assert.doesNotMatch(activeSource, /reconcile|persistWriteActionAudit|ReceiptV2|StatsV2/)
  assert.match(activeSource, /services\/audit\/league\/index\.js/)
  assert.match(activeSource, /services\/audit\/stats\/index\.js/)
  assert.match(activeSource, /services\/audit\/system\/index\.js/)
})

test('canonical audit entrypoints do not import write services', async () => {
  const sources = await Promise.all([
    read('services/audit/league/index.js'),
    read('services/audit/roster/index.js'),
    read('services/audit/stats/index.js'),
    read('services/audit/system/index.js'),
    read('services/audit/system/readActual.js'),
  ])

  sources.forEach(source => {
    assert.doesNotMatch(source, /services\/write|writeV2|updateDoc|setDoc|runTransaction/)
  })
})

test('the system audit uses canonical collections and exposes no repair action', async () => {
  const sources = await Promise.all([
    read('services/audit/system/readActual.js'),
    read('services/audit/system/evaluate.js'),
    read('ui/pages/searchPage/hooks/useCanonicalSearchAudit.js'),
    read('ui/components/modals/CanonicalAuditModal.js'),
  ])
  const source = sources.join('\n')

  assert.doesNotMatch(source, /clubsMaster|leaguesMaster|writeActionsV2|playerDocumentId/)
  assert.doesNotMatch(source, /onRepair|runRepair|repairFinding|תיקון אוטומטי/)
  assert.match(source, /playerRoots/)
  assert.match(source, /playerSearchIndexes/)
})
