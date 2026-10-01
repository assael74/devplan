// src/features/playersDatabase/ui/pages/playerPage/hooks/usePlayerPage.refresh.test.mjs
import assert from 'node:assert/strict'
import test from 'node:test'
import vm from 'node:vm'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), 'usePlayerPage.js')
let context

const synthetic = (name, exports) => new vm.SyntheticModule(
  Object.keys(exports),
  function setExports() {
    Object.entries(exports).forEach(([key, value]) => this.setExport(key, value))
  },
  { identifier: name, context }
)

async function load() {
  const calls = []
  const slots = []
  let cursor = 0
  let playerId = 'player-a'
  context = vm.createContext({ console, URLSearchParams })
  const module = new vm.SourceTextModule(await fs.readFile(file, 'utf8'), {
    context,
    identifier: file,
  })

  await module.link(async specifier => {
    if (specifier === 'react') {
      return synthetic('react', {
        useState: initial => {
          const index = cursor++
          if (!(index in slots)) slots[index] = initial
          return [slots[index], value => {
            slots[index] = typeof value === 'function' ? value(slots[index]) : value
          }]
        },
        useEffect: effect => { effect() },
        useMemo: factory => factory(),
        useCallback: callback => callback,
      })
    }
    if (specifier === 'react-router-dom') {
      return synthetic('router', {
        useLocation: () => ({ state: null }),
        useNavigate: () => () => {},
        useParams: () => ({ playerId }),
        useSearchParams: () => [new URLSearchParams()],
      })
    }
    if (specifier.includes('playerPage.model')) {
      return synthetic('player-page-model', {
        buildPlayerPageView: () => null,
        buildEmptyPlayerPageView: id => ({ playerId: id, seasonContexts: [] }),
      })
    }
    if (specifier.includes('seasons.catalog')) {
      return synthetic('seasons', { PLAYERS_DATABASE_CURRENT_SEASON_KEY: '26/27' })
    }
    if (specifier.includes('season.model')) {
      return synthetic('season-model', { normalizeSeasonLookupKey: value => value || '' })
    }
    if (specifier.includes('services/read/index.js')) {
      return synthetic('read', {
        readClubPageDocument: async () => null,
        readPlayerPageData: async args => { calls.push({ ...args }); return null },
      })
    }
    if (specifier.includes('services/cache/index.js')) {
      return synthetic('cache', { buildPlayerDocumentCacheKey: id => `player:${id}` })
    }
    if (specifier.includes('usePlayersDatabaseReadStoreEntry')) {
      return synthetic('store-hook', {
        default: () => ({ data: null, status: 'ready', error: null, refreshError: null }),
      })
    }
    if (specifier.includes('routeBuilders')) {
      return synthetic('routes', {
        PLAYERS_DATABASE_UI_ROUTES: { player: () => '/player' },
      })
    }
    throw new Error(specifier)
  })

  await module.evaluate()

  return {
    calls,
    render(nextPlayerId) {
      playerId = nextPlayerId
      cursor = 0
      return module.namespace.usePlayerPage()
    },
  }
}

test('Player reload is direct and does not survive A -> B -> A navigation', async () => {
  const harness = await load()

  const first = harness.render('player-a')
  await first.reload()
  harness.render('player-b')
  harness.render('player-a')

  assert.deepEqual(harness.calls, [
    { playerId: 'player-a' },
    { playerId: 'player-a', refresh: true },
    { playerId: 'player-b' },
    { playerId: 'player-a' },
  ])
})
