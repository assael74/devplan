// src/features/playersDatabase/ui/pages/teamPage/hooks/useTeamPage.refresh.test.mjs
import assert from 'node:assert/strict'
import test from 'node:test'
import vm from 'node:vm'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), 'useTeamPage.js')
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
  let params = { leagueId: 'league-a', teamId: 'team-a' }
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
        useLocation: () => ({ pathname: '/team', state: null }),
        useNavigate: () => () => {},
        useParams: () => params,
        useSearchParams: () => [new URLSearchParams()],
      })
    }
    if (specifier.includes('teamPageView.model')) {
      return synthetic('team-view', { buildTeamPageView: () => ({}) })
    }
    if (specifier.includes('teamPageSeason.model')) {
      return synthetic('team-season', {
        buildTeamPageSeasonOptions: () => [],
        findTeamPageLeagueSeasonDoc: () => null,
        findTeamPageSeasonDoc: () => null,
      })
    }
    if (specifier.includes('teamPagePlayer.model')) {
      return synthetic('team-player', { adaptTeamPagePlayerRow: value => value })
    }
    if (specifier.includes('seasons.catalog')) {
      return synthetic('seasons', { PLAYERS_DATABASE_CURRENT_SEASON_KEY: '26/27' })
    }
    if (specifier.includes('services/read/index.js')) {
      return synthetic('read', {
        readClubPageDocument: async () => null,
        readTeamPageData: async args => { calls.push({ ...args }); return null },
      })
    }
    if (specifier.includes('services/cache/index.js')) {
      return synthetic('cache', {
        buildTeamPageDataCacheKey: ({ leagueId, teamId }) => `teamPage:${leagueId}:${teamId}`,
      })
    }
    if (specifier.includes('usePlayersDatabaseReadStoreEntry')) {
      return synthetic('store-hook', {
        default: () => ({ data: null, status: 'ready', error: null, refreshError: null }),
      })
    }
    if (specifier.includes('routeBuilders')) {
      return synthetic('routes', {
        PLAYERS_DATABASE_UI_ROUTES: { team: () => '/team' },
      })
    }
    throw new Error(specifier)
  })

  await module.evaluate()

  return {
    calls,
    render(leagueId, teamId) {
      params = { leagueId, teamId }
      cursor = 0
      return module.namespace.useTeamPage()
    },
  }
}

test('Team reload is direct and does not survive A -> B -> A navigation', async () => {
  const harness = await load()

  const first = harness.render('league-a', 'team-a')
  await first.reload()
  harness.render('league-b', 'team-b')
  harness.render('league-a', 'team-a')

  assert.deepEqual(harness.calls, [
    { leagueId: 'league-a', teamId: 'team-a' },
    { leagueId: 'league-a', teamId: 'team-a', rebuildFromCache: true },
    { leagueId: 'league-b', teamId: 'team-b' },
    { leagueId: 'league-a', teamId: 'team-a' },
  ])
})
