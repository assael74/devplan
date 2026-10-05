import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const directory = path.dirname(fileURLToPath(import.meta.url))

async function environment(items = [], playerItems = []) {
  const store = {
    'dbFavorites/birthTeams': { items: structuredClone(items), keep: true },
    'dbFavorites/players': { items: structuredClone(playerItems), keep: true },
  }
  const context = vm.createContext({ console })
  const modules = new Map()
  let writes = 0
  const snapshot = ref => ({
    exists: () => Boolean(store[ref.path]),
    data: () => structuredClone(store[ref.path]),
  })
  const synthetic = (id, exports) => {
    if (!modules.has(id)) {
      modules.set(id, new vm.SyntheticModule(
        Object.keys(exports),
        function () {
          Object.entries(exports).forEach(([key, value]) => this.setExport(key, value))
        },
        { context, identifier: id },
      ))
    }
    return modules.get(id)
  }
  const load = async filename => {
    if (modules.has(filename)) return modules.get(filename)
    const module = new vm.SourceTextModule(await fs.readFile(filename, 'utf8'), {
      context,
      identifier: filename,
    })
    modules.set(filename, module)
    return module
  }
  const linker = async (specifier, parent) => {
    if (specifier === 'firebase/firestore') {
      return synthetic(specifier, {
        doc: (_db, collection, id) => ({ path: `${collection}/${id}` }),
        serverTimestamp: () => 'server-time',
        Timestamp: { now: () => 'created-time' },
      })
    }
    if (specifier.endsWith('/services/firebase/firebase.js')) {
      return synthetic('db', { db: {} })
    }
    if (specifier.endsWith('/services/firestore/usage/index.js')) {
      return synthetic('usage', {
        trackedRunTransaction: async (_db, callback) => callback({
          get: async ref => snapshot(ref),
          set: (ref, patch) => {
            writes += 1
            store[ref.path] = { ...(store[ref.path] || {}), ...structuredClone(patch) }
          },
        }),
      })
    }
    return load(path.resolve(path.dirname(parent.identifier), specifier))
  }
  const action = async (file, name) => {
    const module = await load(path.join(directory, file))
    if (module.status === 'unlinked') await module.link(linker)
    if (module.status !== 'evaluated') await module.evaluate()
    return module.namespace[name]
  }

  return {
    store,
    writes: () => writes,
    add: await action('add.js', 'addBirthTeamFavorite'),
    remove: await action('remove.js', 'removeBirthTeamFavorite'),
    addPlayer: await action('../player/add.js', 'addPlayerFavorite'),
    removePlayer: await action('../player/remove.js', 'removePlayerFavorite'),
  }
}

test('adds one birth-team favorite and preserves unrelated document fields', async () => {
  const env = await environment()
  const favorite = await env.add({
    entityId: 'team-1',
    displayName: 'Team 1',
    birthYear: 2012,
  })
  assert.equal(favorite.entityId, 'team-1')
  assert.equal(env.store['dbFavorites/birthTeams'].items.length, 1)
  assert.equal(env.store['dbFavorites/birthTeams'].keep, true)
  assert.equal(env.store['dbFavorites/birthTeams'].updatedAt, 'server-time')
  await env.add({ entityId: 'team-1', displayName: 'Team 1', birthYear: 2012 })
  assert.equal(env.writes(), 1)
})

test('removes only the selected birth-team favorite', async () => {
  const env = await environment([
    { entityId: 'team-1', displayName: 'Team 1', createdAt: 'old' },
    { entityId: 'team-2', displayName: 'Team 2', createdAt: 'old' },
  ])
  const result = await env.remove({ entityId: 'team-1' })
  assert.equal(result.entityId, 'team-1')
  assert.equal(result.removed, true)
  assert.deepEqual(
    env.store['dbFavorites/birthTeams'].items.map(item => item.entityId),
    ['team-2'],
  )
  await env.remove({ entityId: 'missing' })
  assert.equal(env.writes(), 1)
})

test('player favorite writes only the Favorites document', async () => {
  const env = await environment()
  await env.addPlayer({
    entityId: 'player-1',
    displayName: 'Player 1',
    birthYear: 2010,
  })
  assert.equal(env.store['dbFavorites/players'].items[0].entityId, 'player-1')
  assert.equal(env.store['dbPlayers/player-1'], undefined)
  const removed = await env.removePlayer({ entityId: 'player-1' })
  assert.equal(removed.removed, true)
  assert.equal(env.store['dbFavorites/players'].items.length, 0)
  assert.equal(env.store['dbPlayers/player-1'], undefined)
})
