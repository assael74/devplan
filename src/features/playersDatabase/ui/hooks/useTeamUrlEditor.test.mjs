import assert from 'node:assert/strict'
import test from 'node:test'
import vm from 'node:vm'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const directory = path.dirname(fileURLToPath(import.meta.url))
const hookPath = path.join(directory, 'useTeamUrlEditor.js')

let context
const synthetic = (name, exports) => {
  const module = new vm.SyntheticModule(Object.keys(exports), function () {
    Object.entries(exports).forEach(([key, value]) => this.setExport(key, value))
  }, { identifier: name, context })
  return module
}

test('Historical team season sends its own leagueId instead of route leagueId', async () => {
  const calls = []
  const slots = []
  let cursor = 0
  context = vm.createContext({ console, structuredClone })
  const hookModule = new vm.SourceTextModule(await fs.readFile(hookPath, 'utf8'), {
    context,
    identifier: hookPath,
  })
  await hookModule.link(async specifier => {
    if (specifier === 'react') {
      return synthetic('react', {
        useState: initial => {
          const index = cursor++
          if (!(index in slots)) slots[index] = initial
          return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value }]
        },
        useCallback: fn => fn,
      })
    }
    if (specifier.includes('/writeV2/edits/team/updateSeasonUrl.js')) {
      return synthetic('write', {
        updateTeamSeasonUrl: async input => { calls.push(structuredClone(input)); return { completed: true } },
      })
    }
    if (specifier === './saveEditor.js') {
      return synthetic('saveEditor', {
        saveEditor: async ({ write, reload, close, setSaving }) => {
          setSaving(true)
          await write()
          await reload()
          close()
          setSaving(false)
        },
      })
    }
    throw new Error(`Unexpected import: ${specifier}`)
  })
  await hookModule.evaluate()

  const props = {
    leagueId: 'route-league',
    selectedSeasonOption: { seasonKey: '25/26', leagueId: 'historical-league' },
    notify: () => {},
    reload: async () => {},
  }
  const render = () => {
    cursor = 0
    return hookModule.namespace.default(props)
  }
  render().open({ birthTeamId: 'team-1', birthTeamDocumentId: 'team-doc-1' })
  await render().save('https://example.com/team')

  assert.equal(calls.length, 1)
  assert.equal(calls[0].leagueId, 'historical-league')
  assert.equal(calls[0].seasonKey, '25/26')
})
