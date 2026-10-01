// src/features/playersDatabase/ui/hooks/saveEditor.test.mjs

import assert from 'node:assert/strict'
import test from 'node:test'
import vm from 'node:vm'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const directory = path.dirname(fileURLToPath(import.meta.url))
const file = path.join(directory, 'saveEditor.js')

async function loadSaveEditor() {
  const context = vm.createContext({})
  const module = new vm.SourceTextModule(await fs.readFile(file, 'utf8'), {
    context,
    identifier: file,
  })
  await module.link(async specifier => {
    if (specifier.includes('snackbar.model')) {
      return new vm.SyntheticModule(
        ['SNACK_STATUS'],
        function () {
          this.setExport('SNACK_STATUS', { SUCCESS: 'success', ERROR: 'error' })
        },
        { context },
      )
    }
    throw new Error(`Unexpected import: ${specifier}`)
  })
  await module.evaluate()
  return module.namespace.saveEditor
}

test('successful write can skip reload when cache write-through is authoritative', async () => {
  const saveEditor = await loadSaveEditor()
  let reloads = 0
  let closed = false
  await saveEditor({
    write: async () => ({ completed: true }),
    reload: async () => { reloads += 1 },
    reloadAfterSuccess: false,
    notify: () => {},
    close: () => { closed = true },
    setSaving: () => {},
    title: 'saved',
  })
  assert.equal(reloads, 0)
  assert.equal(closed, true)
})

test('failed write still performs recovery reload', async () => {
  const saveEditor = await loadSaveEditor()
  let reloads = 0
  await saveEditor({
    write: async () => { throw new Error('failed') },
    reload: async () => { reloads += 1 },
    reloadAfterSuccess: false,
    notify: () => {},
    close: () => {},
    setSaving: () => {},
    title: 'saved',
  })
  assert.equal(reloads, 1)
})
