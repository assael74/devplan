// src/features/playersDatabase/ui/pages/leaguePage/hooks/useLeagueUrlEditor.test.mjs

import assert from 'node:assert/strict'
import test from 'node:test'
import vm from 'node:vm'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const directory = path.dirname(fileURLToPath(import.meta.url))
const initialRules = {
  configured: true,
  promotion: { directPlaces: [1], playoffPlaces: [] },
  relegation: { directPlaces: [4], playoffPlaces: [] },
}

async function editorEnvironment(options = {}) {
  const slots = []
  let cursor = 0
  const calls = []
  const notices = []
  let reloads = 0
  let props = {
    league: { id: 'l', name: 'League', level: options.leagueLevel || 2 },
    selectedSeasonOption: {
      seasonId: '2026_2027',
      seasonKey: '26/27',
      season: {
        seasonUrl: 'https://old',
        competitionRules: options.initialRules || initialRules,
        table: { teamsById: { a: {}, b: {}, c: {}, d: {} } },
      },
    },
    notify: value => notices.push(structuredClone(value)),
    reload: () => {
      reloads += 1
      if (options.reloadFailure) throw new Error('reload offline')
    },
  }
  const context = vm.createContext({})
  const modules = new Map()
  const synthetic = (key, values) => {
    if (!modules.has(key))
      modules.set(
        key,
        new vm.SyntheticModule(
          Object.keys(values),
          function () {
            for (const [name, value] of Object.entries(values))
              this.setExport(name, value)
          },
          { context },
        ),
      )
    return modules.get(key)
  }
  const load = async filename => {
    if (!modules.has(filename))
      modules.set(
        filename,
        new vm.SourceTextModule(await fs.readFile(filename, 'utf8'), {
          context,
          identifier: filename,
        }),
      )
    return modules.get(filename)
  }
  const hookModule = await load(path.join(directory, 'useLeagueUrlEditor.js'))
  await hookModule.link(async (specifier, parent) => {
    if (specifier === 'react')
      return synthetic('react', {
        useState: initial => {
          const index = cursor++
          if (!(index in slots)) slots[index] = initial
          return [
            slots[index],
            value => {
              slots[index] = typeof value === 'function' ? value(slots[index]) : value
            },
          ]
        },
      })
    if (specifier.includes('snackbar.model'))
      return synthetic('snack', {
        SNACK_STATUS: { SUCCESS: 'success', ERROR: 'error' },
      })
    if (specifier.includes('/write/league/edits/')) {
      const fileName = path.basename(specifier, '.js')
      const name = fileName === 'updateCompetitionRules'
        ? 'updateLeagueCompetitionRules'
        : fileName === 'updateSeasonUrl'
          ? 'updateLeagueSeasonUrl'
          : fileName
      return synthetic(name, {
        [name]: async input => {
          calls.push({ name, input: structuredClone(input) })
          if (options.waitForWrite) await options.waitForWrite
          if (options.fail === name) throw new Error(`${name} rejected`)
          return { completed: true, changedCount: 1 }
        },
      })
    }
    return load(path.resolve(path.dirname(parent.identifier), specifier))
  })
  await hookModule.evaluate()
  const render = () => {
    cursor = 0
    return hookModule.namespace.default(props)
  }
  render().show()
  return {
    render,
    calls,
    notices,
    reloads: () => reloads,
    replaceProps: changes => {
      props = { ...props, ...changes }
    },
  }
}

test('Opening and unchanged save do not call the service', async () => {
  const env = await editorEnvironment({ initialRules: { configured: true } })
  assert.equal(env.render().urlDirty, false)
  assert.equal(env.render().rulesDirty, false)
  await env.render().save()
  assert.deepEqual(env.calls, [])
})

test('URL-only save omits rules and preserves the original rule draft', async () => {
  const env = await editorEnvironment()
  env.render().changeUrl('')
  await env.render().save()
  assert.deepEqual(env.calls, [{
    name: 'updateLeagueSeasonSettings',
    input: { leagueId: 'l', seasonId: '2026_2027', seasonUrl: '' },
  }])
  assert.equal(env.render().urlDirty, false)
  assert.equal(env.render().rulesDirty, false)
  assert.equal(env.render().draftRules.promotionDirectPlaces, '1')
  assert.equal(env.reloads(), 0)
})

test('Rules-only save omits URL and updates the saved rule baseline', async () => {
  const env = await editorEnvironment()
  env.render().changeRule('promotionDirectPlaces', '2')
  await env.render().save()
  assert.equal(env.calls.length, 1)
  assert.equal(env.calls[0].name, 'updateLeagueSeasonSettings')
  assert.deepEqual(Object.keys(env.calls[0].input).sort(), [
    'competitionRules', 'leagueId', 'seasonId',
  ])
  assert.deepEqual(env.calls[0].input.competitionRules.promotion.directPlaces, [1, 2])
  assert.equal(env.render().draftUrl, 'https://old')
  assert.equal(env.render().rulesDirty, false)
  await env.render().save()
  assert.equal(env.calls.length, 1)
})

