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
    league: { id: 'l', name: 'League', level: 2 },
    selectedSeasonOption: {
      seasonKey: '26/27',
      season: {
        seasonUrl: 'https://old',
        competitionRules: options.initialRules || initialRules,
        tableRank: [{}, {}, {}, {}],
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
    if (specifier.includes('/writeV2/edits/')) {
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

test('Opening and unchanged save clicks do not call either service', async () => {
  const env = await editorEnvironment({ initialRules: { configured: true } })
  const editor = env.render()
  assert.equal(editor.urlDirty, false)
  assert.equal(editor.rulesDirty, false)
  await editor.saveUrl()
  await editor.saveRules()
  assert.deepEqual(env.calls, [])
})

test('URL save sends only URL identity and preserves the unsaved rules draft across reload', async () => {
  const env = await editorEnvironment()
  env.render().changeRule('promotionDirectPlaces', '2')
  env.render().changeUrl('https://new')
  await env.render().saveUrl()
  env.replaceProps({
    selectedSeasonOption: {
      seasonKey: '26/27',
      season: { seasonUrl: 'https://new', competitionRules: initialRules },
    },
  })
  const editor = env.render()
  assert.deepEqual(env.calls, [
    {
      name: 'updateLeagueSeasonUrl',
      input: {
        leagueId: 'l',
        seasonKey: '26/27',
        seasonUrl: 'https://new',
      },
    },
  ])
  assert.equal(editor.open, true)
  assert.equal(editor.urlDirty, false)
  assert.equal(editor.rulesDirty, true)
  assert.equal(editor.draftRules.promotionDirectPlaces, '2')
  assert.equal(env.reloads(), 1)
})

test('Invalid rule input cannot block a valid URL save', async () => {
  const env = await editorEnvironment()
  env.render().changeRule('promotionDirectPlaces', '-1')
  env.render().changeUrl('')
  assert.equal(env.render().rulesValid, false)
  await env.render().saveUrl()
  assert.equal(env.calls[0].name, 'updateLeagueSeasonUrl')
  assert.equal(env.render().urlError, '')
})

test('Rules save sends no URL and preserves its unsaved draft', async () => {
  const env = await editorEnvironment()
  env.render().changeUrl('https://draft')
  env.render().changeRule('promotionDirectPlaces', '2')
  await env.render().saveRules()
  assert.equal(env.calls.length, 1)
  assert.equal(env.calls[0].name, 'updateLeagueCompetitionRules')
  assert.deepEqual(Object.keys(env.calls[0].input).sort(), [
    'competitionRules',
    'leagueId',
    'seasonKey',
  ])
  assert.equal(env.render().urlDirty, true)
  assert.equal(env.render().draftUrl, 'https://draft')
  assert.equal(env.render().rulesDirty, false)
  await env.render().saveRules()
  assert.equal(env.calls.length, 1)
})

test('Rules failure leaves successful URL state and messages intact', async () => {
  const env = await editorEnvironment({ fail: 'updateLeagueCompetitionRules' })
  env.render().changeUrl('https://new')
  await env.render().saveUrl()
  const urlNotice = structuredClone(env.notices[0])
  env.render().changeRule('promotionDirectPlaces', '2')
  await env.render().saveRules()
  const editor = env.render()
  assert.equal(editor.urlError, '')
  assert.equal(editor.urlDirty, false)
  assert.equal(editor.draftUrl, 'https://new')
  assert.match(editor.rulesError, /rejected/)
  assert.equal(editor.rulesDirty, true)
  assert.deepEqual(env.notices[0], urlNotice)
  assert.match(env.notices[1].title, /חוקי התחרות/)
  assert.equal(editor.open, true)
})

test('URL failure does not change rules state or its messages', async () => {
  const env = await editorEnvironment({ fail: 'updateLeagueSeasonUrl' })
  env.render().changeRule('promotionDirectPlaces', '2')
  env.render().changeUrl('https://new')
  await env.render().saveUrl()
  assert.equal(env.render().rulesError, '')
  assert.equal(env.render().rulesDirty, true)
  assert.match(env.render().urlError, /rejected/)
  assert.equal(env.render().urlDirty, true)
})

test('One section saves at a time; loading belongs only to that section', async () => {
  let finish
  const waitForWrite = new Promise(resolve => {
    finish = resolve
  })
  const env = await editorEnvironment({ waitForWrite })
  env.render().changeUrl('https://new')
  env.render().changeRule('promotionDirectPlaces', '2')
  const pending = env.render().saveUrl()
  const editor = env.render()
  assert.equal(editor.urlSaving, true)
  assert.equal(editor.rulesSaving, false)
  await editor.saveRules()
  editor.close()
  assert.equal(env.calls.length, 1)
  assert.equal(env.render().open, true)
  finish()
  await pending
  assert.equal(env.render().saving, false)
})

test('Reload failure after commit does not dirty or roll back the saved section', async () => {
  const env = await editorEnvironment({ reloadFailure: true })
  env.render().changeUrl('https://new')
  await env.render().saveUrl()
  assert.equal(env.render().urlDirty, false)
  assert.match(env.render().urlError, /השמירה הצליחה/)
  assert.equal(env.render().rulesError, '')
  assert.equal(env.notices[0].status, 'success')
})