test('Combined save submits one operation and clears both dirty states', async () => {
  const env = await editorEnvironment()
  env.render().changeUrl(' https://new ')
  env.render().changeRule('relegationPlayoffPlaces', '1')
  await env.render().save()
  assert.equal(env.calls.length, 1)
  assert.equal(env.calls[0].input.seasonUrl, 'https://new')
  assert.deepEqual(env.calls[0].input.competitionRules.relegation.playoffPlaces, [3])
  assert.equal(env.render().urlDirty, false)
  assert.equal(env.render().rulesDirty, false)
  assert.equal(env.render().open, true)
  assert.equal(env.notices.length, 1)
  assert.equal(env.notices[0].status, 'success')
})

test('Invalid URL or rules block the entire save before writing', async () => {
  for (const invalidField of ['url', 'rules']) {
    const env = await editorEnvironment()
    env.render().changeUrl(invalidField === 'url' ? 'invalid' : 'https://new')
    env.render().changeRule('promotionDirectPlaces', invalidField === 'rules' ? '-1' : '2')
    await env.render().save()
    assert.equal(env.calls.length, 0)
  }
})

test('Opening a top league with legacy promotion rules does not mark rules as changed', async () => {
  const env = await editorEnvironment({ leagueLevel: 1 })
  assert.equal(env.render().draftRules.promotionDirectPlaces, '0')
  assert.equal(env.render().rulesDirty, false)
  await env.render().save()
  assert.deepEqual(env.calls, [])
})

test('Top-league URL-only save omits rules even with legacy promotion values', async () => {
  const env = await editorEnvironment({ leagueLevel: 1 })
  env.render().changeUrl('https://new')
  await env.render().save()
  assert.deepEqual(env.calls, [{
    name: 'updateLeagueSeasonSettings',
    input: { leagueId: 'l', seasonId: '2026_2027', seasonUrl: 'https://new' },
  }])
  assert.equal(env.render().rulesDirty, false)
})

test('An explicit top-league rule edit still saves empty promotion places', async () => {
  const env = await editorEnvironment({ leagueLevel: 1 })
  env.render().changeRule('relegationDirectPlaces', '2')
  await env.render().save()
  assert.deepEqual(env.calls[0].input.competitionRules.promotion.directPlaces, [])
  assert.deepEqual(env.calls[0].input.competitionRules.promotion.playoffPlaces, [])
  assert.deepEqual(env.calls[0].input.competitionRules.relegation.directPlaces, [3, 4])
  assert.equal('seasonUrl' in env.calls[0].input, false)
})

test('Failed combined write retains both drafts for retry and reloads once', async () => {
  const env = await editorEnvironment({ fail: 'updateLeagueSeasonSettings' })
  env.render().changeUrl('https://new')
  env.render().changeRule('promotionDirectPlaces', '2')
  await env.render().save()
  const editor = env.render()
  assert.equal(editor.urlDirty, true)
  assert.equal(editor.rulesDirty, true)
  assert.equal(editor.draftUrl, 'https://new')
  assert.equal(editor.draftRules.promotionDirectPlaces, '2')
  assert.match(editor.urlError, /rejected/)
  assert.match(editor.rulesError, /rejected/)
  assert.equal(editor.open, true)
  assert.equal(editor.saving, false)
  assert.equal(env.reloads(), 1)
})

test('Saving blocks another save, changes and closing until the write finishes', async () => {
  let finish
  const waitForWrite = new Promise(resolve => { finish = resolve })
  const env = await editorEnvironment({ waitForWrite })
  env.render().changeUrl('https://new')
  const pending = env.render().save()
  const editor = env.render()
  assert.equal(editor.saving, true)
  await editor.save()
  editor.changeUrl('https://ignored')
  editor.changeRule('promotionDirectPlaces', '3')
  editor.close()
  assert.equal(env.calls.length, 1)
  assert.equal(env.render().open, true)
  assert.equal(env.render().draftUrl, 'https://new')
  assert.equal(env.render().draftRules.promotionDirectPlaces, '1')
  finish()
  await pending
  assert.equal(env.render().saving, false)
})

test('Successful save needs no reload because the League cache is write-through', async () => {
  const env = await editorEnvironment({ reloadFailure: true })
  env.render().changeUrl('https://new')
  await env.render().save()
  assert.equal(env.render().urlDirty, false)
  assert.equal(env.render().urlError, '')
  assert.equal(env.notices[0].status, 'success')
  assert.equal(env.reloads(), 0)
})

test('Failed recovery reload preserves unsaved changes and reports the error', async () => {
  const env = await editorEnvironment({ fail: 'updateLeagueSeasonSettings', reloadFailure: true })
  env.render().changeUrl('https://new')
  await env.render().save()
  assert.equal(env.render().urlDirty, true)
  assert.match(env.render().urlError, /רענון התצוגה נכשל/)
  assert.equal(env.render().saving, false)
})
